"use client";
import { formatDate } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { LucideClock2, SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  published: boolean;
  publishedAt?: Date | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  shortDescription: string;
  patientName?: string | null;
  patientAge?: number | null;
  condition?: string | null;
  treatmentDuration?: string | null;
  outcome?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

const CaseStudyCard = ({ caseStudy }: CaseStudyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const overlayDirection = "left";

  const overlayVariants = {
    left: {
      initial: { x: "-100%" },
      animate: {
        x: 0,
        transition: {
          type: "tween",
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.4,
        },
      },
      exit: {
        x: "-100%",
        transition: {
          type: "tween",
          ease: [0.55, 0.085, 0.68, 0.53],
          duration: 0.3,
        },
      },
    },
  };

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.1,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <article
      key={caseStudy.id}
      className="max-w-xl gap-0 bg-[#EDEDED] relative"
    >
      <div
        className="aspect-4/3 overflow-hidden relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={caseStudy.featuredImage || "/avatar.jpg"}
          alt={caseStudy.featuredImageAlt || caseStudy.title}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.div
              className="bg-white/85 absolute w-full h-full grid place-items-center"
              variants={overlayVariants[overlayDirection] as any}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.a
                href={`/success/${caseStudy.slug}`}
                variants={iconVariants as any}
                initial="initial"
                animate="animate"
                className="absolute inset-0 w-full h-full grid place-items-center"
                exit="exit"
              >
                <SearchIcon size={32} className="text-primary" />
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="transition-all p-4">
        <div className="flex flex-wrap gap-4 text-xs">
          <time
            dateTime={formatDate(caseStudy.publishedAt || caseStudy.createdAt)}
            className="text-gray-800 text-sm inline-flex items-center gap-1"
          >
            <LucideClock2 size={16} />
            {formatDate(caseStudy.publishedAt || caseStudy.createdAt)}
          </time>
          {caseStudy.condition && (
            <p className="relative z-10 rounded bg-blue-50 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-100">
              {caseStudy.condition}
            </p>
          )}
        </div>
        <div className="group relative grow">
          <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-gray-600">
            <Link href={`/success/${caseStudy.slug}`}>
              <span className="absolute inset-0" />
              {caseStudy.title.slice(0, 50)}
              {caseStudy.title.length > 50 ? "..." : ""}
            </Link>
          </h3>
          <p className="mt-5 line-clamp-3 font-normal text-sm text-gray-600">
            {caseStudy.shortDescription}
          </p>
        </div>
        {(caseStudy.patientName || caseStudy.patientAge) && (
          <div className="mt-4 text-sm text-gray-600">
            {caseStudy.patientName && (
              <span className="font-semibold">
                Patient: {caseStudy.patientName}
              </span>
            )}
            {caseStudy.patientAge && (
              <span className="ml-2">({caseStudy.patientAge} years)</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default CaseStudyCard;
