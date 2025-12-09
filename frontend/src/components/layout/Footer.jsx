import { FaFacebook, FaInstagram, FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-16 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        
        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold">MilkMart</h2>
          <p className="text-sm text-blue-100 mt-2">
            Fresh milk & dairy delivered to your doorstep daily.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="space-y-2 mt-3 text-blue-100 text-sm">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">Products</li>
            <li className="hover:text-white cursor-pointer">Orders</li>
            <li className="hover:text-white cursor-pointer">Subscriptions</li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="text-lg font-semibold">Support</h3>
          <ul className="space-y-2 mt-3 text-blue-100 text-sm">
            <li className="flex items-center gap-2">
              <FaPhoneAlt /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> support@milkmart.com
            </li>
            <li>Help & FAQ</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold">Follow Us</h3>
          <div className="flex gap-4 mt-3">
            <FaFacebook className="text-2xl hover:text-blue-300 cursor-pointer" />
            <FaInstagram className="text-2xl hover:text-pink-300 cursor-pointer" />
            <FaWhatsapp className="text-2xl hover:text-green-300 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="text-center border-t border-blue-800 mt-10 pt-4 text-blue-200 text-sm">
        © {new Date().getFullYear()} MilkMart. All Rights Reserved.
      </div>
    </footer>
  );
}
