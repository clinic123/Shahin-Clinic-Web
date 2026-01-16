"use client";

import Link from "next/link";
import React from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const ContactUs: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    alert("Form submitted successfully!");
    reset();
  };

  return (
    <div className="">
      <div className="  bg-[#0CB7B5] text-center py-16 px-16  text-white  justify-center mx-auto  mb-16">
        <div className="text-center  mb-5 text-white  text-3xl md:text-4xl  uppercase font-bold">
          <h1>Contact Us</h1>
          <div className="w-24 h-1 bg-[var(--primary)] justify-center mx-auto mt-3"></div>
        </div>
        <p className="text-white text-center mx-auto mb-10 text-[16px] max-w-2xl md:text-[19px] ">
          We’d love to hear from you! Whether you have questions about our
          services, need guidance, or want to schedule a consultation, you can
          reach us through the following channels.
        </p>
      </div>

     <div className="container mx-auto px-4  pb-14">
       <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Side - Contact Info */}
        <div className=" bg-[var(--primary)] text-white p-8 rounded-[10px] shadow-md ">
          <p className="text-white mb-6 text-lg">
            Have a specific inquiry or request? Use the Contact Form below to
            send us a message. We will get back to you as soon as possible.
          </p>

          <div className="space-y-4 text-xl">
            <Link
              href={"tel:+8801734077111"}
              className="md:flex items-center gap-2 text-[17px]  text-md:lg "
            >
              <strong>
                <FaPhoneAlt className="bg-black py-3 px-3 text-5xl rounded-full  " />
              </strong>{" "}
              +8801734077111
            </Link>

            <Link
              href={"mailto:dr.shaheen.mahmud@gmail.com"}
              className="md:flex items-center gap-2 text-[17px]  text-md:lg "
            >
              <strong>
                <FaEnvelope className="bg-black py-3 px-3 text-5xl rounded-full  mt-3 " />
              </strong>{" "}
              dr.shaheen.mahmud@gmail.com
            </Link>

            <p className="md:flex items-center gap-2 text-[17px]  text-md:lg ">
              <strong>
                <FaMapMarkerAlt className="bg-black py-3 px-3 text-5xl rounded-full  mt-3  " />
              </strong>{" "}
              House: Lucky Heaven, Road: Milk Vitae Road, Vill- Dewla, P.O- BAU
              Madrasa, Thana- Tangail, Dist- Tangail, Bangladesh
            </p>
          </div>
          
        </div>

        {/* Right Side - Contact Form */}
        <div className="lg:w-1/2 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block mb-1 font-medium text-gray-600 ">
                Name
              </label>
              <input
                type="text"
                className="w-full rounded-[10px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A5C422] py-2  px-2"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-[10px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A5C422] py-2 px-2"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 font-medium text-gray-600">
                Phone
              </label>
              <input
                type="tel"
                className="w-full rounded-[10px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A5C422] py-2 px-2"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{7,15}$/,
                    message: "Invalid phone number",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block mb-1 font-medium text-gray-600">
                Subject
              </label>
              <input
                type="text"
                className="w-full rounded-[10px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A5C422] py-2 px-2"
                {...register("subject", { required: "Subject is required" })}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block mb-1 font-medium text-gray-600">
                Message
              </label>
              <textarea
                className="w-full rounded-[10px] border border-gray-200 focus:outline-none px-2 focus:ring-1 focus:ring-[#A5C422]"
                {...register("message", { required: "Message is required" })}
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className=" bg-[var(--primary)] w-36 text-white font-semibold py-2 px-2 rounded-md hover:bg-black cursor-pointer transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
     </div>
    </div>
  );
};

export default ContactUs;
