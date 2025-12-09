import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadMultipleToCloudinary } from "../middleware/upload.middleware.js";

//
//  CREATE PRODUCT
//
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      mrp,
      weight,
      flavor,
      category,
      brand,
      isFeatured,
      isBestSeller,
      variants,
      isSubscriptionAvailable,
      expiryDate
    } = req.body;

    if (!name || !description || !price || !category) {
      res.status(400);
      throw new Error("Required fields missing");
    }

    // Parse variants if sent as JSON string (common in frontend forms)
    let parsedVariants = [];
    if (variants) {
      parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    // Upload product images (cloudinary)
    let imageData = [];
    if (req.files && req.files.length > 0) {
      imageData = await uploadMultipleToCloudinary(req.files, "products");
    }

    // Auto-generate SKU => MILK-000123
    const sku = `MILK-${Date.now().toString().slice(-6)}`;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      mrp,
      weight,
      flavor,
      category,
      brand,
      isFeatured,
      isBestSeller,
      variants: parsedVariants,
      sku,
      expiryDate,
      isSubscriptionAvailable,
      images: imageData
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });

  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});


//
//  GET ALL PRODUCTS
//

export const getAllProducts = asyncHandler(async (req, res) => {
  const { search, category, featured, bestseller, flavor, subscription, sort } = req.query;

  let query = {};

  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  if (featured) query.isFeatured = featured === "true";
  if (bestseller) query.isBestSeller = bestseller === "true";
  if (flavor) query.flavor = { $regex: flavor, $options: "i" };
  if (subscription) query.isSubscriptionAvailable = subscription === "true";

  let dbQuery = Product.find(query).populate("category", "name");

  // Sorting (variant based or normal)
  if (sort === "low-high") dbQuery.sort({ price: 1 });
  if (sort === "high-low") dbQuery.sort({ price: -1 });

  // Default sorting latest
  if (!sort) dbQuery.sort({ createdAt: -1 });

  const products = await dbQuery;

  res.status(200).json({
    success: true,
    products
  });
});



//
// GET PRODUCT BY ID
//
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json({ success: true, product });
});

//
//  UPDATE PRODUCT
//
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // New image upload logic
  if (req.files && req.files.length > 0) {
    // Delete old Cloudinary images
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    // Upload new images
    const newImageData = await uploadMultipleToCloudinary(req.files, "products");
    product.images = newImageData;
  }

  // Update text fields
  const fields = [
    "name",
    "description",
    "price",
    "mrp",
    "stock",
    "category",
    "flavor",
    "weight",
    "brand",
    "isFeatured",
    "isBestSeller",
    "isSubscriptionAvailable",
    "expiryDate"
  ];

  fields.forEach((key) => {
    if (req.body[key] !== undefined) product[key] = req.body[key];
  });

  // Variant update (if provided)
  if (req.body.variants) {
    product.variants =
      typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants;
  }

  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product
  });
});



//
//  DELETE PRODUCT
//
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  for (let img of product.images) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted",
  });
});


export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user purchased and delivered
  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    "orderItems.productId": productId,
    orderStatus: "Delivered",
  });

  if (!deliveredOrder) {
    res.status(400);
    throw new Error("You can review only after delivery");
  }

  // Check duplicate review
  const existing = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existing) {
    res.status(400);
    throw new Error("You already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    createdAt: new Date(),
  };

  product.reviews.push(review);

  // update rating
  product.numOfReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((acc, item) => acc + item.rating, 0) /
    product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review added",
    product, // 👈 send full product to refresh UI
  });
});



export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { productId } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // filter out review
  const updatedReviews = product.reviews.filter(
    (rev) => rev._id.toString() !== reviewId
  );

  if (updatedReviews.length === product.reviews.length) {
    res.status(400);
    throw new Error("Review not found");
  }

  product.reviews = updatedReviews;

  // Update rating + count
  product.numOfReviews = updatedReviews.length;
  product.ratings =
    updatedReviews.reduce((acc, item) => acc + item.rating, 0) /
    (updatedReviews.length || 1);

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    reviews: product.reviews,
  });
});
