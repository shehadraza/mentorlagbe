
import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import SiteNavbar from "@/components/shared/site-navbar";
import SiteFooter from "@/components/shared/site-footer";
import "./globals.css";
import ThemeProvider from "@/components/shared/theme-provider";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MentorLagbe | Find Your Perfect Tutor",
    template: "%s | MentorLagbe",
  },
  description:
    "Find trusted tutors, discover tuition opportunities, and make learning easier with MentorLagbe.",
  applicationName: "MentorLagbe",
  keywords: [
    "MentorLagbe",
    "Online Tutor",
    "Tuition",
    "Bangladesh",
    "Find Tutor",
    "Mentorship",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
  <ThemeProvider>
    <SiteNavbar />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </ThemeProvider>
</body>
    </html>
  );
}
