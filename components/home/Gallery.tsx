"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import * as React from "react";

const images = [
  "/gallery.jpg",
  "/gallery.jpg",
  "/gallery.jpg",
  "/gallery.jpg",
  "/gallery.jpg",
];

const Gallery = () => {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <>
      {/* Carousel */}
      <Carousel className="container mx-auto py-16">
        <div className="max-w-2xl px-4 justify-center mx-auto text-center mb-16">
          <div className="text-center mb-5 text-black text-3xl md:text-4xl  uppercase font-bold">
            <h1> Our Gallery</h1>
            <div className="w-24 h-0.5 bg-primary justify-center mx-auto mt-3"></div>
          </div>
          <p className="text-gray-600 mb-10 text-[16px] md:text-[19px] ">
            Explore our gallery to see moments from our clinic, patient care,
            and the journey of healing through classical homeopathy.
          </p>
        </div>
        <CarouselContent className="-ml-1">
          {images.map((src, index) => (
            <CarouselItem
              key={index}
              className="pl-1 md:basis-1/2 lg:basis-1/3"
            >
              <div
                className="p-1 cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="flex items-center justify-center p-0">
                    <Image
                      src={src}
                      alt={`Gallery Image ${index + 1}`}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover rounded-lg"
                    />
                   
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 top-[60%] lg:top-[60%] md:top-1/2 -translate-y-1/2 bg-white/70 border-none rounded-full shadow" />
        <CarouselNext className="absolute right-4 top-[60%] lg:top-[60%] md:top-1/2 -translate-y-1/2 bg-white/70 border-none rounded-full shadow" />
      </Carousel>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white text-3xl font-bold"
          >
            ✕
          </button>

          {/* Prev Button */}
          <button
            onClick={prevImage}
            className="absolute left-6 text-white text-4xl"
          >
            ‹
          </button>

          {/* Image */}
          <Image
            src={images[currentIndex]}
            alt="Lightbox"
            width={900}
            height={600}
            className="max-h-[80vh] w-auto object-contain rounded-lg"
          />

          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-6 text-white text-4xl"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
};

export default Gallery;
