import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const latinFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
