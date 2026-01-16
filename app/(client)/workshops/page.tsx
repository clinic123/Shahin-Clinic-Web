"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  topic: string;
};

type Recording = {
  id: number;
  title: string;
  date: string;
  duration: string;
  topic: string;
  link: string;
};

const upcomingEvents: Event[] = [
  {
    id: 1,
    title: "Introduction to Advanced Homeopathic Techniques",
    date: "November 15, 2025",
    time: "7:00 PM - 9:00 PM (BST)",
    location: "Virtual (Zoom)",
    topic:
      "An interactive session covering modern homeopathic diagnostic tools and holistic patient management.",
  },
  {
    id: 2,
    title: "Clinical Practice Workshop on Chronic Cases",
    date: "December 10, 2025",
    time: "5:00 PM - 8:00 PM (BST)",
    location: "In-person (Shaheen’s Clinic, Dhaka)",
    topic:
      "Hands-on learning focused on real-world treatment strategies for chronic diseases.",
  },
];

const pastRecordings: Recording[] = [
  {
    id: 1,
    title: "Foundations of Classical Homeopathy",
    date: "September 2025",
    duration: "2 hours",
    topic:
      "A comprehensive overview of the core principles and methodologies in homeopathic practice.",
    link: "/course", // directs to contact page
  },
  {
    id: 2,
    title: "Remedy Selection & Case Management",
    date: "August 2025",
    duration: "1.5 hours",
    topic:
      "Practical guidance on remedy selection, potency decisions, and managing complex cases.",
    link: "/course",
  },
];

export default function WebinarsWorkshops() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
          Webinars & Workshops
        </h2>
        <p className="text-slate-600 max-w-3xl mx-auto text-sm sm:text-base">
          At Shaheen's Clinic, we are committed to fostering continuous learning
          and professional growth within the homeopathic community. Our webinars
          and workshops offer interactive experiences that provide the latest
          knowledge, research, and practical insights from renowned experts.
        </p>
      </div>

      {/* Upcoming Events */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Upcoming Events
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {upcomingEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
            >
              <h4 className="text-lg font-semibold mb-2 text-[#0cb8b6]">
                {event.title}
              </h4>
              <ul className="text-sm text-slate-600 space-y-1 mb-4">
                <li>
                  <strong>Date:</strong> {event.date}
                </li>
                <li>
                  <strong>Time:</strong> {event.time}
                </li>
                <li>
                  <strong>Location:</strong> {event.location}
                </li>
              </ul>
              <p className="text-sm text-slate-600 mb-4">{event.topic}</p>
              <a
                target="_blank"
                href="https://docs.google.com/forms/d/e/1FAIpQLSeA_76gY8aL4oRwKGYwlLdKt7I_omMSFhmLgd7oErdZzjjpYQ/viewform"
                className="inline-block mt-auto px-4 py-2 rounded-lg font-medium text-sm text-white shadow-sm hover:shadow-md transition-transform"
                style={{ backgroundColor: "#0cb8b6" }}
              >
                Contact to Register
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Past Recordings */}
      <div>
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Past Recordings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {pastRecordings.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
            >
              <h4 className="text-lg font-semibold mb-2 text-[#0cb8b6]">
                {rec.title}
              </h4>
              <ul className="text-sm text-slate-600 space-y-1 mb-4">
                <li>
                  <strong>Date:</strong> {rec.date}
                </li>
                <li>
                  <strong>Duration:</strong> {rec.duration}
                </li>
              </ul>
              <p className="text-sm text-slate-600 mb-4">{rec.topic}</p>
              <Link
                href={rec.link}
                className="inline-block px-4 py-2 rounded-lg font-medium text-sm text-white shadow-sm hover:shadow-md transition-transform"
                style={{ backgroundColor: "#0cb8b6" }}
              >
                Contact to Watch
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
