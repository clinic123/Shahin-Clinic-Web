import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { ArrowLeftIcon } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaBriefcase,
  FaCalendar,
  FaDollarSign,
  FaEnvelope,
  FaFacebook,
  FaGraduationCap,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaTwitter,
  FaUserDoctor,
  FaYoutube,
} from "react-icons/fa6";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ScopeRecord {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  bio: string | null;
  experience: number;
  education: string;
  consultationFee: number;
  availableDays: string[];
  status: "ACTIVE" | "INACTIVE";
  profileImage: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function getScope(id: string): Promise<ScopeRecord | null> {
  // Validate id
  if (!id || id.trim() === "") {
    return null;
  }

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedScope = unstable_cache(
    async () => {
      // Try both id and userId to handle both cases (similar to doctor details page)
      const scope = await prisma.scope.findFirst({
        where: {
          OR: [{ id: id.trim() }, { userId: id.trim() }],
        },
        select: {
          id: true,
          name: true,
          specialization: true,
          department: true,
          email: true,
          phone: true,
          bio: true,
          experience: true,
          education: true,
          consultationFee: true,
          availableDays: true,
          status: true,
          profileImage: true,
          facebookUrl: true,
          twitterUrl: true,
          youtubeUrl: true,
          linkedinUrl: true,
          instagramUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return scope;
    },
    [`scope-${id}`],
    {
      tags: [`scope-${id}`, "scopes"],
      revalidate: 60, // Revalidate every 60 seconds to show updated scopes
    }
  );

  return getCachedScope();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const scope = await getScope(id);

  if (!scope) {
    return {
      title: "Scope Doctor Not Found - Shaheen's Clinic",
      description: "The requested scope doctor profile could not be found.",
    };
  }

  return {
    title: `${scope.name} - ${scope.specialization} | Scope Doctor | Shaheen's Clinic`,
    description: scope.bio || `${scope.specialization} scope doctor at Shaheen's Clinic. ${scope.department} department.`,
    keywords: `${scope.name}, ${scope.specialization}, scope doctor, ${scope.department}, homeopathic doctor, Shaheen's Clinic`,
  };
}

export default async function ScopeDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const scope = await getScope(id);

  if (!scope) {
    notFound();
  }

  const hasSocialMedia =
    scope.facebookUrl ||
    scope.twitterUrl ||
    scope.youtubeUrl ||
    scope.linkedinUrl ||
    scope.instagramUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Scope Doctor Profile
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Comprehensive professional information
              </p>
            </div>
            <Link href="/scope">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Scope Doctors
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Hero Card */}
            <Card className="overflow-hidden pt-0 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-0">
                <div className="bg-linear-to-r from-primary/90 to-primary h-32"></div>
                <div className="px-6 pb-6 -mt-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                    {/* Profile Image */}
                    <div className="relative">
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-blue-200">
                        {scope.profileImage ? (
                          <Image
                            src={scope.profileImage}
                            alt={scope.name}
                            fill
                            className="object-cover"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl text-blue-600 font-bold">
                              {scope.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                        <FaUserDoctor className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>

                    {/* Name and Badges */}
                    <div className="flex-1 pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {scope.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 text-sm font-semibold"
                            >
                              {scope.specialization}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-green-300 text-green-700 bg-green-50 px-3 py-1 text-sm font-semibold"
                            >
                              {scope.department}
                            </Badge>
                            <Badge
                              variant={
                                scope.status === "ACTIVE"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`${
                                scope.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              } px-3 py-1 text-sm font-semibold`}
                            >
                              {scope.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {scope.bio && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {scope.bio}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaBriefcase className="w-5 h-5 text-blue-600" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-colors">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FaBriefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Experience
                        </label>
                        <p className="text-gray-900 font-bold text-xl mt-1">
                          {scope.experience}{" "}
                          {scope.experience === 1 ? "Year" : "Years"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-transparent hover:from-purple-100 transition-colors">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <FaGraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Education
                        </label>
                        <p className="text-gray-900 font-medium mt-1">
                          {scope.education}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-transparent hover:from-green-100 transition-colors">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <FaDollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Consultation Fee
                        </label>
                        <p className="text-gray-900 font-bold text-2xl mt-1">
                          ৳{scope.consultationFee.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-transparent">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <FaCalendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-3">
                          Available Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {scope.availableDays &&
                          scope.availableDays.length > 0 ? (
                            scope.availableDays.map((day) => (
                              <Badge
                                key={day}
                                variant="outline"
                                className="bg-white border-orange-200 text-orange-700 px-3 py-1.5 font-medium"
                              >
                                {day}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaEnvelope className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href={`mailto:${scope.email}`}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 hover:shadow-md transition-all group"
                  >
                    <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FaEnvelope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                        {scope.email}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`tel:${scope.phone}`}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-transparent hover:from-green-100 hover:shadow-md transition-all group"
                  >
                    <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                      <FaPhone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Phone
                      </p>
                      <p className="text-gray-900 font-medium group-hover:text-green-600 transition-colors">
                        {scope.phone}
                      </p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Media */}
            {hasSocialMedia && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🌐</span>
                    Connect
                  </h3>

                  <div className="space-y-3">
                    {scope.facebookUrl && (
                      <a
                        href={scope.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 hover:shadow-md transition-all group"
                      >
                        <FaFacebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          Facebook
                        </span>
                      </a>
                    )}

                    {scope.twitterUrl && (
                      <a
                        href={scope.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 hover:bg-sky-100 hover:shadow-md transition-all group"
                      >
                        <FaTwitter className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-900 group-hover:text-sky-600 transition-colors">
                          Twitter
                        </span>
                      </a>
                    )}

                    {scope.instagramUrl && (
                      <a
                        href={scope.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 hover:bg-pink-100 hover:shadow-md transition-all group"
                      >
                        <FaInstagram className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                          Instagram
                        </span>
                      </a>
                    )}

                    {scope.linkedinUrl && (
                      <a
                        href={scope.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 hover:shadow-md transition-all group"
                      >
                        <FaLinkedin className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          LinkedIn
                        </span>
                      </a>
                    )}

                    {scope.youtubeUrl && (
                      <a
                        href={scope.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 hover:shadow-md transition-all group"
                      >
                        <FaYoutube className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                          YouTube
                        </span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
