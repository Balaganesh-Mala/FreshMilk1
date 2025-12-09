import { useParams, Link } from "react-router-dom";
import orderDetails from "../data/orderDetails";
import { FaCheckCircle } from "react-icons/fa";

export default function OrderDetailsPage() {
  const { id } = useParams();

  // Basic matching (later replace with backend fetch)
  if (id !== orderDetails.id)
    return (
      <div className="text-center p-20 text-red-600">
        Order Not Found ❌
      </div>
    );

  const order = orderDetails;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <h2 className="text-3xl font-bold text-blue-900 mb-4">
        Order Details
      </h2>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-gray-800">
              Order ID: {order.id}
            </p>
            <p className="text-gray-500 text-sm">
              Ordered on: {order.date}
            </p>
          </div>

          <span className="bg-green-100 text-green-600 px-4 py-1 rounded-lg font-medium">
            {order.status}
          </span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-3">
          Delivery Address
        </h3>
        <p className="font-semibold">{order.address.name}</p>
        <p>{order.address.street}</p>
        <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
        <p className="text-gray-500 mt-2 text-sm">Phone: {order.address.phone}</p>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          Order Tracking
        </h3>

        <div className="space-y-2">
          {order.trackingStages.map((stage, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span className="text-gray-800">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ordered Items */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Items</h3>

        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 border-b pb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-gray-500 text-sm">
                  Qty: {item.quantity} • {item.variant}
                </p>
              </div>

              <p className="font-semibold text-blue-600">₹{item.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Price Details</h3>

        <div className="space-y-2 text-gray-700">
          <p className="flex justify-between">
            <span>Subtotal</span> <span>₹{order.subtotal}</span>
          </p>

          <p className="flex justify-between">
            <span>Delivery Charge</span> <span>₹{order.shipping}</span>
          </p>

          <hr className="my-4" />

          <p className="flex justify-between font-bold text-blue-800 text-lg">
            <span>Total</span> <span>₹{order.total}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
          Reorder
        </button>

        <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
          Download Invoice
        </button>
      </div>
    </div>
  );
}
