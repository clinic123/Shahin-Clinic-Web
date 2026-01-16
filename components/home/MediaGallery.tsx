"use client";

import React, { useState } from "react";
import Image from "next/image";

const MediaGallery = () => {
  const mediaItems = [
    { url: "/1.pdf" },
    { url: "/2.pdf" },
    { url: "/3.png" },
    { url: "/4.png" },
    { url: "/5.pdf" },
    { url: "/6.jpg" },
    { url: "/7.png" },
    { url: "/8.jpg" },
    { url: "/9.png" },
    { url: "/10.jpg" },
    { url: "/11.png" },
    { url: "/12.jpg" },
    { url: "/13.jpg" },
    { url: "/14.jpg" },
    { url: "/15.jpg" },
    { url: "/16.pdf" },
    { url: "/17.pdf" },
    { url: "/18.jpg" },
    { url: "/19.jpg" },
    { url: "/20.jpg" },
    { url: "/21.jpg" },
    { url: "/22.jpeg" },
    { url: "/23.jpeg" },
    { url: "/24.jpeg" },
    { url: "/25.jpeg" },
    { url: "/26.pdf" },
    { url: "/27.pdf" },
    { url: "/28.pdf" },
    { url: "/29.pdf" },
    { url: "/30.png" },
    { url: "/31.pdf" },
    { url: "/32.pdf" },
    { url: "/33.pdf" },
    { url: "/34.pdf" },
    { url: "/35.pdf" },
    { url: "/36.pdf" },
    { url: "/37.pdf" },
    { url: "/38.pdf" },
    { url: "/39.pdf" },
    { url: "/40.pdf" },
    { url: "/41.pdf" },
    { url: "/42.pdf" },
    { url: "/43.pdf" },
    { url: "/44.pdf" },
    { url: "/45.pdf" },
    { url: "/46.pdf" },
    { url: "/47.pdf" },
    { url: "/48.pdf" },
    { url: "/49.pdf" },
    { url: "/50.pdf" },
    { url: "/51.jpg" },
    { url: "/52.jpg" },
    { url: "/53.jpg" },
    { url: "/54.jpg" },
    { url: "/55.jpg" },
    { url: "/56.pdf" },
  ];

  // Lazy load - only load first 6 items initially
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleItems = mediaItems.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, mediaItems.length));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {visibleItems.map((item, index) => {
          const isPDF = item.url.endsWith(".pdf");
          return (
            <div
              key={item.url}
              className="rounded-2xl overflow-hidden hover:shadow-lg transition-all"
            >
              {isPDF ? (
                <iframe
                  src={item.url}
                  className="w-full h-[400px]"
                  title={`Certificate ${index + 1}`}
                  loading={index < 2 ? "eager" : "lazy"}
                />
              ) : (
                <div className="relative w-full h-[400px] bg-gray-100">
                  <Image
                    src={item.url}
                    alt={`Certificate ${index + 1}`}
                    fill
                    className="object-contain"
                    loading={index < 2 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    quality={85}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {visibleCount < mediaItems.length && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-[#05b7b5] text-white rounded-lg hover:bg-[#049a98] transition-colors font-semibold"
          >
            Load More Certificates ({mediaItems.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
