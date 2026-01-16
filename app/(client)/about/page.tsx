"use client";

import Link from "next/link";

const About = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#05b7b5] via-tel-600 to-black py-20 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-wide uppercase">
          About Us
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-white/90">
          Healing through science, nature, and compassion — rooted in the art of classical homeopathy.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="bg-gradient-to-r from-[#05b7b5]/40  via-tel-600 to-gray-100 py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our Mission & Vision
            </h2>
            <div className="w-20 h-1 bg-teal-500 rounded"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              At Shaheen's Clinic, our mission is to provide world-class classical homeopathic treatment for serious and chronic diseases, grounded in the principles of holistic healing, especially homeopathy. We aim to deliver exceptional care and bring relief to patients worldwide by integrating the best practices in classical homeopathy with a compassionate, patient-centered approach.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
             Our vision is to become a globally recognized center for homeopathic healing, where patients receive the highest standard of care and where practitioners and learners can access educational resources, research, and training to further the growth of homeopathy.
            </p>

            <ul className="list-disc list-inside text-gray-700 text-lg">
              <h1 className="font-bold">We are committed to:</h1>
              <li>Healing through nature using personalized remedies</li>
              <li>Promoting education and awareness of homeopathy</li>
              <li>Building a caring global community</li>
            </ul>

            <Link
              href="/appointment"
              className="inline-block mt-8 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold text-lg shadow-md hover:bg-teal-700 transition-all"
            >
              Book Appointment
            </Link>
          </div>

          {/* Video */}
          <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/1-0vQiTP1qM"
              title="About Us Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* Our Story + Success Record */}
      <div className="bg-gradient-to-tr from-cyan-50 via-white to-teal-50 py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Our Story */}
          <div className="bg-gradient-to-r from-[#05b7b5]/40  via-tel-600 to-gray-100 rounded-2xl shadow-md p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            <div className="w-20 h-1 bg-teal-500 mt-3 mb-5 rounded"></div>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Founded by <span className="font-semibold">Dr. Shaheen Mahmud</span> in 2016, Shaheen’s Clinic grew from a belief that
              healing should be gentle, individualized, and deeply connected to nature.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              With years of research, practice, and mentorship, Dr. Mahmud built
              a center that blends homeopathic excellence with compassion and
              integrity.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Beyond treatment, the clinic contributes to global research and
              education — empowering future practitioners through workshops and
              mentorship.
            </p>
          </div>

          {/* Success Record */}
          <div className="bg-gradient-to-r from-[#05b7b5]/40  via-tel-600 to-gray-100 rounded-2xl shadow-md p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-3xl font-bold text-gray-900">Success Record</h2>
            <div className="w-20 h-1 bg-teal-500 mt-3 mb-5 rounded"></div>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Shaheen’s Clinic has successfully treated chronic and complex
              conditions — from autoimmune disorders to hormonal imbalances,
              bringing lasting recovery where conventional medicine often stops.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Regular research, publications, and patient testimonials continue
              to earn international trust, showcasing homeopathy’s deep and
              sustained results.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Each recovery is not just a treatment — it’s a story of renewed
              balance between body, mind, and spirit.
            </p>
          </div>
        </div>
      </div>

      
    </section>
  );
};

export default About;
