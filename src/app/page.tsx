"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSpring, animated } from "react-spring";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full"
    />
  </div>
);

// Animated Components
const AnimatedSection = ({ children, className = "", delay = 0 }: any) => {
  const props = useSpring({
    from: { opacity: 0, transform: "translateY(50px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay,
    config: { tension: 280, friction: 60 }
  });

  return (
    <animated.div style={props} className={className}>
      {children}
    </animated.div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
  >
    <div className="text-6xl mb-6">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
      if (session?.user) {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 bg-gradient-to-tr from-purple-400/30 via-blue-500/20 to-indigo-600/30"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute inset-0 bg-gradient-to-bl from-blue-400/20 via-purple-500/10 to-indigo-700/20"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PeakPlay</h1>
                <p className="text-sm text-purple-200">Peak Performance Platform</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/auth/signin")}
                className="px-6 py-2 text-white hover:text-purple-200 transition-colors font-medium"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/auth/signup")}
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 shadow-lg"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <AnimatedSection delay={200}>
            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight"
            >
              Unlock Your{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Peak Performance
              </span>
            </motion.h1>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Redefining youth sports development with a future-forward platform that's purposeful, 
              performance-measurable, and makes the journey unforgettable.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/auth/signup")}
                className="px-12 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
              >
                Start Your Journey
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-32 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection delay={100}>
            <h2 className="text-5xl font-bold text-center text-white mb-6">
              Tailored Solutions for Every Role
            </h2>
            <p className="text-xl text-purple-100 text-center mb-20 max-w-3xl mx-auto">
              Whether you're an athlete, coach, or parent, PeakPlay adapts to your unique needs 
              with personalized dashboards and insights.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon="⚡"
              title="Athlete"
              description="Get your personalized training roadmap with AI-powered insights that track your progress across strength, speed, technique, and mental performance."
              delay={0.1}
            />
            <FeatureCard
              icon="👨‍👩‍👧‍👦"
              title="Parent"
              description="Stay connected with transparent updates on your child's development, nutrition plans, and achievements through our secure family portal."
              delay={0.3}
            />
            <FeatureCard
              icon="🏆"
              title="Coach"
              description="Manage your entire roster from one intelligent dashboard—assign workouts, monitor real-time progress, and celebrate every breakthrough with data-backed insights."
              delay={0.5}
            />
          </div>
        </div>
      </div>

      {/* SkillSnap Section */}
      <div className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection delay={100}>
            <h2 className="text-5xl font-bold text-center text-white mb-6">
              SkillSnap - Our Five-Pillar Skills Framework
            </h2>
            <p className="text-xl text-purple-100 text-center mb-20 max-w-3xl mx-auto">
              A comprehensive approach to athletic development, with every skill supporting your growth.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-5 gap-8">
            {[
              { icon: "⚡", title: "Physical", desc: "Strength, speed, and agility foundation" },
              { icon: "🎯", title: "Technique", desc: "Movement patterns and precision" },
              { icon: "👁️", title: "Tactical", desc: "Game awareness and strategy" },
              { icon: "🧠", title: "Mental", desc: "Focus, resilience, and confidence" },
              { icon: "🍎", title: "Nutrition", desc: "Fuel performance and recovery" }
            ].map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{skill.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{skill.title}</h3>
                <p className="text-purple-200 text-sm">{skill.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="relative z-10 py-32 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection delay={100}>
            <h2 className="text-5xl font-bold text-center text-white mb-20">Our Values</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Athlete-Centric Growth", desc: "We nurture the whole athlete—physical, mental and emotional." },
              { title: "Empowered Coaching", desc: "Tools and insights that amplify mentorship and trust." },
              { title: "Equity in Access", desc: "High-quality training for every community." },
              { title: "Joy in the Journey", desc: "Balance discipline with curiosity and fun." },
              { title: "Integrity Through Data", desc: "Transparent metrics you can rely on." }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-purple-200">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection delay={100}>
            <h2 className="text-5xl font-bold text-white mb-8">
              Ready to Reach Your Peak?
            </h2>
            <p className="text-xl text-purple-100 mb-12">
              Join thousands of athletes, coaches, and families transforming their performance journey.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/auth/signup")}
              className="px-16 py-5 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300"
            >
              Start Your Journey Today
            </motion.button>
          </AnimatedSection>
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
          <p className="text-purple-300 text-sm">Made with ❤️ for athletes worldwide</p>
        </div>
      </footer>
    </div>
  );
}
