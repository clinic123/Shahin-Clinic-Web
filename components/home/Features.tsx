"use client";

import Link from "next/link";

interface FeatureItem {
  image: string;
  button: string;
  link: string;
}

const featuresData: FeatureItem[] = [
  {
    image: "/gallery.jpg",
    button: "View Gallery",
    link: "/gallery",
  },
  {
    image: "/gallery.jpg",
  button: "View Gallery",
    link: "/gallery",
  },
  {
    image: "/gallery.jpg",
  button: "View Gallery",
    link: "/gallery",
  },
  {
    image: "/gallery.jpg",
  button: "View Gallery",
    link: "/gallery",
  },
];

const Features = () => {
  return (
    <section className="py-16 bg-white relative ">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresData.map((feature, index) => (
            <Link 
              key={index}
              href='/gallery'
              className="group relative block overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              {/* Image */}
              <img
                src={feature.image}
                alt={`Feature ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="flex items-center justify-center py-4">
                <button className="py-2 px-6 border border-white cursor-pointer text-white bg-[#0cb8b6] duration-700 rounded-full transition-all ">
                  {feature.button}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features ;