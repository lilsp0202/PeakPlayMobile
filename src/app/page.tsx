import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PeakPlay</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Elevate Your
              <span className="text-blue-600"> Athletic Performance</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Track your sports performance, connect with professional coaches, and unlock your potential with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
              >
                Start Your Journey
              </Link>
              <Link
                href="/landing"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Tracking</h3>
              <p className="text-gray-600">Monitor your progress with detailed analytics and insights.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Coaching</h3>
              <p className="text-gray-600">Connect with professional coaches for personalized training.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Insights</h3>
              <p className="text-gray-600">Get intelligent recommendations to improve your game.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 