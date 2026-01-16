import MediaGallery from "@/components/home/MediaGallery";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Dr. Shaheen Mahmud - The Healer Who Listens",
  description:
    "Learn about Dr. Shaheen Mahmud, a classical homeopathic practitioner dedicated to compassionate care and holistic healing in Bangladesh.",
};

// Force static generation for optimal performance
export const dynamic = "force-static";

export default function Page() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Main container */}
        <div className="flex flex-col md:flex-row items-start gap-10 bg-[#05b7b5] shadow-lg rounded-2xl p-6 md:p-10">
          {/* Left side: Doctor Image */}
          <div className="w-full md:w-1/3 flex justify-center">
            <Image
              src="https://res.cloudinary.com/dpsgtszzi/image/upload/v1762260084/doctor_vsxfoe.png"
              alt="Dr. Shaheen Mahmud"
              width={400}
              height={400}
              className="rounded-full bg-white object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 400px"
              quality={85}
            />
          </div>

          {/* Right side: Doctor Content */}
          <div className="w-full md:w-2/3 text-white leading-relaxed space-y-4">
            <h1 className="text-3xl font-bold text-white">
              Dr. Shaheen Mahmud
            </h1>
            <h2 className=" text-gray-50">"The Healer Who Listens"</h2>

            <p>
              On a warm July day in 1982, in the quiet village of Rampur,
              Tangail, a boy was born who would grow to bridge science and
              humanity in a singular way. Shaheen Mahmud’s early life was
              steeped in the rhythms of rural Bangladesh, yet his mind was drawn
              to the intricate patterns of knowledge and the profound call of
              service.
            </p>

            <p>
              His return to medicine was not casual. In 2012, he completed his
              DHMS at Gaziipur Homeopathic Medical College, followed by PDT
              (Hom) at the Bangladesh Homeopathic Foundation. His education
              extended far beyond textbooks — exploring the fields of Children
              Studies, Psychology, Genes, and Genetic Technology.
            </p>

            <p>
              By then, he had already begun shaping the healthcare landscape of
              Bangladesh. At Shaheen’s Clinic, Dr. Mahmud treats patients not as
              cases, but as stories — each one deserving time, empathy, and
              precision.
            </p>

            <p>
              Dr. Shaheen Mahmud’s philosophy rests on one powerful belief:
              healing begins with understanding. His blend of classical
              homeopathy and compassionate care continues to inspire trust and
              transformation across Bangladesh.
            </p>
          </div>
        </div>

        {/* Image Gallery */}
        <div>
          <h2 className="text-3xl pt-16 font-semibold text-gray-800 mb-6 text-center">
            Certificate
          </h2>

          <div>
            <MediaGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
