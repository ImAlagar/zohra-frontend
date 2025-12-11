// components/HeroSlider/HeroSlider.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGetActiveSlidersQuery } from "../../redux/services/sliderService";

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const bgRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);

  // --- API DATA ---
  const { data: apiResponse, isLoading } = useGetActiveSlidersQuery();

  const slides = apiResponse?.data || [
    {
      id: 1,
      title: "Night Elegance",
      subtitle: "Luxury Satin Nightwear",
      description: "Feel premium comfort every night.",
      layout: "left",
      image:
        "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5a5e?w=1600",
      bgImage:
        "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5a5e?w=1600",
      buttonText: "Shop Now",
      buttonLink: "/shop",
    },
  ];

  // --- AUTOPLAY ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // --- GSAP ANIMATIONS ---
  useEffect(() => {
    if (!bgRef.current || !contentRef.current || !imageRef.current) return;

    // Background zoom/fade
    gsap.fromTo(
      bgRef.current,
      { scale: 1.2, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.8, ease: "power3.out" }
    );

    // Content motion based on layout
    const layout = slides[current]?.layout;

    const direction =
      layout === "left"
        ? -60
        : layout === "right"
        ? 60
        : 0; // center = no horizontal movement

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: direction, y: 40 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1.3,
        ease: "power3.out",
        delay: 0.2,
      }
    );

    // Image pop + slight parallax zoom
    gsap.fromTo(
      imageRef.current,
      { opacity: 0, scale: 1.15, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.4,
        ease: "power3.out",
        delay: 0.3,
      }
    );
  }, [current]);

  // Layout-based alignment classes
  const getLayoutClasses = (layout) => {
    switch (layout) {
      case "left":
        return "items-start text-left";
      case "right":
        return "items-end text-right";
      case "center":
        return "items-center text-center";
      default:
        return "items-center text-center";
    }
  };

  if (isLoading)
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-spin h-16 w-16 border-t-2 border-purple-500 rounded-full" />
      </div>
    );

  return (
    <section className="relative h-[80vh] md:h-[85vh] w-full overflow-hidden">
      {/* Font Preload for better performance */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Manrope:wght@300;400;500;600&family=Lexend:wght@300;400;500;600&display=swap');
        `}
      </style>
      
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            index === current && (
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* BACKGROUND */}
                <div
                  ref={bgRef}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${slide.bgImage || slide.image})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* CONTENT */}
                <div className="relative h-full w-full flex items-center px-6 md:px-16 lg:px-24">
                  <div
                    ref={contentRef}
                    className={`flex flex-col gap-3 md:gap-4 xl:gap-6 max-w-xl ${getLayoutClasses(
                      slide.layout
                    )}`}
                  >
                    {/* Main Title - Using Cormorant Garamond for elegance */}
                    <h1 className="text-white text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight drop-shadow-xl font-heading tracking-tight">
                      {slide.title}
                    </h1>

                    {/* Subtitle - Using Playfair Display for sophistication */}
                    {slide.subtitle && (
                      <p className="text-white/90 text-lg md:text-2xl lg:text-3xl font-semibold font-subheading italic">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Description - Using Manrope for readability */}
                    {slide.description && (
                      <p className="text-white/80 text-sm md:text-base lg:text-lg leading-relaxed max-w-lg font-body mt-2 md:mt-4">
                        {slide.description}
                      </p>
                    )}

                    {/* Button - Using Lexend for UI elements */}
                    {slide.buttonText && (
                      <button
                        onClick={() =>
                          (window.location.href = slide.buttonLink)
                        }
                        className="mt-4 md:mt-6 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl font-ui text-lg tracking-wide"
                      >
                        {slide.buttonText}
                      </button>
                    )}
                  </div>

                  {/* IMAGE (right side for left layout, left side for right layout, center for center) */}
                  <div className="absolute bottom-6 right-6 md:bottom-10 md:right-16">
                    <img
                      ref={imageRef}
                      src={slide.image}
                      alt={slide.title}
                      className="w-40 md:w-56 lg:w-64 xl:w-72 rounded-xl shadow-2xl object-cover border-4 border-white/20"
                    />
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;