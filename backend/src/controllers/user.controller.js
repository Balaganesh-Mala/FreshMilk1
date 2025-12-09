import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

// ⭐ Admin - Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ success: true, users });
});

// 👤 Get My Profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) throw new Error("User not found");

  res.status(200).json({
    success: true,
    user,
  });
});

// ✏ Update Profile
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
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      addresses: user.addresses,
    },
  });
});

// 💖 Add to Wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);

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

// 💔 Remove from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);

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

// 🏠 Add or Update Address
export const updateAddress = asyncHandler(async (req, res) => {
  const { street, city, state, pincode, phone } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error("User not found");

  let updatedAddress;

  if (user.addresses.length === 0) {
    updatedAddress = { street, city, state, pincode, phone };
    user.addresses.push(updatedAddress);
  } else {
    updatedAddress = user.addresses[0];
    updatedAddress.street = street || updatedAddress.street;
    updatedAddress.city = city || updatedAddress.city;
    updatedAddress.state = state || updatedAddress.state;
    updatedAddress.pincode = pincode || updatedAddress.pincode;
    updatedAddress.phone = phone || updatedAddress.phone;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    address: updatedAddress,
  });
});
