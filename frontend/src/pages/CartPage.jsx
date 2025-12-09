import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from "../api/project.api";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from backend
  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await fetchCart();
      const backendItems = res?.data?.cart?.items;
      setItems(Array.isArray(backendItems) ? backendItems : []);
    } catch (err) {
      console.log("Cart fetch failed", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // calculate total
  const subtotal = items.reduce((sum, i) => sum + (i.total || 0), 0);
  const deliveryCharge = 10;
  const grandTotal = subtotal + deliveryCharge;

  // ⭐ Change quantity locally + backend sync
  const changeQuantity = async (productId, variantSize, delta) => {
    const updatedItems = items.map((item) =>
      item.product?._id === productId &&
      (item.variant?.size || null) === (variantSize || null)
        ? {
            ...item,
            quantity: Math.max(1, item.quantity + delta),
            total: Math.max(1, item.quantity + delta) * item.price,
          }
        : item
    );

    setItems(updatedItems); // fast UI update

    try {
      await updateCartItem({
        productId,
        variantSize,
        quantity: updatedItems.find(
          (i) =>
            i.product._id === productId &&
            (i.variant?.size || null) === (variantSize || null)
        )?.quantity,
      });
    } catch (err) {
      console.log("Qty update failed:", err);
      loadCart(); // refresh accurate data
    }
  };

  // ⭐ Remove item instantly + backend sync
  const deleteItem = async (productId, variantSize) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product._id === productId &&
            (item.variant?.size || null) === (variantSize || null)
          )
      )
    );

    try {
      await removeCartItem({ productId, variantSize });
    } catch (err) {
      console.log("Remove failed", err);
      loadCart();
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading cart...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">Your Cart</h2>

      {!items.length ? (
        <div className="text-center py-16">
          <img src="/empty-cart.png" className="w-48 mx-auto" />
          <p className="text-gray-600">Your cart is empty.</p>
          <Link
            to="/products"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          {/* cart items */}
          <div className="md:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={`${item.product._id}-${item.variant?.size}`}
                className="bg-white p-4 rounded-xl shadow flex gap-4 items-center"
              >
                <img
                  src={
                    item.productImage ||
                    item.product?.images?.[0]?.url ||
                    "/placeholder.png"
                  }
                  alt={item.productName || item.product?.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <p className="font-bold">{item.productName || item.product?.name}</p>

                  {item.variant?.size && (
                    <p className="text-gray-500 text-sm">
                      Size: {item.variant.size}
                    </p>
                  )}

                  <p className="text-blue-600 font-semibold mt-1">
                    ₹{item.total}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() =>
                        changeQuantity(item.product._id, item.variant?.size, -1)
                      }
                      className="px-2 bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        changeQuantity(item.product._id, item.variant?.size, 1)
                      }
                      className="px-2 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="text-red-500 underline text-sm"
                  onClick={() =>
                    deleteItem(item.product._id, item.variant?.size)
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* summary */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-4">Price Details</h3>

            <p className="flex justify-between">
              <span>Subtotal</span> <span>₹{subtotal}</span>
            </p>

            <p className="flex justify-between">
              <span>Delivery Charge</span> <span>₹{deliveryCharge}</span>
            </p>

            <hr className="my-4" />

            <p className="flex justify-between font-bold text-lg">
              <span>Total</span> <span>₹{grandTotal}</span>
            </p>

            <Link to="/checkout">
              <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
