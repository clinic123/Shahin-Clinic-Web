"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AboutSection() {
  const itemsLeft = [
    {
      id: "01",
      title: "Our Mission",
      desc: "At Shaheen's Clinic, our mission is to provide world-class classical homeopathic treatment for serious and chronic diseases, grounded in the principles of holistic healing, especially homeopathy. We aim to deliver exceptional care and bring relief to patients worldwide by integrating the best practices in classical homeopathy with a compassionate, patient-centered approach.",
    },
   
    
  ];

  const itemsRight = [
    {
      id: "02",
      title: "Our Vision",
      desc: "Our vision is to become a globally recognized center for homeopathic healing, where patients receive the highest standard of care and where practitioners and learners can access educational resources, research, and training to further the growth of homeopathy.",
    },
   
  ];

  return (
    <section
      className="relative py-28 lg:py-36 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50"
      id="about"
    >
      {/* Gradient orbs for background accent */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#05b7b5]/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#05b7b5]/40 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative max-w-3xl mx-auto text-center mb-20 px-6"
      >
        <h1 className=" text-2xl md:text-5xl font-extrabold text-gray-800 leading-tight">
          About <span className="text-[#05b7b5] ">Shaheen’s Clinic</span>
        </h1>
        <div className="w-24 h-1 bg-[#05b7b5]  mx-auto mt-4 mb-6 rounded-full"></div>
        <p className="text-gray-600 text-lg leading-relaxed">
          Founded in 2016 by Dr. Shaheen Mahmud, we blend classical homeopathy
          with modern insight — offering care that heals body, mind, and soul.
        </p>
      </motion.div>

      {/* 3-column layout */}
      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center z-10">
        {/* Left Items */}
        <motion.div
          className="space-y-14 text-left lg:pr-10"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {itemsLeft.map((item) => (
            <div key={item.id} className="relative">
              <span className="absolute -left-10 top-1/2 -translate-y-1/2 text-7xl font-bold text-emerald-200 opacity-40 select-none">
                {item.id}
              </span>
              <h4 className="text-2xl font-semibold text-gray-800 mb-1">
                {item.title}
              </h4>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Center Video */}
        <motion.div
          className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-emerald-100 backdrop-blur-sm bg-white/60 hover:scale-[1.02] transition-all duration-300"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
         <div className="relative">
  <div className="absolute inset-0 z-50 bg-gradient-to-t from-emerald-100/10 via-transparent to-transparent pointer-events-none"></div>
  <iframe
    className="w-full h-[300px] md:h-[400px] lg:h-[350px] z-10"
    src="https://www.youtube.com/embed/1-0vQiTP1qM"
    title="About Us Video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  ></iframe>
</div>

        </motion.div>

        {/* Right Items */}
        <motion.div
          className="space-y-14 text-left lg:pl-10"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {itemsRight.map((item) => (
            <div key={item.id} className="relative">
              <span className="absolute -right-10 top-1/2 -translate-y-1/2 text-7xl font-bold text-emerald-200 opacity-40 select-none">
                {item.id}
              </span>
              <h4 className="text-2xl font-semibold text-gray-800 mb-1">
                {item.title}
              </h4>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative text-center mt-20 z-10"
      >
        <Link
          href="/about"
          className={`${buttonVariants({
            variant: "default",
          })} bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-8 py-3 rounded-full shadow-lg transition-all`}
        >
          Learn More
        </Link>
      </motion.div>
    </section>
  );
}
