"use client";

import { DoctorRecord } from "@/lib/actions/fetchDoctorsData";
import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaLinkedinIn } from "react-icons/fa";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaUserDoctor,
  FaYoutube,
} from "react-icons/fa6";

const ScopeDoctorCard = ({ doctor }: { doctor: DoctorRecord }) => {
  const [isHovered, setIsHovered] = useState(false);

  // You can choose one direction or make it dynamic based on doctor data
  const overlayDirection = "left"; // or "right", "top", "bottom"

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
    right: {
      initial: { x: "100%" },
      animate: {
        x: 0,
        transition: {
          type: "tween",
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.4,
        },
      },
      exit: {
        x: "100%",
        transition: {
          type: "tween",
          ease: [0.55, 0.085, 0.68, 0.53],
          duration: 0.3,
        },
      },
    },
    top: {
      initial: { y: "-100%" },
      animate: {
        y: 0,
        transition: {
          type: "tween",
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.4,
        },
      },
      exit: {
        y: "-100%",
        transition: {
          type: "tween",
          ease: [0.55, 0.085, 0.68, 0.53],
          duration: 0.3,
        },
      },
    },
    bottom: {
      initial: { y: "100%" },
      animate: {
        y: 0,
        transition: {
          type: "tween",
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.4,
        },
      },
      exit: {
        y: "100%",
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
    <div className="bg-white relative">
      <Link
        href={`/scope/${doctor.id}`}
        className="aspect-square overflow-hidden relative group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={doctor.profileImage || "/avatar.jpg"}
          alt={doctor.name}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Framer Motion Overlay */}
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.div
              className="bg-white/85 absolute w-full h-full grid place-items-center"
              variants={overlayVariants[overlayDirection] as any}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                variants={iconVariants as any}
                initial="initial"
                animate="animate"
                className="absolute inset-0 w-full h-full grid place-items-center"
                exit="exit"
              >
                <SearchIcon size={32} className="text-primary" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Rest of your existing code remains the same */}
      <div className="inline-flex z-10 relative left-4 -translate-y-6 items-center gap-4">
        <div
          style={{
            boxShadow: "0 0 0 6px #fff,0 0 0 0px #fff inset",
          }}
          className="w-11 h-11 relative cursor-pointer group bg-primary overflow-hidden text-white rounded-full grid place-items-center"
        >
          <div className="absolute w-0 h-0 rounded-full transition-all duration-500 ease-in-out inset-0 bg-white group-hover:w-[calc(100%-2px)] group-hover:h-[calc(100%-2px)] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
          <FaUserDoctor className="relative z-10 text-white transition-all duration-500 ease-in-out group-hover:text-primary group-hover:scale-125" />
        </div>
        {doctor.facebookUrl && (
          <a
            href={doctor.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 relative cursor-pointer group bg-[#06A6A7] overflow-hidden text-white rounded-full grid place-items-center"
            style={{
              boxShadow: "0 0 0 4px #fff,0 0 0 0px #fff inset",
            }}
          >
            <div className="absolute w-0 h-0 rounded-full  transition-all duration-500 ease-in-out inset-0 bg-white group-hover:w-[calc(100%-2px)] group-hover:h-[calc(100%-2px)] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
            <FaFacebookF
              size={14}
              className="relative z-10 text-white transition-all  duration-500 ease-in-out group-hover:text-primary group-hover:scale-125"
            />
          </a>
        )}
        {doctor.instagramUrl && (
          <a
            href={doctor.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 relative cursor-pointer group bg-[#06A6A7] overflow-hidden text-white rounded-full grid place-items-center"
            style={{
              boxShadow: "0 0 0 4px #fff,0 0 0 0px #fff inset",
            }}
          >
            <div className="absolute w-0 h-0 rounded-full transition-all duration-500 ease-in-out inset-0 bg-white group-hover:w-[calc(100%-2px)] group-hover:h-[calc(100%-2px)] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
            <FaInstagram
              size={14}
              className="relative z-10 text-white transition-all duration-500 ease-in-out group-hover:text-primary group-hover:scale-125"
            />
          </a>
        )}
        {doctor.linkedinUrl && (
          <a
            href={doctor.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 relative cursor-pointer group bg-[#06A6A7] overflow-hidden text-white rounded-full grid place-items-center"
            style={{
              boxShadow: "0 0 0 4px #fff,0 0 0 0px #fff inset",
            }}
          >
            <div className="absolute w-0 h-0 rounded-full transition-all duration-500 ease-in-out inset-0 bg-white group-hover:w-[calc(100%-2px)] group-hover:h-[calc(100%-2px)] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
            <FaLinkedinIn
              size={14}
              className="relative z-10 text-white transition-all duration-500 ease-in-out group-hover:text-primary group-hover:scale-125"
            />
          </a>
        )}
        {doctor.youtubeUrl && (
          <a
            href={doctor.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 relative cursor-pointer group bg-[#06A6A7] overflow-hidden text-white rounded-full grid place-items-center"
            style={{
              boxShadow: "0 0 0 4px #fff,0 0 0 0px #fff inset",
            }}
          >
            <div className="absolute w-0 h-0 rounded-full transition-all duration-500 ease-in-out inset-0 bg-white group-hover:w-[calc(100%-2px)] group-hover:h-[calc(100%-2px)] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
            <FaYoutube
              size={14}
              className="relative z-10 text-white transition-all duration-500 ease-in-out group-hover:text-primary group-hover:scale-125"
            />
          </a>
        )}
        {doctor.twitterUrl && (
          <a
            href={doctor.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 relative cursor-pointer group bg-[#06A6A7] overflow-hidden text-white rounded-full grid place-items-center"
            style={{
              boxShadow: "0 0 0 4px #fff,0 0 0 0px #fff inset",
            }}
          >
            <div className="absolute w-0 h-0 rounded-full transition-all duration-500 ease-in-out inset-0 bg-white group-hover:w-[calc(100%-2px)] group-hover:h-[calc(100%-2px)] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"></div>
            <FaTwitter
              size={14}
              className="relative z-10 text-white transition-all duration-500 ease-in-out group-hover:text-primary group-hover:scale-125"
            />
          </a>
        )}
      </div>

      <div className="p-4 space-y-3  pt-0">
        <p className="text-base font-medium text-neutral-700">
          {doctor.department}
        </p>
        <h3 className="text-xl font-semibold capitalize">{doctor.name}</h3>
        <p className="text-sm mb-4 font-normal text-neutral-500">
          {doctor.bio}
        </p>
      </div>
    </div>
  );
};

export default ScopeDoctorCard;
