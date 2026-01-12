import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AfriVerse',
  description: 'AfriVerse\'s privacy policy. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary/90 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-300">
              Last updated: December 30, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-lg p-6 mb-8">
              <p className="text-brand-accent font-medium mb-0">
                At AfriVerse, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.
              </p>
            </div>

            <h2>1. Information We Collect</h2>
            
            <h3>1.1 Information You Provide</h3>
            <ul>
              <li><strong>Contact Information:</strong> Name, email address when you contact us or subscribe to our newsletter</li>
              <li><strong>Comments:</strong> Any information you share in article comments</li>
              <li><strong>Survey Responses:</strong> Information provided through polls or surveys</li>
            </ul>

            <h3>1.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, time spent, articles read</li>
              <li><strong>Device Information:</strong> Browser type, device type, operating system</li>
              <li><strong>Location Data:</strong> General geographic location (city/country level)</li>
              <li><strong>Cookies:</strong> Preferences and session information</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Deliver and improve our content and services</li>
              <li>Personalize your reading experience</li>
              <li>Send newsletters and updates (with your consent)</li>
              <li>Respond to your inquiries</li>
              <li>Analyze site usage and trends</li>
              <li>Display relevant advertisements</li>
              <li>Prevent fraud and ensure security</li>
            </ul>

            <h2>3. Cookie Policy</h2>
            <p>We use cookies to:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Enable core functionality like security and accessibility</li>
              <li><strong>Preference Cookies:</strong> Remember your settings (dark mode, font size, interests)</li>
              <li><strong>Analytics Cookies:</strong> Understand how visitors interact with our site</li>
              <li><strong>Advertising Cookies:</strong> Deliver relevant advertisements</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Note that disabling certain cookies may affect your experience on our site.
            </p>

            <h2>4. Information Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Companies that help us operate (hosting, analytics, email delivery)</li>
              <li><strong>Advertising Partners:</strong> For targeted advertising (in aggregated, anonymized form)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data, including:
            </p>
            <ul>
              <li>HTTPS encryption for all data transmission</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage practices</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:privacy@afriverse.ng">privacy@afriverse.ng</a>
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              Our site may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to read their privacy policies.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              AfriVerse is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us immediately.
            </p>

            <h2>9. Data Retention</h2>
            <p>
              We retain your personal data only as long as necessary for the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>

            <h2>10. International Users</h2>
            <p>
              AfriVerse is headquartered in Lagos, Nigeria, with operations across Africa. If you access our site from outside Africa, your data may be transferred to and processed in our African data centers, which may have different data protection laws than your country.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes by posting a notice on our site or sending an email. Continued use of our site after changes constitutes acceptance.
            </p>

            <h2>12. Contact Us</h2>
            <p>For privacy-related questions or concerns:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacy@afriverse.ng">privacy@afriverse.ng</a></li>
              <li><strong>Address:</strong> 15 Adeola Odeku Street, Victoria Island, Lagos, Nigeria</li>
            </ul>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
              <h3 className="mt-0">Summary</h3>
              <p className="mb-0">
                We collect minimal data needed to provide you with a great reading experience. We don't sell your data. You can control your preferences and request deletion of your data at any time. For questions, email <a href="mailto:privacy@afriverse.ng">privacy@afriverse.ng</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
