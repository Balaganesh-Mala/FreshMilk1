import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// User
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Admin
router.get("/", protect, isAdmin, getAllOrders);
router.put("/:id/status", protect, isAdmin, updateOrderStatus);
router.delete("/:id", protect, isAdmin, deleteOrder);

export default router;
