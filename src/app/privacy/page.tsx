import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Soundscape',
  description: 'Privacy Policy for Soundscape music streaming platform',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-cyan-500 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-sm text-gray-400">Last Updated: December 6, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Soundscape. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Personal Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Email address</li>
              <li>Name (optional)</li>
              <li>Profile picture (optional)</li>
              <li>Password (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Usage Information</h3>
            <p>We automatically collect information about how you use our service:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Tracks you listen to and playlists you create</li>
              <li>Artists and genres you follow</li>
              <li>Search queries and browsing history</li>
              <li>Device information and IP address</li>
              <li>Login times and session duration</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Content You Upload</h3>
            <p>If you are an artist, we store:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Music tracks and album artwork</li>
              <li>Artist profile information</li>
              <li>Social media links</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Provide and improve our music streaming service</li>
              <li>Personalize your experience and recommendations</li>
              <li>Communicate with you about service updates</li>
              <li>Analyze usage patterns and trends</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">We May Share Your Information With:</h3>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li><strong>Artists</strong> - Aggregated listening statistics (not personal identifiers)</li>
              <li><strong>Service Providers</strong> - Cloud storage, analytics, and hosting services</li>
              <li><strong>Legal Authorities</strong> - When required by law or to protect rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-4 mb-2">We Do NOT:</h3>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Sell your personal information to third parties</li>
              <li>Share your listening history publicly without permission</li>
              <li>Use your data for advertising purposes (currently)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Storage and Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Encrypted passwords using industry-standard hashing</li>
              <li>Secure HTTPS connections</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure cloud storage for audio files</li>
            </ul>
            <p className="mt-4">
              Your data is stored on secure servers. Audio files may be stored on third-party cloud services
              (AWS S3, Cloudinary) with appropriate security measures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li><strong>Access</strong> - Request a copy of your personal data</li>
              <li><strong>Correction</strong> - Update or correct your information</li>
              <li><strong>Deletion</strong> - Request deletion of your account and data</li>
              <li><strong>Export</strong> - Download your playlists and listening history</li>
              <li><strong>Opt-out</strong> - Unsubscribe from marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@soundscape.com" className="text-cyan-500 hover:underline">
                privacy@soundscape.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li><strong>Essential Cookies</strong> - Required for authentication and service functionality</li>
              <li><strong>Analytics Cookies</strong> - Help us understand how you use our service</li>
              <li><strong>Preference Cookies</strong> - Remember your settings and choices</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but some features may not function properly if disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children&apos;s Privacy</h2>
            <p>
              Soundscape is not intended for users under the age of 13. We do not knowingly collect personal information
              from children. If we learn that we have collected information from a child under 13, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence.
              We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Account data - Until you delete your account</li>
              <li>Listening history - Retained for personalization (can be deleted on request)</li>
              <li>Artist content - Until content owner requests removal</li>
              <li>Transaction records - As required by law (typically 7 years)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Third-Party Services</h2>
            <p>
              Our service may contain links to third-party websites and services. We are not responsible for their
              privacy practices. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes by email
              or through a notice on our service. Your continued use after changes indicates acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, contact us:
            </p>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@soundscape.com" className="text-cyan-500 hover:underline">
                  privacy@soundscape.com
                </a>
              </p>
              <p>
                <strong>Data Protection Officer:</strong>{' '}
                <a href="mailto:dpo@soundscape.com" className="text-cyan-500 hover:underline">
                  dpo@soundscape.com
                </a>
              </p>
            </div>
          </section>

          <section className="bg-gray-800/50 p-6 rounded-lg mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Your California Privacy Rights</h2>
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of sale of personal information</li>
              <li>Right to request deletion of personal information</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>
            <p className="mt-4">
              To exercise your CCPA rights, email us at{' '}
              <a href="mailto:privacy@soundscape.com" className="text-cyan-500 hover:underline">
                privacy@soundscape.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>© 2025 Soundscape. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
