import { useState } from "react";
import checkoutData from "../data/checkout";
import { Link } from "react-router-dom";

export default function CheckoutPage() {
  const order = checkoutData;

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const handlePlaceOrder = () => {
    console.log("Order placed:", {
      order,
      paymentMethod,
    });
    alert("Order placed successfully! (Later connect API)");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <h2 className="text-3xl font-bold text-blue-900">
        Checkout
      </h2>

      {/* Address Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">
              Delivery Address
            </h3>
            <p className="font-bold mt-1">{order.user.name}</p>
            <p>{order.user.address.street}</p>
            <p>
              {order.user.address.city}, {order.user.address.state} -{" "}
              {order.user.address.pincode}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Phone: +91 {order.user.phone}
            </p>
          </div>

          <Link
            to="/address"
            className="text-blue-600 font-medium text-sm underline"
          >
            Change
          </Link>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          Order Summary
        </h3>

        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center border-b pb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-500 text-sm">
                  Qty: {item.quantity} • {item.variant}
                </p>
              </div>

              <p className="font-semibold text-blue-600">₹{item.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Selection */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          Payment Method
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Cash on Delivery (COD)
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
            />
            Online Payment
          </label>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          Price Details
        </h3>

        <div className="space-y-2 text-gray-700">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </p>
          <p className="flex justify-between">
            <span>Delivery Charge</span>
            <span>₹{order.deliveryCharge}</span>
          </p>

          <hr className="my-4" />

          <p className="flex justify-between font-bold text-blue-800 text-lg">
            <span>Total</span>
            <span>₹{order.total}</span>
          </p>
        </div>
      </div>

      {/* Place Order CTA */}
      <button
        onClick={handlePlaceOrder}
        className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition"
      >
        Place Order
      </button>
    </div>
  );
}
