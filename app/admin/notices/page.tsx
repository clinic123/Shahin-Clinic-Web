import { NoticeManager } from "@/components/notices/notice-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notice Management",
  description: "Create and manage notices for your application",
};

export default function NoticesPage() {
  return <NoticeManager />;
}
