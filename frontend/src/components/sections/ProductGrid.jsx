import ProductCard from "../ui/ProductCard";

export default function ProductGrid({ products }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Products For You
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            image={item.images?.[0]?.url}
            title={item.name}
            price={item.price}
            rating={item.ratings}
          />
        ))}
      </div>
    </section>
  );
}
