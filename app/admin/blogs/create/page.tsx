import CreateBlogPage from "@/components/blog/CreateBlog";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateBlogPageScreen() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
        </Link>

        <div className="flex justify-center">
          <CreateBlogPage params="admin" />
        </div>
      </div>
    </main>
  );
}
