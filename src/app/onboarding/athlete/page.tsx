"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, 
  FiCalendar, 
  FiActivity, 
  FiMapPin, 
  FiTarget, 
  FiChevronLeft, 
  FiChevronRight,
  FiCheck,
  FiStar,
  FiArrowLeft,
  FiZap
} from "react-icons/fi";

export default function AthleteOnboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    academy: "",
    role: "BATSMAN" as "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "KEEPER",
  });

  const totalSteps = 4;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const parsedData = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
      };
      
      const response = await fetch("/api/student/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const data = await response.json();
      console.log("Athlete onboarding response:", data);

      if (response.ok) {
        console.log("Athlete onboarding successful, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        console.error("Athlete onboarding failed:", data);
        setError(data.message || "Failed to save information. Please try again.");
      }
    } catch (error) {
      console.error("Athlete onboarding error:", error);
      setError("Network error occurred. Please check your connection and try again.");
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name.trim();
      case 2:
        return !!formData.age && parseInt(formData.age) >= 10 && parseInt(formData.age) <= 50;
      case 3:
        return !!formData.height && !!formData.weight && 
               parseFloat(formData.height) >= 100 && parseFloat(formData.height) <= 250 &&
               parseFloat(formData.weight) >= 30 && parseFloat(formData.weight) <= 200;
      case 4:
        return !!formData.academy.trim() && !!formData.role;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return FiUser;
      case 2: return FiCalendar;
      case 3: return FiActivity;
      case 4: return FiTarget;
      default: return FiUser;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Personal Info";
      case 2: return "Age Details";
      case 3: return "Physical Stats";
      case 4: return "Cricket Profile";
      default: return "";
    }
  };

  const academyOptions = [
    "Transform",
    "Elite Sports Academy", 
    "Champion Academy",
    "Victory Sports",
    "Peak Performance",
    "Excel Academy",
    "MRF Pace Foundation",
    "National Cricket Academy",
    "Other"
  ];

  const roleOptions = [
    { value: "BATSMAN", label: "Batsman", icon: "🏏", description: "Focus on batting skills" },
    { value: "BOWLER", label: "Bowler", icon: "⚡", description: "Specialist in bowling" },
    { value: "ALL_ROUNDER", label: "All-rounder", icon: "🌟", description: "Balanced batting & bowling" },
    { value: "KEEPER", label: "Wicket Keeper", icon: "🥅", description: "Behind the stumps" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-emerald-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className={`relative z-10 px-4 sm:px-6 lg:px-8 pt-6 transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => router.push('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 text-gray-700 hover:text-gray-900 transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </motion.button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FiZap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">PeakPlay</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className={`relative z-10 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-1000 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: totalSteps }, (_, i) => {
              const step = i + 1;
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;
              const Icon = getStepIcon(step);

              return (
                <div key={step} className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : isActive 
                        ? "bg-white border-emerald-500 text-emerald-500 shadow-lg" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -inset-2 bg-emerald-200 rounded-full opacity-30 animate-pulse"
                      />
                    )}
                  </motion.div>
                  {step < totalSteps && (
                    <div className={`w-12 sm:w-16 h-0.5 mx-1 transition-all duration-300 ${
                      step < currentStep ? "bg-emerald-500" : "bg-gray-300"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 px-4 sm:px-6 lg:px-8 pb-8 transition-all duration-1000 delay-400 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 px-6 sm:px-8 py-6">
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <FiStar className="w-8 h-8" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Complete Your Profile</h1>
                <p className="text-emerald-100 text-sm sm:text-base">Let's set up your athletic journey with PeakPlay</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tell us your name</h2>
                        <p className="text-gray-600">This will be displayed on your profile and achievements</p>
                      </div>

                      <div className="relative">
                        <FiUser className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all duration-200 text-lg placeholder-gray-400 bg-gray-50 focus:bg-white"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Age */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">How old are you?</h2>
                        <p className="text-gray-600">This helps us personalize your training recommendations</p>
                      </div>

                      <div className="relative">
                        <FiCalendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          min="10"
                          max="50"
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all duration-200 text-lg placeholder-gray-400 bg-gray-50 focus:bg-white"
                          placeholder="Your age"
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500 text-center">Age range: 10-50 years</p>
                    </motion.div>
                  )}

                  {/* Step 3: Physical Stats */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Physical Statistics</h2>
                        <p className="text-gray-600">Help us track your fitness progress accurately</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <FiActivity className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            min="100"
                            max="250"
                            step="0.1"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all duration-200 text-lg placeholder-gray-400 bg-gray-50 focus:bg-white"
                            placeholder="Height (cm)"
                            required
                          />
                          <span className="absolute right-4 top-4 text-gray-400 text-sm">cm</span>
                        </div>

                        <div className="relative">
                          <FiActivity className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            min="30"
                            max="200"
                            step="0.1"
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all duration-200 text-lg placeholder-gray-400 bg-gray-50 focus:bg-white"
                            placeholder="Weight (kg)"
                            required
                          />
                          <span className="absolute right-4 top-4 text-gray-400 text-sm">kg</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Cricket Profile */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cricket Profile</h2>
                        <p className="text-gray-600">Final step - tell us about your cricket journey</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <select
                            name="academy"
                            value={formData.academy}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-all duration-200 text-lg bg-gray-50 focus:bg-white"
                            required
                          >
                            <option value="">Select your academy</option>
                            {academyOptions.map((academy) => (
                              <option key={academy} value={academy}>{academy}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Playing Role</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {roleOptions.map((role) => (
                              <motion.div
                                key={role.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                                  formData.role === role.value
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, role: role.value as any }))}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{role.icon}</span>
                                  <div>
                                    <div className="font-medium text-gray-900">{role.label}</div>
                                    <div className="text-sm text-gray-600">{role.description}</div>
                                  </div>
                                </div>
                                {formData.role === role.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                                  >
                                    <FiCheck className="w-4 h-4 text-white" />
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    whileHover={{ scale: currentStep > 1 ? 1.05 : 1 }}
                    whileTap={{ scale: currentStep > 1 ? 0.95 : 1 }}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      currentStep === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </motion.button>

                  {currentStep < totalSteps ? (
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      whileHover={{ scale: validateStep(currentStep) ? 1.05 : 1 }}
                      whileTap={{ scale: validateStep(currentStep) ? 0.95 : 1 }}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        validateStep(currentStep)
                          ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 shadow-lg"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <span>Next</span>
                      <FiChevronRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isLoading || !validateStep(currentStep)}
                      whileHover={{ scale: (!isLoading && validateStep(currentStep)) ? 1.05 : 1 }}
                      whileTap={{ scale: (!isLoading && validateStep(currentStep)) ? 0.95 : 1 }}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        !isLoading && validateStep(currentStep)
                          ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 shadow-lg"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Setting up...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Setup</span>
                          <FiCheck className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 