import type { Metadata } from "next"
import PeakPlayLanding from "@/components/v0/landing/peakplay-landing"

export const metadata: Metadata = {
  title: "Home - PeakPlay",
  description:
    "Unlock your peak performance with PeakPlay's comprehensive sports development platform featuring personalized training, expert coaching, and performance analytics.",
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
      <PeakPlayLanding />
    </div>
  )
} 