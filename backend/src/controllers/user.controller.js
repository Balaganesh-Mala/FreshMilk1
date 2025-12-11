import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js"; // for wishlist validation

// =======================================
// ⭐ Admin - Get All Users
// =======================================
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ success: true, users });
});

// =======================================
// 👤 Get Logged In User Profile
// =======================================
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) throw new Error("User not found");

  res.status(200).json({ success: true, user });
});

// =======================================
// ✏️ Update Profile (name, phone)
// =======================================
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) throw new Error("User not found");

  const { name, phone } = req.body;

  // Prevent duplicate phone
  if (phone && phone !== user.phone) {
    const exists = await User.findOne({ phone });
    if (exists) throw new Error("Phone already in use");
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// =======================================
// 🖼 Update Avatar
// =======================================
export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  if (!req.file) {
    throw new Error("Avatar file required");
  }

  // Upload new image
  const upload = await uploadToCloudinary(req.file, "avatars");

  // Delete old one (optional)
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  user.avatar = upload;
  await user.save();

  res.status(200).json({
    success: true,
    avatar: user.avatar,
  });
});

// =======================================
// 💖 Add to Wishlist
// =======================================
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  const productExists = await Product.findById(productId);
  if (!productExists) throw new Error("Product not found");

  if (user.wishlist.includes(productId)) {
    throw new Error("Product already in wishlist");
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to wishlist",
    wishlist: user.wishlist,
  });
});

// =======================================
// 💔 Remove From Wishlist
// =======================================
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from wishlist",
    wishlist: user.wishlist,
  });
});

// =======================================
// 🏠 Add New Address / Update Existing
// =======================================
export const saveAddress = asyncHandler(async (req, res) => {
  const { street, city, state, pincode, phone, isDefault } = req.body;

  let user = await User.findById(req.user.id);

  if (!user) throw new Error("User not found");

  // If no address exists --> push first as default
  if (user.addresses.length === 0) {
    user.addresses.push({
      street,
      city,
      state,
      pincode,
      phone,
      isDefault: true,
    });
  } else {
    // Update first address (simple logic)
    const addr = user.addresses[0];

    addr.street = street || addr.street;
    addr.city = city || addr.city;
    addr.state = state || addr.state;
    addr.pincode = pincode || addr.pincode;
    addr.phone = phone || addr.phone;

    // allow user to switch default
    if (isDefault !== undefined) {
      user.addresses.forEach((a) => (a.isDefault = false));
      addr.isDefault = true;
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address saved successfully",
    addresses: user.addresses,
  });
});

// =======================================
// 🔄 Set Address as Default
// =======================================
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressIndex } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error("User not found");

  if (addressIndex < 0 || addressIndex >= user.addresses.length) {
    throw new Error("Invalid address index");
  }

  user.addresses.forEach((a, i) => {
    a.isDefault = i === addressIndex;
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Default address updated",
    addresses: user.addresses,
  });
});

// =======================================
// 💳 Wallet Management
// =======================================
export const addWalletBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  user.wallet += Number(amount);

  await user.save();

  res.status(200).json({
    success: true,
    message: `₹${amount} added to wallet`,
    wallet: user.wallet,
  });
});

export const deductWalletBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  if (amount > user.wallet) {
    throw new Error("Insufficient wallet balance");
  }

  user.wallet -= Number(amount);
  await user.save();

  res.status(200).json({
    success: true,
    message: `₹${amount} deducted successfully`,
    wallet: user.wallet,
  });
});

// =======================================
// 📌 Add Subscription (from cart/buy now or popup)
// =======================================
export const addSubscription = asyncHandler(async (req, res) => {
  const { productId, variantSize, plan } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  user.subscriptions.push({
    product: productId,
    variantSize,
    plan,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Subscription added",
    subscriptions: user.subscriptions,
  });
});

// =======================================
// 🗑 Cancel Subscription
// =======================================
export const cancelSubscription = asyncHandler(async (req, res) => {
  const { subId } = req.body;

  const user = await User.findById(req.user.id);

  user.subscriptions = user.subscriptions.filter(
    (s) => s._id.toString() !== subId
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: "Subscription cancelled",
  });
});
