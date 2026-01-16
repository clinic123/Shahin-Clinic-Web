import React from "react";

export default function Page() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Shaheen’s Clinic:{" "}
            <span className="text-[#05b7b5] ">
              Holistic Homeopathic Care in Tangail, Bangladesh
            </span>
          </h1>
        </div>

        {/* Overview */}
        <section className="bg-white rounded-2xl shadow-md p-8 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#05b7b5] pl-3">
            Overview
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            Shaheen’s Clinic, located on Milk Viva Road, Dewla, Tangail, is a
            leading homeopathic healthcare center dedicated to providing
            compassionate, patient-centered, and holistic care. Founded and led
            by <strong>Dr. Shaheen Mahmud</strong>, the clinic has been serving
            the community for over a decade, blending modern homeopathic
            knowledge with a human touch.
          </p>
        </section>

        {/* Founder & Leadership */}
        <section className="bg-[#05b7b5] rounded-2xl shadow-md p-8 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-white pl-3">
            Founder & Leadership
          </h2>
          <p className="text-white leading-relaxed text-justify">
            <strong>Dr. Shaheen Mahmud</strong>, born on 11 July 1982 in
            Rampur, Tangail, is a highly skilled homeopathy practitioner with
            over 13 years of experience. He completed DHMS from Gaziipur
            Homeopathic Medical College, PDT (Hom) from Bangladesh Homeopathic
            Foundation, and a Post-Graduate (Hom) degree from Hahnemann College
            of Homeopathy, London. He also trained under the renowned{" "}
            <strong>Dr. B.K. Panni</strong> at Selim’s Clinic, gaining hands-on
            experience in Case Analysis and Repertory.
          </p>

          <p className="text-white leading-relaxed text-justify">
            Dr. Mahmud continues to teach as a lecturer at Model Homeopathic
            Medical College and Hospital in Mawa, Gazipur; Clinical Trainer cum
            Lecturer at Lincoln University in Malaysia; Chief Trainer cum
            Editor-in-Chief at HomeoDigest; and Research Scholar at the
            International Academy of Classical Homeopathy (IACH). He is also the
            Founder and CEO of Project SCOP, which establishes a modern
            telemedicine system for classical homeopathy in the global context.
          </p>
        </section>

        {/* Services Offered */}
        <section className="bg-white rounded-2xl shadow-md p-8 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#05b7b5] pl-3">
            Services Offered
          </h2>

          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
            <li>
              <strong>Chronic Disease Management:</strong> All acute and
              non-communicable chronic diseases regardless of their stage.
            </li>
            <li>
              <strong>Children’s Health:</strong> Growth, development, and common
              childhood illnesses.
            </li>
            <li>
              <strong>Mental and Emotional Health:</strong> Stress, anxiety, and
              behavioral concerns.
            </li>
            <li>
              <strong>Lifestyle & Preventive Care:</strong> Personalized health
              advice, nutrition, and wellness guidance.
            </li>
            <li>
              <strong>Holistic Homeopathic Treatment:</strong> Tailored remedies
              addressing physical, emotional, and lifestyle factors.
            </li>
          </ul>
        </section>

        {/* Mission & Philosophy */}
        <section className="bg-white rounded-2xl shadow-md p-8 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#05b7b5] pl-3">
            Mission & Philosophy
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            The clinic believes in treating patients as unique individuals, not
            just symptoms. Every treatment plan is personalized, grounded in
            scientific homeopathic principles, and designed to restore balance,
            vitality, and overall well-being.
          </p>
        </section>

        {/* Community Engagement */}
        <section className="bg-white rounded-2xl shadow-md p-8 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#05b7b5] pl-3">
            Community Engagement & Education
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            Beyond clinical care, Shaheen’s Clinic emphasizes education and
            community service. Dr. Mahmud regularly writes articles and research
            papers on homeopathy, healthcare, and community health for
            newspapers, journals, and online portals. The clinic also
            participates in outreach programs, health awareness campaigns, and
            free consultation initiatives for underprivileged patients.
          </p>
        </section>

        {/* Visiting Info */}
        <section className="bg-[#05b7b5] rounded-2xl shadow-md p-8 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#ffff] pl-3">
            Visiting Shaheen’s Clinic
          </h2>
          <p className="text-white leading-relaxed text-justify">
            The clinic operates <strong>Saturday to Wednesday, 10:00 AM to 4:00 PM</strong>, 
            offering easy access to residents of Tangail and surrounding areas.
            Patients are encouraged to bring a full history of symptoms and
            lifestyle details for comprehensive care.
          </p>
        </section>
      </div>
    </div>
  );
}
