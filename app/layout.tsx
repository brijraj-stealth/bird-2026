import type { Metadata } from "next";
import { Pathway_Extreme } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import LenisProvider from "./components/LenisProvider";

const pathwayExtreme = Pathway_Extreme({
  subsets: ["latin"],
  variable: "--font-pathway-extreme",
});

export const metadata: Metadata = {
  title: "Bird VC",
  description: "We Back and Scale Iconic Products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${pathwayExtreme.variable}`}>
      <body className="min-h-full flex flex-col">
        <Loader />
        <LenisProvider>
          <Navbar />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
