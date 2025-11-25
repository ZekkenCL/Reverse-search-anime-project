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
  title: "Anime Reverse Search - Find Any Anime from Screenshots",
  description: "Upload a screenshot and instantly identify the anime, episode, and exact timestamp. Powered by AI using trace.moe and Anilist APIs.",
  keywords: ["anime", "reverse search", "anime finder", "screenshot search", "trace.moe", "anilist"],
  authors: [{ name: "Anime Search Team" }],
  openGraph: {
    title: "Anime Reverse Search",
    description: "Identify any anime from a screenshot instantly",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
