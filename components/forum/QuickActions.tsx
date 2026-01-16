"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, HelpCircle, Search } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      title: "Ask a Question",
      description: "Get help from the community",
      icon: HelpCircle,
      href: "/forum/topics/new",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Browse Topics",
      description: "Explore all discussions",
      icon: BookOpen,
      href: "/forum/topics",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Search Forum",
      description: "Find specific answers",
      icon: Search,
      href: "/forum/topics?search=",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with the forum</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
