import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scorecard Analysis | PeakPlay',
  description: 'Upload and analyze your cricket scorecards with AI-powered insights',
};

export default function ScorecardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 