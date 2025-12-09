import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { razorpay } from "../config/razorpay.js"; // shared instance

//
// 🔍 Helper 1: Load product details fast
//
const loadProductsMap = async (orderItems) => {
  const ids = orderItems.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids } }).lean();

  const map = new Map();
  products.forEach((p) => map.set(String(p._id), p));
  return map;
};

//
// 🔍 Helper 2: Validate stock + calculate pricing
//
const buildFinalOrderItems = async (orderItems) => {
  const productMap = await loadProductsMap(orderItems);

  let finalItems = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = productMap.get(String(item.productId));

    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (product.stock < item.quantity)
      throw new Error(`Insufficient stock for ${product.name}`);

    finalItems.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      quantity: item.quantity,
      price: product.price,
      variant: item.variant,
      isSubscription: item.isSubscription ?? false,
    });

    itemsPrice += product.price * item.quantity;
  }

  return { finalItems, itemsPrice };
};


//
// 🚀 CREATE ORDER — COD or ONLINE Razorpay
//
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, deliverySlot, subscriptionConfig } = req.body;

  if (!orderItems || !orderItems.length) {
    res.status(400);
    throw new Error("Order items required");
  }

  // Validate product stock + calculate price
  const { finalItems, itemsPrice } = await buildFinalOrderItems(orderItems);

  // 🔹 Razorpay Online Flow
  if (paymentMethod === "online") {
    const options = {
      amount: Math.round(itemsPrice * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    // Order stored as Pending until payment verified
    const order = await Order.create({
      user: req.user._id,
      orderItems: finalItems,
      itemsPrice,
      totalPrice: itemsPrice,
      paymentMethod: "online",
      paymentStatus: "Pending",
      shippingAddress,
      deliverySlot,
      subscriptionConfig,
      orderStatus: "Processing",
    });

    return res.status(200).json({
      success: true,
      message: "Online order initiated",
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: "INR",
      orderId: order._id,
    });
  }

  // 🔹 COD FLOW — immediate order + stock deduction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.create(
      [
        {
          user: req.user._id,
          orderItems: finalItems,
          itemsPrice,
          totalPrice: itemsPrice,
          paymentMethod: "COD",
          paymentStatus: "Pending",
          shippingAddress,
          deliverySlot,
          subscriptionConfig,
          orderStatus: "Processing",
        },
      ],
      { session }
    );

    // Update stock
    const bulkOps = finalItems.map((it) => ({
      updateOne: {
        filter: { _id: it.productId },
        update: { $inc: { stock: -it.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOps, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      order: order[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});


//
// 📦 USER ORDERS
//
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.productId", "name price images");

  res.status(200).json({ success: true, orders });
});


//
// 📦 ADMIN — All Orders
//
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, orders });
});


//
// ✏️ ADMIN — Update order status
//
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;

  if (status === "Delivered") {
    order.paymentStatus = "Paid";
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order updated",
    order,
  });
});


//
// ❌ ADMIN — Delete order
//
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();
  res.status(200).json({ success: true, message: "Order deleted" });
});
