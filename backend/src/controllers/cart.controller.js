import asyncHandler from "express-async-handler";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

//
// ⭐ SUPER FAST subtotal using stored price
//
const calculateTotals = (items, deliveryCharge = 0) => {
  const subtotal = items.reduce((sum, item) => {
    if (!item || !item.quantity || !item.price) return sum;
    return sum + item.price * item.quantity;
  }, 0);

  return {
    subtotal,
    grandTotal: subtotal + deliveryCharge,
  };
};

//
// 🛒 Add item to cart
//
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant, isSubscription = false } = req.body;

  if (!productId || quantity <= 0) {
    res.status(400);
    throw new Error("Valid product & quantity required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // determine price based on selected variant or base price
  let selectedPrice = product.price;

  if (variant && product.variants?.length > 0) {
    const selectedVariant = product.variants.find((v) => v.size === variant.size);
    if (selectedVariant) selectedPrice = selectedVariant.price;
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  // check already exists (same product + same variant)
  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.size === (variant?.size || null)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.total = existingItem.quantity * existingItem.price;
  } else {
    cart.items.push({
      product: productId,
      productName: product.name,
      productImage: product.images?.[0]?.url,
      quantity,
      price: selectedPrice,
      total: selectedPrice * quantity,
      variant: variant || null,
      isSubscription,
    });
  }

  const totals = calculateTotals(cart.items, cart.deliveryCharge);

  cart.subtotal = totals.subtotal;
  cart.grandTotal = totals.grandTotal;

  await cart.save();

  res.json({
    success: true,
    message: "Item added to cart",
    cart,
  });
});

//
// 📋 Get user cart (AUTO CLEANING)
//
export const getUserCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "name price images stock variants");

  if (!cart) {
    return res.json({
      success: true,
      cart: { items: [], subtotal: 0, grandTotal: 0 },
    });
  }

  // Clean invalid items
  cart.items = cart.items.filter((i) => i.product !== null);

  const totals = calculateTotals(cart.items, cart.deliveryCharge);
  cart.subtotal = totals.subtotal;
  cart.grandTotal = totals.grandTotal;

  await cart.save();

  res.json({ success: true, cart });
});


//
// ✏️ Update cart item quantity
//
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity, variantSize } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find(
    (i) =>
      i.product.toString() === productId &&
      i.variant?.size === (variantSize || null)
  );

  if (!item) throw new Error("Item not found");

  if (quantity <= 0) {
    // remove item
    cart.items = cart.items.filter((i) => i !== item);
  } else {
    item.quantity = quantity;
    item.total = item.price * item.quantity;
  }

  const totals = calculateTotals(cart.items, cart.deliveryCharge);
  cart.subtotal = totals.subtotal;
  cart.grandTotal = totals.grandTotal;

  await cart.save();

  res.json({ success: true, message: "Cart updated", cart });
});


//
// ❌ Remove item
//
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, variantSize } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (item) =>
      !(item.product.toString() === productId &&
        item.variant?.size === (variantSize || null))
  );

  const totals = calculateTotals(cart.items, cart.deliveryCharge);
  cart.subtotal = totals.subtotal;
  cart.grandTotal = totals.grandTotal;

  await cart.save();

  res.json({
    success: true,
    message: "Item removed",
    cart,
  });
});


//
// 🧹 Clear entire cart
//
export const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new Error("Cart not found");

  cart.items = [];
  cart.subtotal = 0;
  cart.grandTotal = 0;

  await cart.save();

  res.json({
    success: true,
    message: "Cart cleared",
    cart,
  });
});

