// (root)/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Ensure this path is correct for your global styles
import ClientLayout from "./clientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TestHive",
  description: "Sidebar layout using ShadCN",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en"> 
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
};

export default RootLayout;