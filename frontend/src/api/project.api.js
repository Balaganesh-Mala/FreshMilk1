import API from "./axios";

/* ---------- AUTH ---------- */
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const fetchProfile = () => API.get("/auth/profile");

/* ---------- CATEGORY ---------- */
export const getCategories = () => API.get("/categories");

/* ---------- PRODUCT ---------- */
export const fetchProducts = (params) => API.get("/products", { params });
export const fetchProductById = (id) => API.get(`/products/${id}`);

/* ---------- CART ---------- */
export const fetchCart = () => API.get("/cart");

export const addToCart = (data) =>
  API.post("/cart/add", data, {
    headers: { "Content-Type": "application/json" },
  });

export const updateCartItem = (data) =>
  API.put("/cart/update", data, {
    headers: { "Content-Type": "application/json" },
  });

export const removeCartItem = (data) =>
  API.delete("/cart/remove", {
    headers: { "Content-Type": "application/json" },
    data,
  });


/* ---------- ORDER ---------- */
export const createOrder = (data) => API.post("/orders", data);
export const getMyOrders = () => API.get("/orders/my-orders");

/* ---------- PAYMENT ---------- */
export const createPaymentOrder = (data) =>
  API.post("/payments/create-order", data);
export const verifyPayment = (data) => API.post("/payments/verify", data);
export const failedPayment = (data) => API.post("/payments/failed", data);
export const getMyPayments = () => API.get("/payments/my-payments");
