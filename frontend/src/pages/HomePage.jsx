
import HeroCarousel from "../components/sections/HeroCarousel";
import CategoryRow from "../components/sections/CategoryRow";
import ProductGrid from "../components/sections/ProductGrid";
import dummyProducts from "../data/dummyProducts";
import categories from "../data/categories";

export default function HomePage() {
  return (
    <>
      <HeroCarousel/>
      <CategoryRow categories={categories} />
      <ProductGrid products={dummyProducts} />
    </>
  );
}
