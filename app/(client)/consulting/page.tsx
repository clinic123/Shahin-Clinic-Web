"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FaCalendarAlt, FaClinicMedical, FaLaptopMedical } from "react-icons/fa";
import { MdOutlineContactPhone } from "react-icons/md";

const Consulting: React.FC = () => {


  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


  return (
    <section className="bg-white text-gray-800 px-6 sm:px-10 lg:px-24 py-16">
      {/* 🧭 Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#0cb8b6] transition-colors">
          Home
        </Link>{" "}
        / <span className="text-gray-700 font-semibold">Consulting</span>
      </div>

      {/* 🔹 Title Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0cb8b6]">
          One-on-One Consulting
        </h1>
        <p className="text-gray-600 text-[16px] leading-relaxed">
          At Shaheen's Clinic, we offer consulting services designed to meet the unique needs of
          individuals and organizations in homeopathy, health, and education. Whether you're seeking
          personalized treatment, expert advice, or professional development, we’re here to guide you
          every step of the way.
        </p>
      </div>

      {/* 🔸 Cards Section */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* In-Clinic Consultation */}
        <div className="border border-gray-200 shadow-lg rounded-2xl p-8 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <FaClinicMedical className="text-[#0cb8b6] text-3xl" />
            <h2 className="text-2xl font-semibold text-gray-800">
              In-Clinic Consultation
            </h2>
          </div>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            Schedule your in-person consultation at least 2 days in advance by calling{" "}
            <strong>01749168119</strong>. Bring all relevant test reports when you visit at{" "}
            <strong>11:00 AM</strong>. Follow-up appointments are based on arrival priority.
            <br />
            You can also book your appointment directly through our online booking section.
          </p>
         
        </div>

        {/* Online Consultation */}
        <div className="border border-gray-200 shadow-lg rounded-2xl p-8 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <FaClinicMedical className="text-[#0cb8b6] text-3xl" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Online Consultation
            </h2>
          </div>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            For online consultations, call <strong>01749168119</strong> and mention your preference.
            Pay the consultation fee via <strong>Bkash/Nagad (01734077111)</strong>, and share the
            transaction details via WhatsApp. Send scanned copies of your reports and affected area
            photos. Consultations are conducted via Google Meet, WhatsApp, or Messenger.
          </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#0cb8b6] underline text-white px-6 py-2 rounded-full mt-6 hover:bg-[#0aa3a1] transition-all" >
       Book an Appointment
        </Link>
        </div>
      </div>

     <div  className="w-full flex justify-center py-10">
      <div
        className="calendly-inline-widget w-full"
        data-url="https://calendly.com/mahmudshopan70/online-consultation"
        style={{ minWidth: "320px", height: "700px" }}
      ></div>
    </div>

      {/* 💰 Consultation Fees Section */}
      <div className="mt-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#0cb8b6] mb-4">
          Consultation Fees & Benefits
        </h2>
        <p className="text-gray-600 text-[15px] leading-relaxed">
          Fees vary depending on treatment type and consultation mode. Please contact us or check
          our booking section for updated rates.
        </p>

        <div className="mt-6 text-left bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200">
          <ul className="list-disc ml-6 text-gray-700 space-y-3 text-[15px]">
            <li>
              After paying the consultation fee, no extra charges apply for medicines or courier.
            </li>
            <li>
              Expatriate patients receive dedicated support via our{" "}
              <Link href="#" className="text-[#0cb8b6] font-semibold underline">
                International Page
              </Link>
              .
            </li>
            <li>
              You can also send test reports via WhatsApp at <strong>01749168119</strong> for
              guidance — this service is <strong>free of charge</strong>.
            </li>
            <li>
              Alternatively, submit your details through our{" "}
              <Link href="/contact" className="text-[#0cb8b6] font-semibold underline">
                contact form
              </Link>{" "}
              to receive instructions via email.
            </li>
          </ul>
        </div>
      </div>

      {/* ⏰ Active Hours Section */}
      <div className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#0cb8b6] mb-4">
          Active Appointment, Inquiry & Contact Time
        </h2>
        <p className="text-gray-600 leading-relaxed text-[15px]">
          Our team is available to assist you with appointments, inquiries, and consultations during
          business hours. For urgent matters, please contact us at{" "}
          <strong>01749168119</strong>.
        </p>
        <p className="text-gray-800 font-semibold mt-4">
          Time: 11:00 AM – 5:00 PM and 7:00 PM – 10:00 PM
        </p>
        <Link
          href="/about"
      
          className="inline-flex items-center gap-2 bg-[#0cb8b6] text-white px-6 py-2 rounded-full mt-6 hover:bg-[#0aa3a1] transition-all"
        >
          <MdOutlineContactPhone />
          Inquire About Us
        </Link>
      </div>
    </section>
  );
};

export default Consulting;
