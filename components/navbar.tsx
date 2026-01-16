import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserDropdown } from "@/components/user-dropdown";
import { User } from "@/lib/auth";
import Link from "next/link";

export async function Navbar({ user }: { user?: User }) {
  if (!user) return null;

  return (
    <header className="bg-background border-b">
      <div className="mx-auto flex  items-center justify-between px-4 py-3">
        <div className="inline-flex items-center gap-2">
          <SidebarTrigger />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-medium"
          >
            Dashboard
          </Link>
          <Link href="/" className="flex items-center gap-2 font-medium">
            Got to homepage
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
