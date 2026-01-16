"use client"; // ensure client-side

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebook,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

import Appointment from "@/components/AppointmentBook";
import Footer from "@/components/Footer";

function Page() {
  const icons = [
    {
      icon: <FaFacebookF />,
      link: "https://www.facebook.com/shaheensclinic",
      bg: "bg-[#06A6A7] ",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* ===== Header ===== */}
      <header className="flex justify-between items-center p-4 md:p-6 bg-white shadow-md">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/ ">
            <Image
              src="/b8b12a64-c619-4bb7-af3b-103d480323be.jpeg" // replace with your logo path
              alt="Logo"
              width={150}
              height={50}
              className="object-contain w-16 rounded-md"
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
            <h1 className="text-3xl md:text-5xl font-bold">
              Shaheen's International{" "}
            </h1>
            {/* Breadcrumb */}
            <nav className="mt-2 text-sm md:text-base">
              <Link href="/" className="hover:text-gray-300">
                Home
              </Link>{" "}
              /{" "}
              <span className="text-gray-300">
                Shaheen's International Page
              </span>
            </nav>
          </div>
        </div>
      </section>

      {/* ===== Page Content ===== */}
      <div className="bg-gradient-to-br from-[#05b7b5]/40 via-white to-green-100 py-10">
        <div className="container text-center ">
          <h2 className="text-2xl md:text-4xl pt-5 font-bold mb-5">
            Our Founder
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
            Dr. Shaheen Mahmud, the founder of Shaheen's Clinic, has dedicated
            their career to exploring and mastering the principles of classical
            homeopathy. With a deep passion for holistic healing, Dr. Mahmud
            established the clinic with the vision of providing compassionate
            care to all patients worldwide.
          </p>
          {/* Image */}
          <div className="aspect-video relative overflow-hidden mx-auto justify-center items-center flex mt-10  mb-4">
            <Image
              src="https://res.cloudinary.com/dpsgtszzi/image/upload/v1763222153/_MG_0585_fuifmo.jpg"
              alt="doctor shaheen mahmud"
              fill
              priority
              className="w-full object-cover h-auto rounded-lg"
            />
          </div>
          {/* Text below image */}
        </div>
      </div>
      <div className="container">
        <div className="bg-white p-4 lg:p-8  rounded-2xl shadow-md  space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#05b7b5] pl-3">
            Shaheen's Clinic International: What It Is and How It Works
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            <strong>Shaheen's Clinic International </strong>,is a modern,
            world-class healthcare facility dedicated to providing exceptional
            medical services with Classical Homeopathy for a global context of
            care. It is designed to cater not only to local patients but also to
            international visitors seeking trusted, high-quality medical
            treatment. The clinic integrates advanced diagnostic tools,
            innovative treatment methods, and specialized care across multiple
            medical disciplines, ensuring that every patient receives precise
            and personalized attention.
          </p>

          <p className="text-gray-700 leading-relaxed text-justify">
            How it works: Patients can access a full range of services—from
            preventive health check-ups and routine consultations to specialized
            treatments and advanced procedures. The clinic emphasizes a
            patient-centered approach, combining medical expertise with
            compassionate care. Highly trained doctors, nurses, and support
            staff work together seamlessly to evaluate each case, develop
            individualized treatment plans, and provide continuous guidance
            throughout the recovery process.
          </p>
          <p className="text-gray-700 leading-relaxed text-justify">
            Shaheen's Clinic International also incorporates telemedicine and
            digital health solutions, making it easy for patients to consult
            doctors, schedule appointments, and receive follow-ups, regardless
            of location. With a focus on innovation, professionalism, and
            empathy, the clinic ensures that every patient experiences not just
            treatment, but holistic care and wellbeing.
          </p>
          <p className="text-gray-700 leading-relaxed text-justify">
            In essence, Shaheen's Clinic International is where modern medicine
            meets personalized care, creating a healthcare experience that is
            reliable, accessible, and world-class.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="bg-white p-4 lg:p-8 rounded-2xl shadow-md  space-y-4 hover:shadow-lg transition-shadow mb-10 mt-10 duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#05b7b5] pl-3">
            Why Our Doctors Are the Best
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            <strong>At Shaheen’s Clinic </strong>,every doctor is well-trained
            in classical homeopathy and is more than just a medical
            professional—they are a beacon of care, compassion, and expertise.
            Our team is carefully chosen, bringing together specialists from
            various fields, each with years of experience and a deep commitment
            to patient wellbeing. Their collective knowledge allows us to offer
            comprehensive care, from routine check-ups to advanced medical
            treatments, ensuring that every patient receives personalized
            attention tailored to their unique needs.
          </p>
          <p className="text-gray-700 leading-relaxed text-justify">
            What sets our doctors apart is not only their qualifications but
            also their dedication to staying at the forefront of medical
            advancements. They continuously update their skills, attend
            workshops, and embrace modern technologies to provide safe,
            effective, and innovative treatments. Beyond technical expertise,
            our doctors truly understand the importance of empathy, listening,
            and building trust with patients and their families.
          </p>
          <p className="text-gray-700 leading-relaxed text-justify">
            This combination of skill, care, and human understanding creates an
            environment where patients feel supported, informed, and confident
            in their healthcare journey. Each doctor at Shaheen’s Clinic
            embodies the clinic’s core mission: to deliver excellence in
            medicine while fostering compassion and trust. Together, they form a
            cohesive team that works seamlessly to ensure the best outcomes for
            every patient.
          </p>
          <p className="text-gray-700 leading-relaxed text-justify">
            Choosing Shaheen’s Clinic means choosing a team of medical
            professionals who treat not just the illness, but the whole
            person—dedicated, knowledgeable, and wholeheartedly
            committed to your health.
          </p>
        </div>
      </div>

      <div>
        <Appointment />
      </div>

      {/* contact info */}

      <Footer />
    </div>
  );
}

export default Page;
