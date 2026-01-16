import CreateCaseStudyPage from "@/components/case-study/CreateCaseStudy";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCaseStudyPageScreen() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <Link href="/admin/case-studies">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Case Studies
          </Button>
        </Link>

        <div className="flex justify-center">
          <CreateCaseStudyPage params="admin" />
        </div>
      </div>
    </main>
  );
}

