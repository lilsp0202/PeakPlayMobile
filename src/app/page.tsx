import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import { LandingPageContent } from "@/components/LandingPageContent";

export default async function HomePage() {
  const session = await getServerSession(authOptions) as Session | null;

  // Handle redirects on the server side
  if (session?.user) {
    try {
      // Check if user has completed profile/onboarding
      let hasProfile = false;
      
      if (session.user.role === "COACH") {
        const coachProfile = await prisma.coach.findUnique({
          where: { userId: session.user.id },
          select: { id: true, name: true, academy: true }
        });
        hasProfile = !!(coachProfile?.name && coachProfile?.academy);
      } else if (session.user.role === "ATHLETE") {
        const studentProfile = await prisma.student.findUnique({
          where: { userId: session.user.id },
          select: { id: true, studentName: true, sport: true, academy: true }
        });
        hasProfile = !!(studentProfile?.studentName && studentProfile?.sport && studentProfile?.academy);
      }

      if (hasProfile) {
        // User has completed profile, go to dashboard
        redirect("/dashboard");
      } else {
        // User needs to complete onboarding
        const onboardingPath = session.user.role === "COACH" 
          ? "/onboarding/coach" 
          : "/onboarding/athlete";
        redirect(onboardingPath);
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      // Fallback: redirect to dashboard (will handle profile check there)
      redirect("/dashboard");
    }
  }

  // Show landing page for unauthenticated users
  return <LandingPageContent />;
} 