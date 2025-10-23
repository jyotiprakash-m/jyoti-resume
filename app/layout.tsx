import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jyoti Prakash Mohanta | Full Stack AI Developer",
  description:
    "Resume and portfolio for Jyoti Prakash Mohanta, a full stack AI developer building end-to-end intelligent products across web, backend, and agentic AI.",
  keywords: [
    "Jyoti Prakash Mohanta",
    "Full Stack AI Developer",
    "Generative AI Engineer",
    "Next.js Developer",
    "LangChain",
    "Portfolio",
    "Resume",
  ],
  icons: {
    icon: "/jpm.png",
    shortcut: "/jpm.png",
    apple: "/jpm.png",
  },
  openGraph: {
    title: "Jyoti Prakash Mohanta | Full Stack AI Developer",
    description:
      "Explore projects, experience, and credentials from Jyoti Prakash Mohanta, a developer delivering AI-powered applications and platform integrations.",
    url: "https://jyoti-prakash-mohanta.vercel.app",
    siteName: "Jyoti Prakash Mohanta Portfolio",
    type: "website",

    images: [
      {
        url: "/jpm.png",
        width: 1200,
        height: 630,
        alt: "Jyoti Prakash Mohanta - Full Stack AI Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jyoti Prakash Mohanta | Full Stack AI Developer",
    description:
      "Explore projects, experience, and credentials from Jyoti Prakash Mohanta, a developer delivering AI-powered applications and platform integrations.",
    images: ["/jpm.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
