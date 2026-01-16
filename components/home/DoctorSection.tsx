import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Doctor = {
  name: string;
  description: string;
  image: string;
  button: string;
};

const doctor: Doctor = {
  name: "Dr. Shaheen Mahmud",
  description:
    "Dr. Shaheen Mahmud as a dedicated home for Classical Homeopathy, offering time-tested healing methods for those seeking natural treatment. Over the years, Shaheen's Clinic has built a reputation for providing international standard classical homeopathic treatments for serious and complex diseases, with a primary focus on holistic healing.",
  image: "https://res.cloudinary.com/dpsgtszzi/image/upload/v1762260084/doctor_vsxfoe.png",
  button: "Book Appointment",
};

const DoctorSection: React.FC = () => {
  return (
    <section id="doctor"
      className=" w-full   bg-white relative bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(${"/mari.jpg"})`,
      }}
    >
      {/* Foreground Content */}
      <div className="relative z-10 container mx-auto flex items-center justify-center">
        <div className="flex flex-col lg:grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Text Section */}
          <div className="flex-1  pt-12 lg:py-20 xl:py-40 lg:col-span-7">
            <h3 className="text-3xl md:text-5xl  font-bold mb-1">
              {doctor.name}
            </h3>
            <div className="h-0.5  w-16 bg-primary mx-0 mb-4"></div>

            <p className="text-base max-w-xl font-medium pb-4  leading-relaxed">
              {doctor.description}
            </p>
            <Link href={"/appointment"} className="inline-block">
              <Button className="">{doctor.button} </Button>
            </Link>
          </div>

          {/* Image Section */}
          <div className="flex-1 flex justify-center lg:justify-start items-end lg:col-span-5  w-full">
            <Image
              width={450}
              height={450}
              src={doctor.image}
              alt={doctor.name}
              className="w-full mx-auto object-contain h-[700px] "
            />
          </div>
        </div>
      </div>
      <Button className="absolute left-1/2 z-20 -translate-x-1/2 bottom-6 lg:-bottom-4">
        FIND OUT MORE
      </Button>
    </section>
  );
};

export default DoctorSection;
