import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    title: (
      <>
        Service Hours:
        <br />
        10 AM - 5 PM
      </>
    ),
    subtitle:
      "All services are available during our standard operating hours. Expect delivery within 10 minutes.",
    backgroundColor: "from-green-600 to-emerald-600",
    image: null,
    altText: "Service Hours",
  },
  {
    id: 2,
    title: "Fresh Groceries Delivered in 10 Minutes!",
    subtitle:
      "Get farm-fresh vegetables, fruits, and daily essentials delivered to your doorstep",
    backgroundColor: "from-green-500 to-emerald-600",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Save Big on Your Daily Essentials",
    subtitle:
      "Up to 30% off on fruits, vegetables, and household items this week",
    backgroundColor: "from-blue-500 to-cyan-600",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Premium Quality, Guaranteed Fresh",
    subtitle:
      "Hand-picked produce from local farms, quality assured by our experts",
    backgroundColor: "from-orange-500 to-amber-600",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=300&fit=crop",
  },
];

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl h-48 md:h-64 lg:h-80 mb-8">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`w-full h-full flex-shrink-0 bg-gradient-to-r ${banner.backgroundColor} relative`}
          >
            <div
              className={`absolute inset-0 flex flex-col justify-center items-center text-center p-6 md:p-8 lg:p-12 ${
                banner.image
                  ? "md:flex-row md:justify-between md:text-left"
                  : ""
              }`}
            >
              <div className="text-white z-10 max-w-xl">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-4">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-6">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              {banner.image && (
                <div className="hidden md:block flex-1 max-w-xs lg:max-w-md">
                  <img
                    src={banner.image}
                    alt={
                      banner.altText
                        ? banner.altText
                        : typeof banner.title === "string"
                        ? banner.title
                        : "Banner image"
                    }
                    className="w-full h-40 lg:h-48 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full p-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full p-2"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
