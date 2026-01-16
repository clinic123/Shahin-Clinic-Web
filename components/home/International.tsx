"use client"; // ensure client-side

import React from "react";
import { FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

import Appointment from "@/components/AppointmentBook";
import { Footer } from "react-day-picker";
import ExecutiveTeam from "@/components/home/ExecutiveTeam";
import ExecutiveDoctor from "@/components/home/ExecutiveDoctors";


function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* ===== Header ===== */}
      <header className="flex justify-between items-center p-4 md:p-6 bg-white shadow-md">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/ ">
          <Image
            src="https://res.cloudinary.com/dpsgtszzi/image/upload/v1762269195/Screenshot_131_rdvecv.png" // replace with your logo path
            alt="Logo"
            width={150}
            height={50}
            className="object-contain w-16"
          />
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4 text-2xl text-gray-700">
            <a
            href="https://www.facebook.com/scop.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#06A6A7] transition-colors border rounded-full p-1 border-gray-100 bg-green-50"
          >
            <FaFacebook />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#06A6A7] transition-colors border rounded-full p-1 border-gray-100 bg-green-50"
          >
            <FaYoutube />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#06A6A7] transition-colors border rounded-full p-1 border-gray-100 bg-green-50"
          >
            <FaInstagram />
          </a>
        </div>
      </header>

      {/* ===== Banner Section ===== */}
      <section className="relative w-full h-64 md:h-96 bg-gradient-to-br from-green-100 via-white to-emerald-50">
        {/* Background Image */}
        <Image
          src="https://res.cloudinary.com/dpsgtszzi/image/upload/v1762269122/building_gkmw7t.jpg" // replace with your banner image
          alt="Banner"
          fill
          className="object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold">Shaheen's International </h1>
            {/* Breadcrumb */}
            <nav className="mt-2 text-sm md:text-base">
              <Link href="/" className="hover:text-gray-300">
                Home
              </Link>{" "}
              / <span className="text-gray-300">Shaheen's International Page</span>
            </nav>
          </div>
        </div>
      </section>

      {/* ===== Page Content ===== */}
    <main className="p-4 md:p-8 text-center bg-gradient-to-br from-[#05b7b5]/40 via-white to-green-100">
  <h2 className="text-2xl md:text-4xl pt-5 font-bold mb-5">Our Founder</h2>
   <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
    Dr. Shaheen Mahmud, the founder of Shaheen's Clinic, has dedicated their career to exploring and mastering the principles of classical homeopathy. With a deep passion for holistic healing, Dr. Mahmud established the clinic with the vision of providing compassionate care to all patients worldwide.
  </p>
  {/* Image */}
  <div className="w-full h-auto mx-auto justify-center items-center flex mt-10  mb-4">
    <img src="https://res.cloudinary.com/dpsgtszzi/image/upload/v1762267549/founder_x51ol1.png" alt="" className="w-full h-auto rounded-lg" />
  </div>
  {/* Text below image */}
 
</main>



<div>
    <Appointment/>
</div>

<div>
  <ExecutiveTeam params="homepage"/>
</div>
<div>
  <ExecutiveDoctor params="homepage"/>
</div>

    </div>
  );
}

export default Page;
