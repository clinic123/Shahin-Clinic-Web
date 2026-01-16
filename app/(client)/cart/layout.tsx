import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart - Shaheen's Clinic",
  description: "Review items in your shopping cart at Shaheen's Clinic.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


