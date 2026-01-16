import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - Shaheen's Clinic",
  description: "Complete your purchase at Shaheen's Clinic.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


