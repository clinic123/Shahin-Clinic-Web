"use client";
import emailjs from "@emailjs/browser";
import Link from "next/link";
import { useRef } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaYoutube,
} from "react-icons/fa";

const Sapon = () => {
  const form = useRef<any>(null);

  // Handle form submission
  const sendEmail = (e: any) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "your_service_id", // 🔹 Replace with your EmailJS service ID
        "your_template_id", // 🔹 Replace with your EmailJS template ID
        form.current,
        "your_public_key" // 🔹 Replace with your EmailJS public key
      )
      .then(
        () => {
          alert("Message sent successfully ✅");
          e.target.reset();
        },
        (error) => {
          alert("Failed to send message ❌ Please try again.");
          console.log(error);
        }
      );
  };

  const icons = [
    {
      icon: <FaFacebookF />,
      link: "https://www.facebook.com/shaheensclinic",
      bg: "bg-[#06A6A7]",
    },
    {
      icon: <FaInstagram />,
      link: "https://instagram.com",
      bg: "bg-[#06A6A7]",
    },
    {
      icon: <FaYoutube />,
      link: "https://www.youtube.com/@shaheensclinic",
      bg: "bg-[#06A6A7]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 container mx-auto py-16">
      {/* ===== Contact Info ===== */}
      <div className=" px-4 text-black">
        <div className="space-y-4 text-xl">
          <h1 className="font-bold md:text-2xl">
            Shamim Mahmud Swapan <br />
            <span className="text-[#05b7b5] font-normal text-md">
              Director, Scope
            </span>
          </h1>

          <Link
            href="tel:+8801323812055"
            className="md:flex items-center gap-2 text-[17px]"
          >
            <FaPhoneAlt className="bg-[#05b7b5] text-white p-3 text-5xl rounded-full" />{" "}
            +880 1323812055
          </Link>

          <Link
            href="mailto:shopan034@gmail.com"
            className="md:flex items-center gap-2 text-[17px]"
          >
            <FaEnvelope className="bg-[#05b7b5] text-white p-3 text-5xl rounded-full mt-3" />{" "}
            shopan034@gmail.com
          </Link>

          <div className="flex gap-4 mt-6">
            {icons.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-transform transform hover:scale-125 ${item.bg} hover:shadow-lg`}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Contact Form ===== */}
      <div className="container mx-auto px-4 pb-16 text-black">
        <form
          ref={form}
          onSubmit={sendEmail}
          className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <input
              type="text"
              name="user_name"
              placeholder="Enter your name"
              className="w-full p-3 rounded-md text-black outline-none border border-gray-300"
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block mb-1 font-semibold">Email (optional)</label>
            <input
              type="email"
              name="user_email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-md text-black outline-none border border-gray-300"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-semibold">Phone</label>
            <input
              type="tel"
              name="user_phone"
              placeholder="Enter your phone number"
              className="w-full p-3 rounded-md text-black outline-none border border-gray-300"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-1 font-semibold">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="Enter your subject"
              className="w-full p-3 rounded-md text-black outline-none border border-gray-300"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-1 font-semibold">Message</label>
            <textarea
              name="message"
              placeholder="Write your message"
              rows={5}
              className="w-full p-3 rounded-md text-black outline-none border border-gray-300"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-[#05b7b5] hover:bg-[#06A6A7] text-white font-semibold py-3 rounded-md transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sapon;
