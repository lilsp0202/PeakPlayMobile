import type { Metadata } from "next"
import PeakPlayLanding from "@/components/v0/landing/peakplay-landing"

export const metadata: Metadata = {
  title: "Home - PeakPlay",
  description:
    "Unlock your peak performance with PeakPlay's comprehensive sports development platform featuring personalized training, expert coaching, and performance analytics.",
}

export default function Page() {
  return <PeakPlayLanding />
} 