import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders - Shaheen's Clinic",
  description: "View your order history and track your purchases at Shaheen's Clinic.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


