"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Resource = {
  id: number;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const resources: Resource[] = [
  {
    id: 1,
    title: "Research Papers",
    description:
      "Browse scientific research papers on homeopathic treatments, case studies, and efficacy analyses for chronic and complex conditions.",
    href: "/blogs",
    cta: "View Research Papers",
  },
  {
    id: 2,
    title: "Published Articles",
    description:
      "Read expert-written articles about recent advancements, methodologies, and the science behind homeopathy.",
    href: "/forum",
    cta: "Read Published Articles",
  },
  {
    id: 3,
    title: "Case Studies",
    description:
      "Explore detailed case studies from our clinic and international platforms showcasing real-world homeopathy treatments.",
    href: "/success",
    cta: "View Case Studies",
  },
  {
    id: 4,
    title: "Collaborative Research",
    description:
      "Learn about joint research initiatives with international homeopathic institutions and universities.",
    href: "/dashboard/create-blog",
    cta: "Explore Collaborative Research",
  },
  {
    id: 5,
    title: "Research Methodology",
    description:
      "Understand research methodologies used in homeopathy: data collection, case analysis, and evidence-based approaches.",
    href: "/blogs",
    cta: "Learn About Research Methodology",
  },
  {
    id: 6,
    title: "Homeopathy Research survey",
    description:
      "We invite you to share your experience and thoughts about homeopathic treatment.",
    href: "/blogs",
    cta: "Survey Form",
  },
];

export default function ResearchSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
            Scientific Papers 
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
            Explore a curated collection of research, case studies and expert articles to
            deepen your understanding of Classical Homeopathy and evidence-informed
            practices.
          </p>
        </div>
        <div className="hidden sm:block">
          <Link
            href="/blogs"
            aria-label="Research overview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium bg-[#0cb8b6] text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            Browse all research
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((r, idx) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, type: "spring", stiffness: 90 }}
            className="bg-white border border-slate-100 rounded-2xl hover:shadow-xl transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0cb8b6]"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-slate-50 to-slate-100">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M4 7h16M4 12h16M4 17h10"
                        stroke="#0cb8b6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                </div>
                
              </div>

              <p className="text-sm text-slate-600 mb-6 flex-1">{r.description}</p>

              <div className="mt-4 pt-2">
                <Link
                  href={r.href}
                  aria-label={`${r.cta} - ${r.title}`}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm shadow-sm hover:translate-y-[-1px] transition-transform"
                  style={{ backgroundColor: "#0cb8b6", color: "white" }}
                >
                  {r.cta}
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-8 sm:hidden">
        <Link
          href="/research-overview"
          className="block text-center px-4 py-3 rounded-xl bg-[#0cb8b6] text-white font-medium shadow-md"
        >
          Browse all research
        </Link>
      </div>
    </section>
  );
}
