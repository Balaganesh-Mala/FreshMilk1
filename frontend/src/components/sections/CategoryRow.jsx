export default function CategoryRow({ categories }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="flex gap-6">
        {categories.map((c, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-14 h-14 bg-white shadow rounded-full flex items-center justify-center overflow-hidden">
              <img src={c.image} className="w-12 h-12 object-cover" />
            </div>
            <p className="text-sm mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
