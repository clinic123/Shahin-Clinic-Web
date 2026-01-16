"use client"; // ensure client-side

import Appointment from "@/components/AppointmentBook";
import StudentCard from "@/components/StudentCard";
import { Skeleton } from "@/components/ui/skeleton";

import Sapon from "@/components/home/Sapon";

import ScopeDoctorCard from "@/components/ScopeDoctorCard";
import { useScopes } from "@/hooks/useScopes";
import { useStudents } from "@/hooks/useStudents";
import type { StudentRecord } from "@/lib/actions/fetchStudentsData";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

function ScopeDoctorsSection() {
  const { data: scopesData, isLoading, error } = useScopes();
  const scopes =
    scopesData?.scopes?.filter((scope) => scope.status === "ACTIVE") || [];

  if (isLoading) {
    return (
      <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Our Executive Doctors
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our experienced scope doctors dedicated to your well-being
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-80 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center text-red-600">
            Failed to load scope doctors:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Our Executive Doctors
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet our experienced scope doctors dedicated to your well-being
          </p>
        </div>

        {scopes.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {scopes.map((scope) => (
              <ScopeDoctorCard
                key={scope.id}
                doctor={{
                  id: scope.id,

                  name: scope.name,
                  specialization: scope.specialization,
                  department: scope.department,
                  email: scope.email,
                  phone: scope.phone,
                  bio: scope.bio || "",
                  experience: scope.experience,
                  education: scope.education,
                  consultationFee: scope.consultationFee,
                  availableDays: scope.availableDays,
                  status: scope.status,
                  createdAt: scope.createdAt,
                  updatedAt: scope.updatedAt,
                  profileImage: scope.profileImage || "",
                  facebookUrl: scope.facebookUrl || "",
                  twitterUrl: scope.twitterUrl || "",
                  youtubeUrl: scope.youtubeUrl || "",
                  linkedinUrl: scope.linkedinUrl || "",
                  instagramUrl: scope.instagramUrl || "",
                  userId: scope.userId || "",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No scope doctors available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}

function Page() {
  const { data, isLoading, error } = useStudents();
  const students: StudentRecord[] = useMemo(() => {
    if (!data?.students) return [];
    return data.students.map((student) => {
      // Handle createdAt - could be string or Date
      const createdAtValue = student.createdAt as string | Date;
      const updatedAtValue = student.updatedAt as string | Date;

      const formatDate = (value: string | Date): string => {
        if (typeof value === "string") return value;
        if (value instanceof Date) return value.toISOString();
        return String(value);
      };

      return {
        id: student.id,
        name: student.name,
        description: student.description ?? null,
        image: student.image ?? null,
        facebookUrl: student.facebookUrl ?? null,
        twitterUrl: student.twitterUrl ?? null,
        youtubeUrl: student.youtubeUrl ?? null,
        linkedinUrl: student.linkedinUrl ?? null,
        instagramUrl: student.instagramUrl ?? null,
        createdAt: formatDate(createdAtValue),
        updatedAt: formatDate(updatedAtValue),
      };
    });
  }, [data?.students]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* ===== Header ===== */}
      <div className="bg-white shadow-md border-b">
        <header className="flex justify-between container mx-auto items-center p-4 md:p-6 ">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/ ">
              <Image
                src="/scope-logo.jpeg" // replace with your logo path
                alt="Logo"
                width={150}
                height={50}
                className="object-contain rounded-md w-16"
              />
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-2xl text-gray-700">
            <a
              href="https://www.facebook.com/scop.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06A6A7] transition-colors border rounded-full p-1 border-gray-100 bg-green-50"
            >
              <FaFacebook />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06A6A7] transition-colors border rounded-full p-1 border-gray-100 bg-green-50"
            >
              <FaYoutube />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#06A6A7] transition-colors border rounded-full p-1 border-gray-100 bg-green-50"
            >
              <FaInstagram />
            </a>
          </div>
        </header>
      </div>

      {/* ===== Banner Section ===== */}
      <section className="relative w-full z-10  py-16">
        {/* Background Image */}

        <Image
          src="https://res.cloudinary.com/dpsgtszzi/image/upload/v1762269122/building_gkmw7t.jpg"
          alt="Banner"
          fill
          className="object-cover z-0"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"></div>
        <div className="text-center mx-auto relative z-20 text-white px-4 max-w-4xl">
          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Scop</h1>

          {/* Breadcrumb */}
          <nav className="text-sm md:text-base mb-6">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>{" "}
            / <span className="text-gray-300">Scop Page</span>
          </nav>

          {/* Description */}
          <p className="text-sm md:text-lg leading-relaxed text-gray-200">
            SCOP — Bangladesh’s first and only online platform dedicated to
            practical Classical Homeopathy. Here, students and young
            practitioners get the unique opportunity to learn and apply
            real-world homeopathic treatment under the direct supervision of
            highly skilled and experienced homeopathic doctors. Founded by Dr.
            Shaheen Mahmud, one of Bangladesh’s leading classical homeopaths,
            SCOP is committed to nurturing the next generation of true classical
            healers through authentic, experience-based learning.
          </p>
        </div>
      </section>

      {/* ===== Page Content ===== */}
      <main className="text-center bg-gradient-to-br from-[#05b7b5]/40 via-white to-green-100">
        <div className="container">
          <h2 className="text-2xl md:text-4xl pt-5 font-bold mb-5">
            Our Founder
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
            Dr. Shaheen Mahmud, the founder of Shaheen's Clinic, has dedicated
            their career to exploring and mastering the principles of classical
            homeopathy. With a deep passion for holistic healing, Dr. Mahmud
            established the clinic with the vision of providing compassionate
            care to all patients worldwide.
          </p>
          {/* Image */}
          <div className="w-full aspect-video relative overflow-hidden mx-auto justify-center items-center flex mt-10  mb-4">
            <Image
              fill
              priority
              src="https://res.cloudinary.com/dpsgtszzi/image/upload/v1762267549/founder_x51ol1.png"
              alt="doctor shaheen mahmud"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
        {/* Text below image */}
      </main>

      <div className="container rounded-2xl py-6">
        <div className="  space-y-4  ">
          <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-[#05b7b5] pl-3">
            Shaheen's Clinic Online Program (SCOP)
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            <strong>The Shaheen’s Clinic Online Program (SCOP) </strong>, is an
            innovative initiative aimed at addressing the core challenges facing
            homeopathy in Bangladesh. The project seeks to break the cycle of
            decline in the homeopathic profession by offering proper education,
            mentorship, and real-world medical training. The current issues,
            such as a lack of qualified educators and mentors, result in the
            perpetuation of unskilled practitioners who fail to meet the needs
            of the community. SCOP aims to break this cycle and create a new
            generation of well-trained, ethical, and compassionate homeopathic
            practitioners.
          </p>

          <p className="text-gray-700 leading-relaxed text-justify">
            <strong>The vision of SCOP includes: </strong>,
            <div className="space-y-4 mt-5">
              <h1 className="font-semibold">
                Expanding the reach and practice of genuine homeopathy.
              </h1>
              <h1 className="font-semibold">
                Offering widespread education and training in classical
                homeopathy.
              </h1>
              <h1 className="font-semibold">
                Establishing a self-sufficient, dedicated homeopathic community.
              </h1>
              <h1 className="font-semibold">
                Launching homeopathic research projects.
              </h1>
              <p className="text-gray-700 leading-relaxed text-justify">
                Setting up the Scientific Research Institute of Homeopathy
                (SRIH) for advanced training.
              </p>
              <h1 className="font-semibold">
                Creating both real and online hospitals for wider healthcare
                delivery.
              </h1>

              <p className="text-gray-700 leading-relaxed text-justify">
                SCOP also emphasizes the importance of mentorship, with every
                member being part of a larger movement dedicated to learning and
                serving. Under the leadership of Dr. Shaheen Mahmud, this
                project ensures a transformative approach to homeopathy, where
                education and practical experience go hand-in-hand, allowing
                students to gain hands-on skills in managing patients and cases.
              </p>

              <p className="text-gray-700 leading-relaxed text-justify">
                In addition to online medical services provided through
                Shaheen's Clinic branches across the country, SCOP offers
                participants a unique opportunity to receive income while
                undergoing practical training. Executive officers in each
                district work closely with trained homeopathic doctors, helping
                to monitor and manage cases, while also benefiting from a steady
                income stream and valuable professional experience. SCOP's model
                encourages the growth of a dedicated community of homeopathic
                practitioners, capable of making a lasting impact on healthcare
                in Bangladesh.
              </p>

              <p className="text-gray-700 leading-relaxed text-justify">
                For more information or to join the SCOP initiative, please get
                in touch with us at Shaheen's Clinic.
              </p>

              <p className="text-gray-700 leading-relaxed text-justify">
                No file chosenNo file chosen ChatGPT can make mistakes. OpenAI
                doesn't use Md Bulbul Ahmed gpt Plus workspace data to train
              </p>
            </div>
          </p>
          <p className="text-gray-700 leading-relaxed text-justify">
            Shaheen's Clinic International also incorporates telemedicine and
            digital health solutions, making it easy for patients to consult
            doctors, schedule appointments, and receive follow-ups, regardless
            of location. With a focus on innovation, professionalism, and
            empathy, the clinic ensures that every patient experiences not just
            treatment, but holistic care and wellbeing.
          </p>
          <p className="text-gray-700 leading-relaxed text-justify">
            In essence, Shaheen's Clinic International is where modern medicine
            meets personalized care, creating a healthcare experience that is
            reliable, accessible, and world-class.
          </p>
        </div>
      </div>

      <div className="my-10 md:px-8">
        <Appointment
          params={{
            scope: true,
          }}
        />
      </div>
      <ScopeDoctorsSection />

      {/* Students Section */}
      <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6 space-y-10">
          <div className="text-center"></div>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Our Executive Students
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our dedicated students who are learning and growing in the
              field of classical homeopathy.
            </p>
          </div>

          {isLoading && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white shadow-lg overflow-hidden rounded-xl">
                    <Skeleton className="h-60" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-4 rounded w-3/4" />
                      <Skeleton className="h-3 rounded w-full" />
                      <Skeleton className="h-3 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center text-red-600">
              Failed to load students:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </div>
          )}

          {!isLoading && !error && students.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}

          {!isLoading && !error && students.length === 0 && (
            <div className="text-center text-gray-500">
              No students available at the moment.
            </div>
          )}
        </div>
      </section>

      <Sapon />
    </div>
  );
}

export default Page;
