"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { getApiBase } from "@/lib/apiBase";
import PageDialog from "@/components/user-settings";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const baseUrl = getApiBase();
        const apiUrl = `${baseUrl}/auth/me`;
        const response = await fetch(apiUrl, {
          credentials: "include"
        });

        if (response.status === 401 || response.status === 403) {
          console.warn("Authentication error. Redirecting to sign-in...");
          router.replace("/sign-in");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        sessionStorage.setItem('userDetails', JSON.stringify(data));
        setUserEmail(data.email);
      } catch (err: any) {
        console.error("Error fetching user:", err.message || "An unknown error occurred.");
        setUserEmail("Error");
      } finally {
        setLoadingUser(false);
      }
    };

    const storedUser = sessionStorage.getItem('userDetails');
    let storedEmail: string | null = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        storedEmail = parsedUser.email || null;
      } catch (error) {
        console.error("Error parsing userDetails:", error);
      }
    }
    if (storedEmail) {
      setUserEmail(storedEmail);
      setLoadingUser(false);
    } else {
      fetchUser();
    }
  }, [router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden bg-[var(--sidebar)] relative">
        <AppSidebar setShowSettings={setShowSettings} userEmail={userEmail} />
        
        <main className="flex-1 pt-6 pr-6 pb-6 pl-4 md:pt-6 md:pr-6 md:pb-6 md:pl-6 xl:pt-4 xl:pr-4 xl:pl-6 2xl:pt-3 2xl:pr-3 2xl:pl-3 overflow-x-hidden">
          <div className=" mx-auto w-full bg-white dark:bg-black/30 shadow-xl rounded-2xl backdrop-blur-md border border-border p-10">
            {children}
          </div>
        </main>

        {showSettings && (
          <PageDialog open={showSettings} onOpenChange={setShowSettings} />
        )}
      </div>
    </SidebarProvider>
  );
}