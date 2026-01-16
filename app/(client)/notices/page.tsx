import { ClientNoticesPage } from "@/components/notices/client-notices-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notice Management",
  description: "Create and manage notices for your application",
};

export default function NoticesPage() {
  return <ClientNoticesPage />;
}
