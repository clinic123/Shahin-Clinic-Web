"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/auth";
import { cn } from "@/lib/utils";

import {
  Calendar,
  ClipboardList,
  Clock,
  Home,
  Lock,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoCreateOutline } from "react-icons/io5";

const sidebarItemsConfig = {
  admin: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: ClipboardList, label: "Requests", href: "/dashboard/requests" },
    { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
    { icon: Clock, label: "Available Timings", href: "/dashboard/timings" },
    { icon: Settings, label: "Profile Settings", href: "/dashboard/settings" },
    {
      icon: IoCreateOutline,
      label: "Blogs",
      href: "/dashboard/blogs",
    },
    { icon: Lock, label: "Change Password", href: "/dashboard/password" },
  ],
  doctor: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: ClipboardList, label: "Requests", href: "/dashboard/requests" },
    { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
    { icon: Clock, label: "Available Timings", href: "/dashboard/timings" },
    { icon: Users, label: "My Patients", href: "/dashboard/patients" },
    { icon: Settings, label: "Profile Settings", href: "/dashboard/settings" },
    {
      icon: IoCreateOutline,
      label: "Blogs",
      href: "/dashboard/blogs",
    },
    { icon: Lock, label: "Change Password", href: "/dashboard/password" },
  ],
  user: [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
    { icon: Settings, label: "Profile Settings", href: "/dashboard/settings" },
    {
      icon: IoCreateOutline,
      label: "Blogs",
      href: "/dashboard/blogs",
    },
    { icon: Lock, label: "Change Password", href: "/dashboard/password" },
  ],
};

interface DashboardSidebarProps {
  className?: string;
  onClose?: () => void;
  user?: User;
}

export function DashboardSidebar({
  className,
  onClose,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const getSidebarItems = () => {
    const role = user?.role as keyof typeof sidebarItemsConfig;
    return sidebarItemsConfig[role] || sidebarItemsConfig.user;
  };

  const sidebarItems = getSidebarItems(); // Call the function to get the array

  return (
    <aside
      className={cn(
        "flex h-full fixed w-64 lg:h-[calc(260px-100vh)]  left-0 flex-col border-r bg-background",
        className
      )}
    >
      {/* User Profile */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.image || "/avatar.jpg"} alt={user?.name} />
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">
              {user?.name || "User"}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground capitalize">
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>

        {/* Availability Toggle - Only show for doctors and admins */}
        {(user?.role === "doctor" || user?.role === "admin") && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full animate-pulse bg-primary" />
              <span className="text-sm font-medium text-secondary-foreground">
                I am Available Now
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Navigation */}
      <nav className="flex-1  overflow-y-scroll lg:min-h-[340px]  xl:min-h-[450px] p-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            // Now mapping over the array, not the function
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
