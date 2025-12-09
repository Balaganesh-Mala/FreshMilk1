import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bannerSlides from "../../data/bannerSlides";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[index];

  return (
    <section
      className="relative w-full min-h-[380px] md:min-h-[450px] flex items-center justify-center bg-gray-100 overflow-hidden"
      style={{
        backgroundImage: `url(${slide.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-xl px-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {slide.title}
          </h2>

          <p className="text-white/90 mt-3 md:text-lg">{slide.subtitle}</p>

          <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition">
            {slide.button}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 flex gap-2">
        {bannerSlides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition ${
              index === i ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
