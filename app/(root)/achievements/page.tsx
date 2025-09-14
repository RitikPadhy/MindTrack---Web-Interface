"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TestCyclesPage() {

  // Redirect to home page on reload
  // useEffect(() => {
  //   const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  //   const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

  //   if (isReload) {
  //     router.replace("/");
  //   }
  // }, [router]);

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-9rem)] lg:h-[calc(100vh-8rem)] xl:h-[calc(100vh-5rem)] 2xl:h-[calc(100vh-6.8rem)] w-full bg-white dark:bg-gray-900 space-y-2 2xl:space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <SidebarTrigger />
        <div className="w-[2px] h-6 bg-gray-400" />
        <span className="text-xl font-semibold text-gray-700">Achievements</span>
      </div>
    </div>
  );
}