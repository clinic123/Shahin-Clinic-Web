import { AppToaster } from "@/components/app-toaster";
import Providers from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "@/styles/globals.css";
import "@/styles/index.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "react-phone-number-input/style.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const getMontserrat = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shaheen's Clinic",
  description:
    "Shaheen's Clinic was established in 2016 by Dr. Shaheen Mahmud as a dedicated home for Classical Homeopathy offering time-tested healing methods for those seeking natural treatment...",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        cz-shortcut-listen="false"
        className={`${geistSans.variable} ${geistMono.variable} ${getMontserrat.variable} font-montserrat antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Providers>
            <NextTopLoader color="#0cb8b6" initialPosition={0.08} />
            {children}
          </Providers>
        </ThemeProvider>
        <AppToaster />
      </body>
    </html>
  );
}
