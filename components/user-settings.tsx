import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getApiBase } from "@/lib/apiBase";
import { Button } from "@/components/ui/button";

interface PageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserInfo {
  uid: string;
  email: string;
}

export default function PageDialog({ open, onOpenChange }: PageDialogProps) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("userDetails");
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse userDetails from sessionStorage", err);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const baseUrl = getApiBase();

      // Get the UID from sessionStorage
      const stored = sessionStorage.getItem("userDetails");
      const userInfo = stored ? JSON.parse(stored) : null;

      if (!userInfo?.uid) throw new Error("User ID not found");

      // Send POST request with UID in the body
      await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userInfo.uid }),
        credentials: "include", // send cookies if needed
      });

      // Clear session and local storage
      sessionStorage.clear();
      localStorage.clear();

      // Redirect to sign-in page
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      sessionStorage.clear();
      localStorage.clear();
      router.replace("/sign-in");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[40vw] !max-w-[40vw] !h-[50vh] !max-h-[50vh] p-6 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header with Logout on top-right */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt12">Profile Settings</h2>
          <Button 
            className={cn(
              "border border-gray-300 bg-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
              "px-4 py-1 text-sm",             // default
              "md:px-5 md:py-2.5 md:text-base", // medium screens
              "lg:px-6 lg:py-3 lg:text-lg",     // large screens
              "2xl:px-5 2xl:py-5 2xl:text-lg"   // extra large screens
            )}
            onClick={handleLogout}
            >
              Logout
          </Button>
        </div>

        {/* User Info */}
        {userInfo ? (
          <div className="space-y-4 flex-grow">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">User ID:</span>
              <span className="text-gray-900 dark:text-gray-100">{userInfo.uid}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
              <span className="text-gray-900 dark:text-gray-100">{userInfo.email}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No user information found.</p>
        )}

        {/* Optional: Add additional profile info here */}
      </DialogContent>
    </Dialog>
  );
}