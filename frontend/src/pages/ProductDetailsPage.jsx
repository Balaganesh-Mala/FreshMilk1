import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, fetchProducts, addToCart } from "../api/project.api";
import ReviewSection from "../components/sections/ReviewSection";
import SimilarProducts from "../components/sections/SimilarProducts";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState("");

  const [similarProducts, setSimilarProducts] = useState([]);

  const token = localStorage.getItem("token");

  // Load product
  const loadProduct = async () => {
    try {
      setLoading(true);

      const res = await fetchProductById(id);
      const data = res.data.product;

      setProduct(data);

      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }

      if (data.images?.length > 0) {
        setActiveImage(data.images[0].url);
      }

      if (data.category?._id) {
        const simRes = await fetchProducts({ category: data.category._id });
        const filtered = simRes.data.products.filter((p) => p._id !== id);
        setSimilarProducts(filtered);
      }
    } catch (err) {
      console.log("Product fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // ⭐ Add to cart function
  const handleAddToCart = async () => {
    if (!token) return navigate("/login");

    try {
      const payload = {
        productId: product._id,
        quantity: 1,
        variant: selectedVariant?.size, // send selected size
      };

      await addToCart(payload);

      alert("Added to cart ✅");
    } catch (err) {
      alert("Add to cart failed ❌");
    }
  };

  // ⭐ Buy Now function
  const handleBuyNow = async () => {
    if (!token) return navigate("/login");

    try {
      // First add to cart
      const payload = {
        productId: product._id,
        quantity: 1,
        variant: selectedVariant?.size,
      };

      await addToCart(payload);

      // Then redirect
      navigate("/checkout");
    } catch (err) {
      alert("Something went wrong ❌");
    }
  };

  if (loading)
    return <div className="text-center py-20 text-gray-400">Loading...</div>;

  if (!product)
    return (
      <div className="text-center p-20 text-red-600">Product not found ❌</div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">

        {/* LEFT - Image Gallery */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 order-2 md:order-1">
            {product.images?.slice(0, 6).map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt=""
                className={`w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border cursor-pointer transition ${
                  activeImage === img.url
                    ? "border-blue-600 scale-105"
                    : "border-gray-300"
                }`}
                onClick={() => setActiveImage(img.url)}
              />
            ))}
          </div>

          <div className="flex-1 order-1 md:order-2">
            <img
              src={activeImage || "/placeholder.png"}
              alt={product.name}
              className="w-full rounded-xl shadow"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <h2 className="text-3xl font-bold text-blue-900">{product.name}</h2>

          <p className="text-gray-600 mt-3">{product.description}</p>

          <div className="mt-4">
            <p className="text-2xl font-bold text-blue-600">
              ₹{selectedVariant?.price || product.price}
            </p>

            {product.mrp > 0 && (
              <p className="text-sm text-gray-400">
                MRP: <s>₹{product.mrp}</s>
              </p>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div className="mt-5">
              <p className="font-semibold text-gray-700">Choose Size:</p>
              <div className="flex gap-2 mt-2">
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      selectedVariant?.size === v.size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-400 text-gray-600"
                    }`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-gray-500">⭐ {product.ratings}/5</p>

          {/* Add & Buy Buttons */}
          <button
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          <button
            className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>

          {/* Subscription */}
          {product.isSubscriptionAvailable && (
            <button className="mt-3 w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition">
              Subscribe Daily
            </button>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <SimilarProducts products={similarProducts} />
      )}

      {/* Reviews */}
      {product.reviews && <ReviewSection reviews={product.reviews} />}
    </div>
  );
}
