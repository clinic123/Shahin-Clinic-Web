"use client";
import { formatDate } from "@/lib/utils";
import { PostTypeWithRelations } from "@/types/post";
import { AnimatePresence, motion } from "framer-motion";
import { LucideClock2, SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
interface BlogCardProps {
  post: PostTypeWithRelations;
}

const BlogCard = ({ post }: BlogCardProps) => {
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
    <article key={post.id} className="max-w-xl gap-0  bg-[#EDEDED] relative ">
      <div
        className="aspect-4/3 overflow-hidden relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={post.featuredImage || "/avatar.jpg"}
          alt={post.title}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <motion.a
                href={`/blogs/${post.slug}`}
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
            dateTime={formatDate(post.publishedAt)}
            className="text-gray-800 text-sm inline-flex items-center gap-1"
          >
            <LucideClock2 size={16} />
            {formatDate(post.publishedAt)}
          </time>
          <p className="relative z-10 rounded bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">
            {post.category.name}
          </p>
        </div>
        <div className="group relative grow">
          <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-gray-600">
            <Link href={`/blogs/${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title.slice(0, 50)}...
            </Link>
          </h3>
          <p className="mt-5 line-clamp-3 font-bold text-sm text-black">
            {post.shortDescription}
          </p>
        </div>
        {/* <div className="relative mt-8 flex items-center gap-x-4">
          <img
            alt=""
            src={post.author.image as string}
            className="size-10 rounded-full bg-gray-50"
          />
          <div className="text-sm/6">
            <p className="font-semibold text-gray-900">
              <>
                <span className="absolute inset-0" />
                {post.author.name}
              </>
            </p>
            <p className="text-gray-600">{post.author.role}</p>
          </div>
        </div> */}
      </div>
    </article>
  );
};

export default BlogCard;
