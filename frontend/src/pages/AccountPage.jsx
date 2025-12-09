import user from "../data/user";
import { Link } from "react-router-dom";
import { FaUserCircle, FaMapMarkerAlt, FaBox, FaEdit, FaSignOutAlt } from "react-icons/fa";

export default function AccountPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Profile Info */}
      <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-5">
        <FaUserCircle className="text-5xl text-blue-600" />

        <div>
          <h2 className="text-2xl font-bold text-blue-900">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-600">+91 {user.phone}</p>

          <Link
            to="/edit-profile"
            className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-2"
          >
            <FaEdit /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/orders"
          className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition cursor-pointer"
        >
          <FaBox className="text-3xl text-blue-600" />
          <p className="mt-2 font-semibold">My Orders</p>
        </Link>

        <Link
          to="/address"
          className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition cursor-pointer"
        >
          <FaMapMarkerAlt className="text-3xl text-blue-600" />
          <p className="mt-2 font-semibold">Saved Addresses</p>
        </Link>

        <Link
          to="/wishlist"
          className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center hover:shadow-lg transition cursor-pointer"
        >
          ❤️
          <p className="mt-2 font-semibold">Wishlist</p>
        </Link>
      </div>

      {/* Address Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          Saved Addresses
        </h3>

        {user.addresses.length === 0 ? (
          <p className="text-gray-500">No addresses saved.</p>
        ) : (
          <div className="space-y-4">
            {user.addresses.map((addr, idx) => (
              <div key={idx} className="border p-4 rounded-lg">
                <p className="font-semibold">{addr.street}</p>
                <p className="text-gray-500">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Phone: +91 {addr.phone}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/add-address"
          className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Add Address
        </Link>
      </div>

      {/* Logout Button */}
      <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2">
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}
