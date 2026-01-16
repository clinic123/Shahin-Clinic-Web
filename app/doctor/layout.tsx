import { AppSidebar } from "@/components/admin-sidebar";
import { ContentSkeleton, NavbarSkeleton } from "@/components/loading/admin";
import { Navbar } from "@/components/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSession } from "@/lib/get-session";
import { Calendar, Home, Search, Settings } from "lucide-react";
import { forbidden, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { FaBlog, FaRegCalendarCheck } from "react-icons/fa";
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Appointments",
    url: "/doctor/appointments",
    icon: FaRegCalendarCheck,
  },

  {
    title: "Blogs",
    url: "/blogs",
    icon: FaBlog,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/doctor/settings",
    icon: Settings,
  },
];

async function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();
  if (user.role !== "doctor") forbidden();
  return (
    <SidebarProvider>
      <AppSidebar user={user} items={items} />
      <SidebarInset className="w-full p-4">
        <Navbar user={user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-start gap-4">
          <div className="hidden lg:block w-[296px]">
            <Skeleton className="fixed w-[296px] left-0 top-0 h-full" />
          </div>
          <div className="flex-1">
            <NavbarSkeleton />
            <ContentSkeleton />
          </div>
        </div>
      }
    >
      <SessionProvider>{children}</SessionProvider>
    </Suspense>
  );
}
