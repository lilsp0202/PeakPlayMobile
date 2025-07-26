"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Zap, Star, Sparkles, Smartphone, Download, Home, Plus, Share } from "lucide-react";
import { Logo } from "../../../components/auth/Logo";
import { AnimatedBackground } from "../../../components/auth/AnimatedBackground";
import { FloatingElements } from "../../../components/auth/FloatingElements";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("🔐 Attempting sign-in with:", { email, password: "***" });
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("🔐 Sign-in result:", result);

      if (result?.error) {
        console.error("🔐 Sign-in error:", result.error);
        setError(result.error);
      } else if (result?.ok) {
        console.log("🔐 Sign-in successful, showing success animation...");
        
        // Show success animation first
        setIsSuccess(true);
        
        // Wait for animation, then redirect
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1500); // 1.5 second delay for smooth transition
      }
    } catch (error) {
      console.error("🔐 Sign-in exception:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <FloatingElements />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div
          className={`transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
              >
          <Logo size="md" />
            </div>
        <div
          className={`text-sm text-slate-600 transition-all duration-1000 delay-200 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
            Sign up
        </Link>
      </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-6 py-8 lg:py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header Section */}
          <div
            className={`text-center mb-8 transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl mb-6 shadow-2xl relative group">
              <Zap className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300"></div>

              {/* Floating sparkles around the icon */}
              <Star className="absolute -top-2 -right-2 h-4 w-4 text-purple-400 animate-pulse" />
              <Star className="absolute -bottom-2 -left-2 h-3 w-3 text-blue-400 animate-pulse delay-500" />
              <Sparkles className="absolute -top-3 left-1/2 h-3 w-3 text-indigo-400 animate-bounce" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 bg-clip-text">
              Welcome back
            </h1>
            <p className="text-slate-600 text-lg">Sign in to continue your journey with PeakPlay</p>
          </div>

          {/* Sign In Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ 
              opacity: isSuccess ? 0.3 : 1, 
              scale: isSuccess ? 0.95 : 1, 
              y: isVisible ? 0 : 10 
            }}
            transition={{ duration: 0.5, delay: isVisible ? 0.5 : 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden"
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-3xl"></div>

            {/* Top accent border with animation */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-pulse delay-1000"></div>
            
            <div className="relative z-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-sm animate-in slide-in-from-top duration-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0 animate-pulse"></div>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-purple-600 transition-colors"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 focus:bg-white/90 text-slate-900 placeholder-slate-500 hover:border-slate-400 focus:shadow-lg focus:shadow-purple-500/10"
                      placeholder="Enter your email"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-transparent group-focus-within:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-purple-600 transition-colors"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-slate-50/50 focus:bg-white/90 text-slate-900 placeholder-slate-500 hover:border-slate-400 focus:shadow-lg focus:shadow-purple-500/10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors group"
                    >
                      {showPassword ? (
                        <EyeOff className="group-hover:scale-110 transition-transform" />
                      ) : (
                        <Eye className="group-hover:scale-110 transition-transform" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-focus-within:from-purple-500/5 group-focus-within:via-transparent group-focus-within:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded transition-colors"
                    />
                    <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors relative group"
                  >
                    Forgot password?
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  {isLoading ? (
                    <div className="flex items-center justify-center relative z-10">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center relative z-10">
                      <Shield className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Sign in</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* PWA Installation Instructions */}
          <div
            className={`bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-200/50 p-6 transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">📱 Add to Home Screen</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              Install PeakPlay as an app for the best experience!
            </p>
            
            <div className="space-y-3">
              {/* iOS Instructions */}
              <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">📱</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-slate-800 mb-1">iPhone/iPad:</div>
                  <div className="text-slate-600">
                    Tap <Share className="inline w-3 h-3 mx-1" /> (Share) → <Plus className="inline w-3 h-3 mx-1" /> "Add to Home Screen"
                  </div>
                </div>
              </div>
              
              {/* Android Instructions */}
              <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">🤖</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-slate-800 mb-1">Android:</div>
                  <div className="text-slate-600">
                    Tap menu ⋮ → <Download className="inline w-3 h-3 mx-1" /> "Add to Home screen"
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center text-xs text-slate-500">
                <Home className="w-3 h-3 mr-1" />
                <span>Quick access • Offline support • App-like experience</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Animation Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.6
            }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.2,
                type: "spring", 
                stiffness: 150 
              }}
              className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  delay: 0.5, 
                  duration: 0.8, 
                  ease: "easeInOut" 
                }}
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            {/* Success Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
              <p className="text-purple-200 text-lg">Redirecting to your dashboard...</p>
            </motion.div>

            {/* Loading Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="flex justify-center space-x-2 mt-6"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-4, -12, -4],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 