import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Soundscape',
  description: 'Terms of Service for Soundscape music streaming platform',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-cyan-500 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-sm text-gray-400">Last Updated: December 6, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Soundscape, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these Terms of Service, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              Soundscape provides a music streaming platform that allows users to discover, stream, and share music content.
              We reserve the right to modify, suspend, or discontinue the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Account Registration</h3>
            <p>
              To access certain features, you must register for an account. You agree to provide accurate, current, and complete
              information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Account Security</h3>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Content and Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">User Content</h3>
            <p>
              Users may upload, share, or transmit content through the service. You retain all rights to content you submit,
              but grant Soundscape a worldwide, non-exclusive license to use, reproduce, and distribute your content.
            </p>
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Copyright</h3>
            <p>
              You must own or have the necessary licenses, rights, consents, and permissions to use and authorize us to use
              all content you upload. Soundscape respects intellectual property rights and expects users to do the same.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use automated systems to access the service</li>
              <li>Sell or transfer your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Content Moderation</h2>
            <p>
              We reserve the right to remove any content that violates these terms or that we find objectionable.
              We may also suspend or terminate accounts that violate our terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-cyan-500 hover:underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND.
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOUNDSCAPE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service immediately, without prior notice,
              for any breach of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes.
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws,
              without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:legal@soundscape.com" className="text-cyan-500 hover:underline">
                legal@soundscape.com
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
