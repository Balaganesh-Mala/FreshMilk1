import { useEffect, useState } from "react";
import { fetchProducts, getCategories } from "../api/project.api";
import ProductCard from "../components/ui/ProductCard";
import SidebarFilters from "../components/filters/SidebarFilters";
import Pagination from "../components/ui/Pagination";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortType, setSortType] = useState("");

  const [priceRange, setPriceRange] = useState([0, 1000]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); // Logged-in user check

  // 🔸 Fetch Categories (Backend)
  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(["All", ...res.data.categories.map((c) => c.name)]);
    } catch (err) {
      console.log("Category load failed");
    }
  };

  // 🔹 Fetch Products (Backend)
  const loadProducts = async () => {
    try {
      setLoading(true);

      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (sortType) params.sort = sortType;

      const res = await fetchProducts(params);

      // backend returns res.data.products
      const fetchedProducts = res.data.products || [];

      setProducts(fetchedProducts);

      // update dynamic price range based on backend
      if (fetchedProducts.length > 0) {
        const prices = fetchedProducts.map((p) => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceRange([min, max]);
      }

      setError("");
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, sortType]);

  // ⭐ Filter by selected price range
  const filteredProducts = products.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  // ⭐ Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">Shop Products</h2>

      {/* Search + Sort Row */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="border p-3 rounded-lg flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded-lg w-48"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="low-high">Price Low → High</option>
          <option value="high-low">Price High → Low</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center py-10 text-red-500">{error}</div>
      )}

      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar Filters */}
        <SidebarFilters
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minPrice={priceRange[0]}
          maxPrice={priceRange[1]}
        />

        {/* Product Listing */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {paginatedProducts.map((item) => (
              <ProductCard
                key={item._id}
                id={item._id}
                image={item.images?.[0]?.url}
                title={item.name}
                price={item.price}
                mrp={item.mrp}
                rating={item.ratings}
                isLoggedIn={!!token}
              />
            ))}
          </div>

          {paginatedProducts.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500 font-medium">
              No products found 👀 Try different filters
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
