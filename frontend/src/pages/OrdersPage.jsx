import orders from "../data/orders";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">
        My Orders
      </h2>

      {/* Empty Orders */}
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <img src="/empty-orders.png" alt="empty" className="w-44 mx-auto" />
          <p className="text-gray-500 mt-4">
            No orders yet. Start shopping now!
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-xl shadow-md border hover:shadow-lg transition"
            >
              {/* Order Header */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    Order ID: {order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ordered on: {order.date}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-600"
                      : order.status === "Processing"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <hr className="my-4" />

              {/* Items List UI */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4"
                  >
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
                  </div>
                ))}
              </div>

              {/* Footer Bar Bottom */}
              <div className="flex justify-between items-center mt-4">
                <p className="font-bold text-blue-700 text-lg">
                  Total: ₹{order.total}
                </p>
                <Link
                  to={`/order/${order.id}`}
                  className="text-blue-600 font-medium underline text-sm hover:text-blue-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
