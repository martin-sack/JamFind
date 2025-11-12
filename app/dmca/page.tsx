import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DMCA Policy - JamFind',
  description: 'Digital Millennium Copyright Act Policy for JamFind',
}

export default function DMCAPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">DMCA Copyright Policy</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Digital Millennium Copyright Act (DMCA) Notice</h2>
            <p className="text-gray-700 dark:text-gray-300">
              JamFind respects the intellectual property rights of others and expects our users to do the same. 
              We will respond to notices of alleged copyright infringement that comply with applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reporting Copyright Infringement</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you are a copyright owner, or authorized to act on behalf of one, and believe that your work has been copied 
              in a way that constitutes copyright infringement, please provide our Copyright Agent with the following information:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to permit us to locate the material</li>
              <li>Your contact information, including your address, telephone number, and email address</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law</li>
              <li>A statement that the information in the notification is accurate, and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Counter-Notification Procedures</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you believe that material you posted on the site was removed or access to it was disabled by mistake or misidentification, 
              you may file a counter-notification with us by providing the following information:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li>Your physical or electronic signature</li>
              <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access disabled</li>
              <li>Adequate information by which we can contact you (including your name, postal address, telephone number, and email address)</li>
              <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification</li>
              <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located, or if outside the United States, for any judicial district in which JamFind may be found, and that you will accept service of process from the person who provided notification under DMCA 512 subsection (c)(1)(c) or an agent of such person</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Repeat Infringers</h2>
            <p className="text-gray-700 dark:text-gray-300">
              It is our policy in appropriate circumstances to disable and/or terminate the accounts of users who are repeat infringers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Designated Copyright Agent</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Copyright Agent</strong><br />
                JamFind<br />
                Email: dmca@jamfind.dev<br />
                Please include "DMCA Notice" in the subject line.
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Note: Only DMCA notices should go to the Copyright Agent. Other feedback, comments, requests for technical support, 
              and other communications should be directed to our general contact methods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Warning</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Under the DMCA, anyone who knowingly makes misrepresentations regarding alleged copyright infringement may be liable to JamFind, 
              the alleged infringer, and/or the copyright owner for any damages incurred in connection with the removal, blocking, or replacement of allegedly infringing material.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this DMCA policy from time to time. The current version will always be posted on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
