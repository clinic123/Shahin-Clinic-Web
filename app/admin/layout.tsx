import { AppSidebar } from "@/components/admin-sidebar";
import { ContentSkeleton, NavbarSkeleton } from "@/components/loading/admin";
import { Navbar } from "@/components/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSession } from "@/lib/get-session";
import { Home, Settings } from "lucide-react";
import { forbidden, unauthorized } from "next/navigation";
import { Suspense } from "react";
import {
  FaFirstOrder,
  FaNotesMedical,
  FaRegCalendarCheck,
} from "react-icons/fa";
import {
  Fa42Group,
  FaBlog,
  FaCartShopping,
  FaImagePortrait,
  FaPhotoFilm,
  FaUserDoctor,
  FaUserGraduate,
} from "react-icons/fa6";
import { MdAdminPanelSettings } from "react-icons/md";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Admin Home",
    url: "/admin",
    icon: MdAdminPanelSettings,
  },
  {
    title: "Appointments",
    url: "/admin/appointments",
    icon: FaRegCalendarCheck,
  },
  {
    title: "Doctors",
    url: "/admin/doctors",
    icon: FaUserDoctor,
  },
  {
    title: "Scopes",
    url: "/admin/scopes",
    icon: FaUserDoctor,
  },
  {
    title: "Students",
    url: "/admin/students",
    icon: FaUserGraduate,
  },
  {
    title: "Blogs",
    url: "/admin/blogs",
    icon: FaBlog,
  },
  {
    title: "Case Studies",
    url: "/admin/case-studies",
    icon: FaNotesMedical,
  },
  {
    title: "Courses",
    url: "/admin/courses",
    icon: Fa42Group,
  },
  {
    title: "Course Orders",
    url: "/admin/course-orders",
    icon: FaCartShopping,
  },
  {
    title: "Books",
    url: "/admin/books",
    icon: Fa42Group,
  },
  {
    title: "Books Orders",
    url: "/admin/orders",
    icon: FaFirstOrder,
  },

  {
    title: "Galleries",
    url: "/admin/galleries",
    icon: FaPhotoFilm,
  },
  {
    title: "Banners",
    url: "/admin/banners",
    icon: FaImagePortrait,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Notices",
    url: "/admin/notices",
    icon: FaNotesMedical,
  },
];

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();
  if (user.role !== "admin") forbidden();

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

export default function Layout({ children }: { children: React.ReactNode }) {
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
      <AdminLayoutContent children={children} />
    </Suspense>
  );
}
