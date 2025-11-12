import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - JamFind',
  description: 'JamFind Privacy Policy and Data Protection',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Account Information:</strong> When you create an account, we collect your email address, username, and profile information.</p>
              <p><strong>Content Data:</strong> We collect the playlists, tracks, and other content you submit to the platform.</p>
              <p><strong>Usage Data:</strong> We collect information about how you interact with our service, including playlists viewed, submissions made, and voting activity.</p>
              <p><strong>Technical Data:</strong> We collect IP addresses, browser type, and device information for security and analytics purposes.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>To provide and maintain our service</li>
              <li>To personalize your experience and show relevant content</li>
              <li>To process your submissions and voting activity</li>
              <li>To communicate with you about service updates and features</li>
              <li>To detect and prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Sharing and Disclosure</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Public Information:</strong> Your username, profile information, and submitted content are publicly visible.</p>
              <p><strong>Service Providers:</strong> We may share data with trusted third-party providers who help us operate our service.</p>
              <p><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights.</p>
              <p><strong>Business Transfers:</strong> In the event of a merger or acquisition, user data may be transferred.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We retain your personal information for as long as your account is active or as needed to provide you services. You can request account deletion at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and personal data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We use cookies and similar technologies to enhance your experience, analyze service usage, and personalize content. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at privacy@jamfind.dev
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
