"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PeakPlay</h1>
                <p className="text-sm text-purple-200">Peak Performance Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="px-6 py-2 text-white hover:text-purple-200 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Unlock Your{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Peak Performance
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Redefining youth sports development with a future-forward platform that's purposeful, 
            performance-measurable, and makes the journey unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/signup"
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            >
              Start Your Journey
            </Link>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-32 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center text-white mb-6">
            Tailored Solutions for Every Role
          </h2>
          <p className="text-xl text-purple-100 text-center mb-20 max-w-3xl mx-auto">
            Whether you're an athlete, coach, or parent, PeakPlay adapts to your unique needs 
            with personalized dashboards and insights.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Athlete</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your personalized training roadmap with AI-powered insights that track your progress across strength, speed, technique, and mental performance.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Parent</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay connected with transparent updates on your child's development, nutrition plans, and achievements through our secure family portal.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="text-6xl mb-6">🏆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Coach</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage your entire roster from one intelligent dashboard—assign workouts, monitor real-time progress, and celebrate every breakthrough with data-backed insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to Reach Your Peak?
          </h2>
          <p className="text-xl text-purple-100 mb-12">
            Join thousands of athletes, coaches, and families transforming their performance journey.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-16 py-5 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300"
          >
            Start Your Journey Today
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">PeakPlay</span>
          </div>
          <p className="text-purple-200 mb-4">© 2025 PeakPlay. All rights reserved.</p>
          <div className="flex justify-center space-x-6 text-purple-300 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 