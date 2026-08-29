import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ResumeLens — AI resume & job match analyzer",
    template: "%s · ResumeLens",
  },
  description:
    "Analyze your resume against any job description and get AI-powered insights, skill gaps, improvement suggestions, and interview questions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
          <div className="mx-auto max-w-6xl px-4 text-sm text-zinc-500 sm:px-6 dark:text-zinc-400">
            ResumeLens — a portfolio project.
          </div>
        </footer>
      </body>
    </html>
  );
}
