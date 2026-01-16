"use client";

import { Button } from "@/components/ui/button";
import { User } from "@/lib/auth";
import { Menu } from "lucide-react";
import Link from "next/link";
import { UserDropdown } from "./user-dropdown";

export function DashboardHeader({
  onMenuClick,
  user,
}: {
  onMenuClick?: () => void;
  user?: User;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/doctors"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Doctors
          </Link>
          <Link
            href="/patients"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Patients
          </Link>
          <Link
            href="/pages"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Pages
          </Link>
          <Link
            href="/blog"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Blog
          </Link>
          <Link
            href="/admin"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
