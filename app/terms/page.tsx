import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - JamFind',
  description: 'JamFind Terms of Service and User Agreement',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing and using JamFind, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>You must be at least 13 years old to use JamFind</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to submit content that infringes on copyrights</li>
              <li>You will not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Content Submission</h2>
            <p className="text-gray-700 dark:text-gray-300">
              By submitting playlists and tracks to JamFind, you grant us a non-exclusive, worldwide license to display and distribute your content through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300">
              JamFind respects intellectual property rights. If you believe your work has been copied in a way that constitutes copyright infringement, please see our DMCA policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              JamFind shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms, please contact us at legal@jamfind.dev
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
