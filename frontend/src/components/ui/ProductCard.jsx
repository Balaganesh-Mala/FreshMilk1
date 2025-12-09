import { useNavigate } from "react-router-dom";

export default function ProductCard({
  id,
  image,
  title = "",
  price = 0,
  mrp = 0,
  rating = 0,
  isLoggedIn,
  onAddToCart,
}) {
  const navigate = useNavigate();

  // Navigate to product details
  const handleCardClick = () => {
    if (id) navigate(`/product/${id}`);
  };

  // Add to cart
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent opening product page

    if (!isLoggedIn) {
      return navigate("/login");
    }

    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow hover:shadow-lg transition p-3 border cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <img
        src={image || "/placeholder.png"}
        alt={title}
        className="w-full h-52 object-cover rounded-lg"
      />

      {/* Title */}
      <h3 className="mt-3 text-sm font-semibold text-gray-800">
        {title.length > 28 ? title.slice(0, 28) + "..." : title}
      </h3>

      {/* Price */}
      <div className="flex items-center gap-2 mt-1">
        <p className="text-blue-600 font-bold text-lg">₹{price}</p>

        {mrp > price && (
          <p className="text-gray-400 text-sm line-through">₹{mrp}</p>
        )}
      </div>

      {/* Rating */}
      <p className="text-sm text-gray-500">
        ⭐ {rating ? rating.toFixed(1) : "0.0"}/5
      </p>

      {/* Add to Cart / Login button */}
      <button
        className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        onClick={handleAddToCart}
      >
        {isLoggedIn ? "Add to Cart" : "Login to Buy"}
      </button>
    </div>
  );
}
