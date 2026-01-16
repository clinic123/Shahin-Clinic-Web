"use client";

import type React from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { User } from "@/lib/auth";
import { useState } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import Header from "./header";

export function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: User;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex  flex-col">
      <Header
        className="sticky top-0 z-40 border-b bg-background"
        user={user}
        hideDashboardMenu={false}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden xl:block w-64">
          <DashboardSidebar user={user} />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader>
              <SheetTitle></SheetTitle>
            </SheetHeader>
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
