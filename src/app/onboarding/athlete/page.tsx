"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "../../../components/Navigation";

export default function AthleteOnboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    academy: "",
    role: "BATSMAN" as "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "KEEPER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Submitting athlete onboarding form:", formData);
      
      const response = await fetch("/api/student/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
        }),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8">
        <PageHeader 
          title="Complete Your Profile"
          subtitle="Let's Set Up Your Athletic Journey"
          backButtonText="Back to Dashboard"
          onBackClick={() => router.push('/dashboard')}
        />
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-8">
            <div className="text-center mb-10">
              <div className="relative mx-auto mb-6">
                <div className="h-20 w-20 bg-gradient-to-br from-green-500 via-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <svg
                    className="h-12 w-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-green-500 via-emerald-600 to-blue-600 rounded-2xl opacity-20 blur-lg"></div>
              </div>
              
              <div className="space-y-2">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-sm font-medium text-green-800 border border-green-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Athlete Registration
                </div>
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Complete Your Profile
                </h1>
                <h2 className="text-xl font-semibold text-gray-900">
                  Let's Set Up Your Athletic Journey
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Tell us about yourself to create your personalized PeakPlay athlete profile and start tracking your performance
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    required
                    min="10"
                    max="50"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    placeholder="Your age"
                  />
                </div>

                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    required
                    min="100"
                    max="250"
                    step="0.1"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    placeholder="Height in centimeters"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    required
                    min="30"
                    max="200"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    placeholder="Weight in kilograms"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="academy" className="block text-sm font-medium text-gray-700 mb-2">
                  Academy *
                </label>
                <input
                  type="text"
                  id="academy"
                  name="academy"
                  required
                  value={formData.academy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="Your academy or training center"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Playing Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                >
                  <option value="BATSMAN">Batsman</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All-rounder</option>
                  <option value="KEEPER">Wicket Keeper</option>
                </select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Complete Setup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 