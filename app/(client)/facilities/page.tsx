"use client";

import { Book, FileText, Layers } from "lucide-react"; // lucide-react icons
import Link from "next/link";

export default function Facilities() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Section Heading */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[var(--primary)] mb-4">
          Facilities
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          At <span className="font-semibold text-black">Shaheen's Clinic</span>,
          we strive to provide a seamless experience for all our visitors and
          learners. Our facilities include a range of resources, courses, and
          materials designed to enhance your understanding of homeopathy and
          support your professional development.
        </p>
      </div>

      {/* Facilities Sections */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* Course Bundles */}
        <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="text-[var(--primary)] w-8 h-8" />
            <h3 className="text-2xl font-semibold text-gray-800">
              Course Bundles
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            To make your learning experience more affordable and comprehensive,
            we offer course bundles. These bundles allow you to access multiple
            related courses at a discounted price.
          </p>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>
              <strong>Homeopathy Mastery Bundle:</strong> Includes foundational
              and advanced modules.
            </li>
            <li>
              <strong>Research & Case Study Bundle:</strong> Master research
              methods and clinical case management.
            </li>
            <li>
              <strong>Mental Health & Homeopathy Bundle:</strong> Treat mental
              health conditions using classical homeopathy.
            </li>
          </ul>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-[#0cb8b6] underline text-white px-6 py-2 rounded-full mt-6 hover:bg-[#0aa3a1] transition-all"
          >
            View Courses
          </Link>
        </div>

        {/* Books & Research Resources */}
        <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-6">
            <Book className="text-[var(--primary)] w-8 h-8" />
            <h3 className="text-2xl font-semibold text-gray-800">
              Books & Research Resources
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            We provide an extensive selection of books and materials to aid both
            students and practitioners in their learning and professional work.
          </p>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>
              <strong>Homeopathy Textbooks:</strong> Insights into philosophy,
              practice, and science of classical homeopathy.
            </li>
            <li>
              <strong>Research Papers & Journals:</strong> Stay updated with the
              latest developments in homeopathic medicine.
            </li>
            <li>
              <strong>Practical Guides:</strong> Step-by-step resources for
              applying homeopathy to real-life conditions.
            </li>
          </ul>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-[#0cb8b6] underline text-white px-6 py-2 rounded-full mt-6 hover:bg-[#0aa3a1] transition-all"
          >
            View Our Books
          </Link>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="mt-16 text-center max-w-3xl mx-auto shadow-md p-8 rounded-2xl bg-white hover:shadow-lg transition">
        <FileText className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
        <p className="text-gray-700 leading-relaxed">
          Whether you're seeking foundational texts or advanced research
          materials, our resources are designed to support your continued growth
          in the field of homeopathy.
        </p>
      </div>
    </section>
  );
}
