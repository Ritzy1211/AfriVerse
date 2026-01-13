import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | AfriVerse',
  description: 'Terms of service for using AfriVerse. Please read these terms carefully before using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-primary/90 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              Terms of Service
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
                By accessing and using AfriVerse, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, please do not use our platform.
              </p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of AfriVerse's website, content, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.
            </p>

            <h2>2. Use of Services</h2>
            
            <h3>2.1 Eligibility</h3>
            <p>
              You must be at least 13 years old to use our Services. By using AfriVerse, you represent that you meet this age requirement.
            </p>

            <h3>2.2 Permitted Use</h3>
            <p>You may use our Services to:</p>
            <ul>
              <li>Read and share articles for personal, non-commercial purposes</li>
              <li>Comment on articles in accordance with our community guidelines</li>
              <li>Subscribe to newsletters and notifications</li>
              <li>Save articles for later reading</li>
            </ul>

            <h3>2.3 Prohibited Use</h3>
            <p>You may not:</p>
            <ul>
              <li>Reproduce, distribute, or republish our content without permission</li>
              <li>Use automated systems to access our Services (scraping, bots)</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Post false, misleading, or defamatory content</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with the proper functioning of our Services</li>
            </ul>

            <h2>3. User Content</h2>
            
            <h3>3.1 Comments and Submissions</h3>
            <p>
              When you post comments or submit content to AfriVerse, you:
            </p>
            <ul>
              <li>Retain ownership of your original content</li>
              <li>Grant us a non-exclusive, royalty-free license to use, display, and distribute your content</li>
              <li>Represent that your content does not infringe on third-party rights</li>
              <li>Agree that we may moderate, edit, or remove content at our discretion</li>
            </ul>

            <h3>3.2 Community Guidelines</h3>
            <p>All user content must comply with our community guidelines:</p>
            <ul>
              <li>Be respectful and constructive</li>
              <li>No hate speech, discrimination, or harassment</li>
              <li>No spam, advertising, or promotional content</li>
              <li>No illegal content or incitement to illegal activity</li>
              <li>No personal attacks or threats</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            
            <h3>4.1 Our Content</h3>
            <p>
              All content on AfriVerse, including articles, images, videos, graphics, logos, and design elements, is owned by AfriVerse or our licensors and is protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3>4.2 Limited License</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access and view our content for personal, non-commercial use. This license does not include:
            </p>
            <ul>
              <li>The right to reproduce or redistribute our content</li>
              <li>The right to modify or create derivative works</li>
              <li>The right to use our content for commercial purposes</li>
              <li>The right to use our trademarks or branding</li>
            </ul>

            <h3>4.3 DMCA Notice</h3>
            <p>
              If you believe content on our site infringes your copyright, please send a DMCA notice to <a href="mailto:legal@afriverse.africa">legal@afriverse.africa</a> with:
            </p>
            <ul>
              <li>Description of the copyrighted work</li>
              <li>Location of the infringing content</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief</li>
              <li>Your signature (physical or electronic)</li>
            </ul>

            <h2>5. Advertising and Sponsored Content</h2>
            <p>
              AfriVerse displays advertisements and sponsored content. Sponsored content is clearly labeled. We are not responsible for the products, services, or claims made by advertisers. Your dealings with advertisers are solely between you and them.
            </p>

            <h2>6. Third-Party Links</h2>
            <p>
              Our Services may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of service of these websites. Access them at your own risk.
            </p>

            <h2>7. Disclaimer of Warranties</h2>
            <p>
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
            </p>
            <ul>
              <li>Our Services will be uninterrupted or error-free</li>
              <li>Content will be accurate, complete, or current</li>
              <li>Our Services will meet your specific requirements</li>
              <li>Any errors will be corrected</li>
            </ul>

            <h2>8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AfriVerse SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR SERVICES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruptions</li>
              <li>Computer viruses or malware</li>
              <li>Unauthorized access to your information</li>
            </ul>

            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless AfriVerse, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
            </p>
            <ul>
              <li>Your violation of these Terms</li>
              <li>Your content or submissions</li>
              <li>Your violation of any third-party rights</li>
              <li>Your violation of applicable laws</li>
            </ul>

            <h2>10. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of significant changes by posting a notice on our site. Continued use of our Services after changes constitutes acceptance of the modified Terms.
            </p>

            <h2>11. Termination</h2>
            <p>
              We may suspend or terminate your access to our Services at any time, without notice, for any reason, including violation of these Terms. Upon termination, your license to use our Services ends immediately.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms are governed by applicable laws across our operating jurisdictions in Africa, with primary jurisdiction in the Federal Republic of Nigeria. Any disputes arising from these Terms shall be resolved in the courts of Lagos State, Nigeria, or applicable courts in your country of residence within Africa.
            </p>

            <h2>13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h2>14. Contact Us</h2>
            <p>For questions about these Terms:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:legal@afriverse.africa">legal@afriverse.africa</a></li>
              <li><strong>Address:</strong> 15 Adeola Odeku Street, Victoria Island, Lagos, Nigeria</li>
            </ul>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
              <h3 className="mt-0">Summary</h3>
              <p className="mb-0">
                Respect our content and community. Don't copy or redistribute our articles without permission. Be civil in comments. We provide content "as is" without guarantees. For questions, email <a href="mailto:legal@afriverse.africa">legal@afriverse.africa</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
