import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ScopeNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Scope Doctor Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The scope doctor profile you're looking for doesn't exist or may
            have been removed.
          </p>
        </div>
        <Link href="/scope">
          <Button className="w-full sm:w-auto">← Back to Scope Doctors</Button>
        </Link>
      </div>
    </div>
  );
}

