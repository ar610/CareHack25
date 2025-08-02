import React, { useState, useEffect } from "react";

import adImage3 from "../assets/ad-image-3.jpg";
import adImage4 from "../assets/ad-image-4.jpeg";
import adImage5 from "../assets/ad-image-5.jpg";

const images = [adImage3, adImage3, adImage5, adImage4, adImage5];
const infiniteImages = [...images, ...images];

const Ads: React.FC<{ orientation: "horizontal" | "vertical" }> = ({
  orientation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageCount = images.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageCount);
    }, 2000);
    return () => clearInterval(interval);
  }, [imageCount]);

  const transitionDuration = currentIndex === 0 ? "0ms" : "500ms";

  return (
    <div className="relative w-full">
      {/* Horizontal carousel (only visible on mobile) */}
      <div className="block md:hidden overflow-hidden h-48 w-full my-4">
        <div
          className="flex transition-transform ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 50}%)`, // two images visible (50%)
            transitionDuration,
          }}
        >
          {infiniteImages.map((src, index) => (
            <div key={index} className="flex-shrink-0 w-1/2 h-full px-2">
              <img
                src={src}
                alt={`Ad ${index}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Vertical carousel (only visible on md and above) */}
      <div className="hidden md:block overflow-hidden h-full  w-full my-4">
        <div
          className="transition-transform ease-in-out"
          style={{
            transform: `translateY(-${currentIndex * 200}px)`, // one image height
            transitionDuration,
          }}
        >
          {infiniteImages.map((src, index) => (
            <div key={index} className="w-full h-[300px] px-2 mb-4">
              <img
                src={src}
                alt={`Ad ${index}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ads;
