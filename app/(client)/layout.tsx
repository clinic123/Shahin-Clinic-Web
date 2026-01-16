import Footer from "@/components/Footer";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "@/lib/get-session";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "Shaheen's Clinic - Classical Homeopathy & Holistic Healing",
    template: "%s | Shaheen's Clinic",
  },
  description: "Shaheen's Clinic - A leading center for classical homeopathic treatment, offering personalized care for chronic diseases, comprehensive medical education, and holistic healing services in Bangladesh and worldwide.",
  keywords: "homeopathy, classical homeopathy, Shaheen's Clinic, holistic healing, chronic disease treatment, homeopathic medicine, Bangladesh, Dr. Shaheen Mahmud",
  authors: [{ name: "Shaheen's Clinic" }],
  creator: "Shaheen's Clinic",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Shaheen's Clinic",
    title: "Shaheen's Clinic - Classical Homeopathy & Holistic Healing",
    description: "Leading center for classical homeopathic treatment and holistic healing in Bangladesh",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shaheen's Clinic - Classical Homeopathy & Holistic Healing",
    description: "Leading center for classical homeopathic treatment and holistic healing",
  },
};

async function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <>
      <Header user={user} />
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <>
          <Header user={undefined} />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </>
      }
    >
      <SessionProvider>
        <main>{children}</main>
      </SessionProvider>
      <Footer />
      <Toaster />
    </Suspense>
  );
}
