import CaseStudyList from "@/components/case-study/CaseStudyList";
import { HeartPulse, MessageCircle, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cured Case Studies - Shaheen's Clinic | Patient Success Stories",
  description:
    "Explore real patient success stories and cured case studies from Shaheen's Clinic. Discover how classical homeopathy has helped patients worldwide overcome chronic conditions and achieve healing.",
  keywords:
    "case studies, patient success stories, homeopathy success, cured patients, treatment outcomes, homeopathic results",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function SuccessStories({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className="relative overflow-hidden py-20 px-6 bg-gradient-to-b from-[#f6fff8] to-[#ffffff]">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary)] mb-6">
            Cured Case Studies
          </h1>
          <p className="text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
            We have successfully provided homeopathic treatments to patients
            worldwide — both in-person at our clinic and through virtual
            consultations via <strong>SCOP</strong>. These success stories are a
            testament to the healing power of homeopathy and our mission to
            nurture a global community of hope, learning, and transformation.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <HeartPulse className="w-12 h-12 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Real Healing Stories
            </h3>
            <p className="text-gray-600 leading-relaxed">
              From chronic conditions to emotional wellness — our patients share
              inspiring journeys of recovery and renewed health through
              classical homeopathy.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Global Community
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We connect patients and practitioners from around the world,
              sharing experiences, knowledge, and hope through our supportive
              homeopathic community.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Share Your Story
            </h3>
            <p className="text-gray-600 leading-relaxed">
              If you've been treated at Shaheen's Clinic, SCOP, or Shaheen's
              Clinic International, we encourage you to share your healing
              journey to inspire others.
            </p>
            <Link href="/contact">
              <button className="mt-5 bg-[var(--primary)] underline cursor-pointer text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition">
                Submit Your Case
              </button>
            </Link>
          </div>
        </div>

        {/* Case Studies List */}
        <CaseStudyList
          sort={params.sort}
          search={params.search}
          page={params.page}
          limit={params.limit}
        />

        {/* Closing Statement */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <p className="text-gray-700 text-lg leading-relaxed">
            Every story reminds us of the incredible potential within holistic
            healing. Your experience can help others discover the hope and
            strength they need to begin their journey.
          </p>
        </div>
      </div>
    </section>
  );
}
