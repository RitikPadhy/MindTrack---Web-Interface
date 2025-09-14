// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__API_BASE__ = location.hostname === "localhost"
                ? "http://localhost:8000"
                : "https://testhive-dev-http.internal.cleartax.co";
            `,
          }}
        />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}