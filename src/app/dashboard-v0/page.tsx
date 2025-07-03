import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AthleteDashboard from '@/components/v0/dashboard/athlete-dashboard'

export const metadata = {
  title: 'Dashboard - PeakPlay',
  description: 'Your personalized cricket training dashboard with performance analytics and skill tracking.',
}

export default async function DashboardV0Page() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-indigo-400 opacity-20"></div>
          </div>
        </div>
      </div>
    }>
      <AthleteDashboard />
    </Suspense>
  )
} 