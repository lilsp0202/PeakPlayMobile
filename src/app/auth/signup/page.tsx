"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Phone,
  Sparkles,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { Logo } from "../../../components/auth/Logo";
import { AnimatedBackground } from "../../../components/auth/AnimatedBackground";
import { ProgressBar } from "../../../components/auth/ProgressBar";

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "ATHLETE" as "ATHLETE" | "COACH",
    agreeToTerms: false,
    marketingEmails: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const totalSteps = 3;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
      if (!formData.username.trim()) newErrors.username = "Username is required";
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    }

    if (step === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      // First, register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (response.ok) {
        console.log("Registration successful, now signing in automatically...");
        
        // Automatically sign in the user after successful registration
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          console.log("Auto sign-in successful, redirecting to onboarding...");
          // Redirect to appropriate onboarding based on role
          const onboardingPath = formData.role === "COACH" 
            ? "/onboarding/coach" 
            : "/onboarding/athlete";
          router.push(onboardingPath);
        } else {
          console.error("Auto sign-in failed:", signInResult?.error);
          // Fallback: redirect to signin with success message
          router.push("/auth/signin?message=Account created successfully. Please sign in.");
        }
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || data.message || "Failed to create account" });
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

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
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
            Sign in
        </Link>
      </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-6 py-8 lg:py-12">
        <div className="w-full max-w-lg">
          {/* Header Section */}
          <div
            className={`text-center mb-8 transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl mb-6 shadow-lg relative">
              <Sparkles className="h-8 w-8 text-white" />
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl opacity-20 blur-lg"></div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">Create your account</h1>
            <p className="text-slate-600 text-lg">Join thousands of athletes already using PeakPlay</p>
          </div>

          {/* Sign Up Form */}
          <div
            className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"}`}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-3xl"></div>

            {/* Top accent border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
            
            <div className="relative z-10">
              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl text-sm animate-in slide-in-from-top duration-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0 animate-pulse"></div>
                    <span>{errors.submit}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-slate-800 mb-2">Personal Information</h2>
                      <p className="text-slate-600 text-sm">Let's start with the basics</p>
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      required
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 ${
                            errors.name
                              ? "border-red-300 focus:border-red-500"
                              : "border-slate-300 focus:border-purple-500"
                          }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                  </label>
                  <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 ${
                            errors.email
                              ? "border-red-300 focus:border-red-500"
                              : "border-slate-300 focus:border-purple-500"
                          }`}
                          placeholder="your@email.com"
                    />
                  </div>
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="username"
                      type="text"
                      required
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                            className={`w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 ${
                              errors.username
                                ? "border-red-300 focus:border-red-500"
                                : "border-slate-300 focus:border-purple-500"
                            }`}
                            placeholder="username"
                          />
                        </div>
                        {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        I am a...
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange("role", "ATHLETE")}
                          className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                            formData.role === "ATHLETE"
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-slate-300 hover:border-slate-400 text-slate-600"
                          }`}
                        >
                          <UserCheck className="h-6 w-6 mx-auto mb-2" />
                          <span className="font-medium">Athlete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange("role", "COACH")}
                          className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                            formData.role === "COACH"
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-slate-300 hover:border-slate-400 text-slate-600"
                          }`}
                        >
                          <Users className="h-6 w-6 mx-auto mb-2" />
                          <span className="font-medium">Coach</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Security */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-slate-800 mb-2">Secure Your Account</h2>
                      <p className="text-slate-600 text-sm">Create a strong password to protect your account</p>
                </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={`w-full pl-11 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 ${
                            errors.password
                              ? "border-red-300 focus:border-red-500"
                              : "border-slate-300 focus:border-purple-500"
                          }`}
                          placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                      {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className={`w-full pl-11 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 ${
                            errors.confirmPassword
                              ? "border-red-300 focus:border-red-500"
                              : "border-slate-300 focus:border-purple-500"
                          }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                      {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                    {/* Password Strength Indicator */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Password Requirements:</p>
                      <div className="space-y-1">
                        <div
                          className={`flex items-center text-sm ${formData.password.length >= 8 ? "text-green-600" : "text-slate-500"}`}
                        >
                          <CheckCircle
                            className={`h-4 w-4 mr-2 ${formData.password.length >= 8 ? "text-green-500" : "text-slate-400"}`}
                          />
                          At least 8 characters
                        </div>
                        <div
                          className={`flex items-center text-sm ${/[A-Z]/.test(formData.password) ? "text-green-600" : "text-slate-500"}`}
                        >
                          <CheckCircle
                            className={`h-4 w-4 mr-2 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-slate-400"}`}
                          />
                          One uppercase letter
                        </div>
                        <div
                          className={`flex items-center text-sm ${/[0-9]/.test(formData.password) ? "text-green-600" : "text-slate-500"}`}
                        >
                          <CheckCircle
                            className={`h-4 w-4 mr-2 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-slate-400"}`}
                          />
                          One number
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Terms and Confirmation */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-slate-800 mb-2">Almost Done!</h2>
                      <p className="text-slate-600 text-sm">
                        Review and accept our terms to complete your registration
                      </p>
                    </div>

                    {/* Account Summary */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <h3 className="font-semibold text-purple-800 mb-3">Account Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Name:</span>
                          <span className="text-slate-800 font-medium">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Email:</span>
                          <span className="text-slate-800 font-medium">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Username:</span>
                          <span className="text-slate-800 font-medium">@{formData.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Role:</span>
                          <span className="text-slate-800 font-medium capitalize">{formData.role.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded mt-1"
                        />
                        <span className="ml-3 text-sm text-slate-600">
                          I agree to the{" "}
                          <Link href="/terms" className="font-semibold text-purple-600 hover:text-purple-700">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="font-semibold text-purple-600 hover:text-purple-700">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                      {errors.agreeToTerms && <p className="text-red-600 text-sm">{errors.agreeToTerms}</p>}

                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.marketingEmails}
                          onChange={(e) => handleInputChange("marketingEmails", e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded mt-1"
                        />
                        <span className="ml-3 text-sm text-slate-600">
                          I'd like to receive product updates and training tips (optional)
                        </span>
                      </label>
                    </div>
                  </div>
                      )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors group"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Back
                    </button>
                  )}

                  <div className="ml-auto">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group"
                      >
                        Continue
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                        className="flex items-center px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {isLoading ? (
                          <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                            Creating Account...
                          </>
                  ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Create Account
                          </>
                  )}
                </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 