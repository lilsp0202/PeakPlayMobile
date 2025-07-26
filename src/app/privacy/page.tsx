import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PeakPlay",
  description: "Learn how PeakPlay collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to PeakPlay ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our athlete development platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-700 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name and contact information (email, username)</li>
              <li>Account credentials</li>
              <li>Athletic profile data (age, height, weight, sport, academy)</li>
              <li>Performance metrics and skills assessments</li>
              <li>Health and wellness data (nutrition, sleep scores)</li>
              <li>Match performance statistics</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-700 mb-3">Usage Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Device information and IP addresses</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and features used</li>
              <li>Time spent on the platform</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-700 mb-3">Voice and Media Data</h3>
            <p className="text-gray-700 mb-4">
              If you use our voice feedback features, we may collect and process voice recordings. These recordings are temporarily processed using OpenAI's API for transcription and are not stored permanently on our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>To provide and maintain our services</li>
              <li>To track and analyze athletic performance</li>
              <li>To provide personalized coaching and feedback</li>
              <li>To evaluate and award achievement badges</li>
              <li>To facilitate coach-athlete communications</li>
              <li>To improve our platform and develop new features</li>
              <li>To send important updates and notifications</li>
              <li>To ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Third-Party Services</h2>
            
            <h3 className="text-xl font-medium text-gray-700 mb-3">OpenAI API</h3>
            <p className="text-gray-700 mb-4">
              We use OpenAI's API for voice transcription and AI-powered coaching insights. When you use these features, your data is processed according to OpenAI's privacy policy. We do not store raw voice data after transcription.
            </p>

            <h3 className="text-xl font-medium text-gray-700 mb-3">Google OAuth</h3>
            <p className="text-gray-700 mb-4">
              If you choose to sign in with Google, we access only your basic profile information (name, email) as authorized by you.
            </p>

            <h3 className="text-xl font-medium text-gray-700 mb-3">Analytics and Monitoring</h3>
            <p className="text-gray-700 mb-4">
              We use Sentry for error tracking and performance monitoring to ensure platform reliability. This data is anonymized and used solely for technical improvements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure password hashing</li>
              <li>Regular security audits</li>
              <li>Limited access controls</li>
              <li>Secure API authentication</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Performance data and statistics are retained to track progress over time. You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              For users under 18, we recommend parental consent and supervision. We do not knowingly collect information from children under 13 without parental consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this privacy policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                Email: privacy@peakplay.com<br />
                Address: PeakPlay, Inc.<br />
                [Your Address]<br />
                [City, State, ZIP]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 