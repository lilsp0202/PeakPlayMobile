"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, UserCheck, Users, Sparkles, Shield, Star } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"ATHLETE" | "COACH">("ATHLETE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          role,
        }),
      });

      if (response.ok) {
        router.push("/auth/signin?message=Account created successfully");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create account");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-5 animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full opacity-5 animate-pulse delay-700"></div>
      </div>

      {/* Header with logo and back button */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link href="/dashboard" className="flex items-center group transition-all duration-300 hover:scale-105">
          <div className="relative">
            <div className="h-11 w-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
          </div>
          <div className="ml-3">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              PeakPlay
            </span>
          </div>
        </Link>
        
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50 hover:border-gray-300 group"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
          <span className="text-gray-700 font-medium">Back</span>
        </button>
      </div>
      
      <div className="relative z-10 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-md">
          {/* Centered Header with enhanced styling */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Join PeakPlay
            </h1>
            <p className="text-gray-600 text-lg">
              Start your journey to athletic excellence
            </p>
          </div>

          {/* Enhanced Sign Up Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-indigo-50/30 rounded-3xl"></div>
            
            <div className="relative z-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-sm animate-in slide-in-from-top duration-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 focus:bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 focus:bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 focus:bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 focus:bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    I am a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("ATHLETE")}
                      className={`relative px-4 py-4 rounded-xl border text-sm font-semibold transition-all duration-300 group ${
                        role === "ATHLETE"
                          ? "bg-gradient-to-br from-emerald-50 to-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500 shadow-md"
                          : "bg-white/60 border-gray-200 text-gray-700 hover:bg-white/80 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <UserCheck className={`h-6 w-6 ${role === "ATHLETE" ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-600"}`} />
                        <span>Athlete</span>
                      </div>
                      {role === "ATHLETE" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-emerald-400/10 rounded-xl"></div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("COACH")}
                      className={`relative px-4 py-4 rounded-xl border text-sm font-semibold transition-all duration-300 group ${
                        role === "COACH"
                          ? "bg-gradient-to-br from-emerald-50 to-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500 shadow-md"
                          : "bg-white/60 border-gray-200 text-gray-700 hover:bg-white/80 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Users className={`h-6 w-6 ${role === "COACH" ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-600"}`} />
                        <span>Coach</span>
                      </div>
                      {role === "COACH" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-emerald-400/10 rounded-xl"></div>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Star className="h-5 w-5 mr-2" />
                      Create account
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500 font-medium">or</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mt-6">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="font-semibold text-transparent bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text hover:from-emerald-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 