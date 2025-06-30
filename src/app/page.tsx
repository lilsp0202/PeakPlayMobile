"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      // Check if user is temp
      if (session.user.name === "temp") {
        // Redirect to appropriate onboarding based on role
        const onboardingPath = session.user.role === "COACH" 
          ? "/onboarding/coach" 
          : "/onboarding/athlete";
        router.push(onboardingPath);
      } else {
        // Regular authenticated user goes to dashboard
        router.push("/dashboard");
      }
    } else {
      // Unauthenticated users go to landing
      router.push("/landing");
    }
  }, [session, status, router]);

  // Show loading spinner while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-indigo-400 opacity-20"></div>
      </div>
    </div>
  );
} 