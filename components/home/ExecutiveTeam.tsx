"use client";

import { useDoctors } from "@/hooks/useDoctors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DoctorCard from "../DoctorCard";
import { Button } from "../ui/button";

const ExecutiveTeam = ({
  sort,
  search,
  params,
  limit,
}: {
  sort?: string;
  search?: string;
  limit?: string;
  params: "homepage" | "doctors";
}) => {
  const { data: doctors, isLoading, error } = useDoctors();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const router = useRouter();
  const displayDoctors = doctors?.doctors?.slice(0, 4) || [];

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const getRatingColor = (experience: number) => {
    if (experience >= 15) return "text-green-600";
    if (experience >= 10) return "text-blue-600";
    if (experience >= 5) return "text-yellow-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
             Our Executive Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our experienced healthcare professionals dedicated to your
              well-being
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

  return (
    <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        {params === "homepage" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-5 text-black text-3xl md:text-4xl  uppercase font-bold">
              <h1>  Our Executive Team</h1>
              <div className="w-24 h-0.5 bg-primary justify-center mx-auto mt-3" />
            </div>
            <p className="text-gray-600 text-center  mb-10 text-sm lg:text-base ">
              Shaheen's Clinic was established in 2016 by Dr. Shaheen Mahmud as
              a dedicated home for Classical Homeopathy, offering time-tested
              healing methods for those seeking natural.
            </p>
          </div>
        )}

        {/* Doctors Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayDoctors.map((member) => (
            <DoctorCard key={member.id} doctor={member} />
          ))}
        </div>

        
      </div>

      {/* Custom CSS for line clamp */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default ExecutiveTeam;
