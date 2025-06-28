"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Star, 
  Trophy, 
  Users, 
  TrendingUp, 
  Smartphone, 
  Download,
  ChevronRight,
  Check,
  Play,
  Shield,
  Zap,
  Award
} from "lucide-react";

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    setIsIOS(/iPhone|iPad|iPod/.test(navigator.userAgent));

    // PWA install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-8 shadow-lg">
              <Zap className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Cricket Game</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Track skills, analyze performance, and connect with top coaches. 
              Your personal cricket training companion.
            </p>

            {/* Install CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {showInstallButton && !isIOS && (
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-full hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Install PeakPlay
                </button>
              )}
              
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-full hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-full hover:bg-gray-50 transition-all border-2 border-gray-200"
              >
                Sign In
              </Link>
            </div>

            {/* App Store Badges */}
            <div className="flex justify-center gap-4">
              <img 
                src="/google-play-badge.png" 
                alt="Get it on Google Play" 
                className="h-14 cursor-pointer hover:opacity-80 transition-opacity"
              />
              <img 
                src="/app-store-badge.png" 
                alt="Download on App Store" 
                className="h-14 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse delay-300"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600">
              Professional tools for athletes and coaches
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Skill Tracking"
              description="Monitor your progress across batting, bowling, fielding, and fitness with detailed analytics"
              color="blue"
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Achievement System"
              description="Earn badges, compete on leaderboards, and celebrate your milestones"
              color="green"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Coach Marketplace"
              description="Connect with certified coaches for personalized training sessions"
              color="purple"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Private"
              description="Your data is encrypted and protected with enterprise-grade security"
              color="red"
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8" />}
              title="Works Offline"
              description="Track your training even without internet connection"
              color="yellow"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8" />}
              title="AI Insights"
              description="Get intelligent feedback and personalized improvement suggestions"
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* How to Install Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Install in Seconds
            </h2>
            <p className="text-xl text-gray-600">
              Available on all your devices
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <InstallGuide
              platform="iOS (iPhone/iPad)"
              steps={[
                "Open peakplay.app in Safari",
                "Tap the Share button (square with arrow)",
                "Scroll down and tap 'Add to Home Screen'",
                "Tap 'Add' to install"
              ]}
            />
            <InstallGuide
              platform="Android"
              steps={[
                "Open peakplay.app in Chrome",
                "Tap the menu (3 dots)",
                "Tap 'Install app' or 'Add to Home screen'",
                "Follow the prompts to install"
              ]}
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Or scan this QR code with your phone:
            </p>
            <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
              {/* Add your QR code here */}
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">QR Code</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Game?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join thousands of cricketers already using PeakPlay
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-10 py-5 text-xl font-semibold text-blue-600 bg-white rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Start Free Today
            <ChevronRight className="ml-3 h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">PeakPlay</h3>
              <p className="text-gray-400">
                Your personal cricket training companion
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/coaches">For Coaches</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 PeakPlay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${colorClasses[color]} rounded-xl text-white mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function InstallGuide({ platform, steps }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{platform}</h3>
      <ol className="space-y-4">
        {steps.map((step: string, index: number) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold mr-4">
              {index + 1}
            </div>
            <span className="text-gray-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
} 