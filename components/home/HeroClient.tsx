"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import type { BannerRecord } from "@/lib/actions/fetchBannersData";
import { buttonVariants } from "../ui/button";

interface HeroClientProps {
  banners: BannerRecord[];
}

export default function HeroClient({ banners }: HeroClientProps) {
  return (
    <Carousel className="w-full relative">
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id} className="w-full">
            <div className="relative h-[440px] overflow-hidden lg:h-[680px] flex items-center gap-16 bg-cover bg-no-repeat bg-center mx-auto lg:px-4 py-16">
              <div className="absolute z-10 inset-0 bg-black opacity-20" />
              <Image
                src={banner.image}
                alt={banner.heading[0]}
                fill
                priority
                objectFit="cover"
                className="z-0"
              />

              <div className="relative bg-black/40 rounded-md w-3xl py-5 container mx-auto text-left z-20 p-4 gap-4 ">
                <div className="flex flex-1 w-full flex-col justify-center">
                  {banner.heading.map((line, index) => (
                    <h1
                      key={index}
                      className={cn(
                        "text-4xl xl:text-5xl uppercase leading-[105%] 2xl:text-[3.75rem] font-bold",
                        index === 1 ? "text-primary" : "text-white"
                      )}
                    >
                      {line}
                    </h1>
                  ))}
                  <p className="text-sm pt-4 xl:text-base text-left max-w-xl font-medium text-neutral-100">
                    {banner.description}
                  </p>
                  <Link
                    href={banner.buttonLink || "/appointment"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants(), "w-fit mt-6")}
                  >
                    {banner.button}
                  </Link>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="absolute w-[50px] h-[100px] left-0 top-1/2 -translate-y-1/2 bg-primary/60! md:bg-primary! border-none rounded-none shadow-none  hover:text-white transition-all duration-300" />
      <CarouselNext className="absolute w-[50px] h-[100px] right-0 top-1/2 -translate-y-1/2 bg-primary/60! md:bg-primary! border-none rounded-none shadow-none  hover:text-white transition-all duration-300" />
    </Carousel>
  );
}
