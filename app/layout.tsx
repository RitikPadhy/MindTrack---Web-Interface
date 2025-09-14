// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

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
                : "http://13.233.212.132";
            `,
          }}
        />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}