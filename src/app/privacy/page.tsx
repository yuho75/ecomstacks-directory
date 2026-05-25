import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy - EcomStacks',
  description: 'Privacy Policy outlining data collection, processing, and protection practices of the EcomStacks platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-gutter py-16">
        <article className="prose prose-neutral max-w-none">
          <h1 
            className="text-3.5xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-2" 
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-on-surface-variant mb-10">Last updated: May 25, 2026</p>

          <div className="space-y-8 text-on-surface text-[15px] leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                1. Information We Collect
              </h2>
              <p>
                We value your privacy and aim to be completely transparent about the data we collect. Depending on how you interact with the Service, we collect the following types of information:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-on-surface-variant">
                <li><strong className="text-on-surface">Subscribers:</strong> Email addresses entered into subscription forms or welcome modules.</li>
                <li><strong className="text-on-surface">Directory Submitters:</strong> Contact email addresses, software titles, descriptions, categories, brand images, and external URLs.</li>
                <li><strong className="text-on-surface">General Visitors (Log Data):</strong> Anonymized usage metrics, IP addresses, cookie identifiers, browser agents, page views, and click-through counts to measure directory tool popularity.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                2. How We Use Your Information
              </h2>
              <p>
                We use the gathered information strictly for the following purposes:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-on-surface-variant">
                <li>To compile, format, and deliver the monthly EcomStacks newsletter containing curated tools.</li>
                <li>To review, verify, publish, or follow up on directory tool submissions.</li>
                <li>To generate anonymous, aggregated &quot;Popular Tools&quot; click statistics displayed on our dashboard.</li>
                <li>To prevent fraudulent submissions, secure user sessions, and maintain database integrity.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                3. Third-Party Service Processors
              </h2>
              <p>
                To provide a premium and automated experience, we share data securely with trusted cloud sub-processors who meet standard global compliance frameworks:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant/60 text-xs border border-outline-variant/40 rounded-lg overflow-hidden">
                  <thead className="bg-surface-container-low text-on-surface font-bold">
                    <tr>
                      <th className="px-4 py-2 text-left">Partner</th>
                      <th className="px-4 py-2 text-left">Core Purpose</th>
                      <th className="px-4 py-2 text-left">Data Transmitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 text-on-surface-variant bg-surface-container-lowest">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-on-surface">Supabase</td>
                      <td className="px-4 py-2.5">Database hosting & visitor session logs</td>
                      <td className="px-4 py-2.5">Emails, tool details, session tokens, view counts</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-on-surface">MailerLite</td>
                      <td className="px-4 py-2.5">Newsletter directory sync & contact management</td>
                      <td className="px-4 py-2.5">Subscriber emails, subscription status</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-on-surface">Resend</td>
                      <td className="px-4 py-2.5">Onboarding confirmation & welcome transactional emails</td>
                      <td className="px-4 py-2.5">Subscriber email, transactional templates</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-on-surface">PayPal</td>
                      <td className="px-4 py-2.5">Secure payment processing for sponsored placements</td>
                      <td className="px-4 py-2.5">Transaction tokens (Credit card data is handled 100% directly by PayPal)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                4. Cookies & Web Analytics
              </h2>
              <p>
                We use cookies and equivalent local storage methods to verify administration privileges, maintain session integrity, and count unique visits. We do not sell tracking profiles to ad networks or use retargeting pixels for invasive tracking.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                5. User Rights & Data Protection (GDPR / CCPA)
              </h2>
              <p>
                Regardless of your geographic location, you possess full ownership and control over your personal data:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-on-surface-variant">
                <li><strong className="text-on-surface">Right to Opt-Out:</strong> You can unsubscribe from our monthly newsletter instantly and automatically at any time by clicking the unsubscribe link embedded in the footer of any email.</li>
                <li><strong className="text-on-surface">Right of Deletion:</strong> You can request that we completely erase your email address, submission log, or directory page from our database.</li>
                <li><strong className="text-on-surface">Right of Access:</strong> You can request a clear copy of any personal information we store about you in our database.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                6. Data Security
              </h2>
              <p>
                We protect your data by utilizing strict HTTPS transport security, Supabase Row-Level Security (RLS) rules, encrypted API connections, and by regularly auditing API integrations. However, no database over the internet can be guaranteed 100% secure; in the rare event of a data breach, we are committed to informing all impacted users within 72 hours.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                7. Contact Us
              </h2>
              <p>
                To exercise any of your data protection rights, or if you have questions about how we handle visitor metrics, please contact our data team at:
                <br />
                <a href="mailto:hello@ecomstacksdirectory.com" className="text-primary hover:underline font-semibold mt-1 inline-block">
                  hello@ecomstacksdirectory.com
                </a>
              </p>
            </section>

          </div>
        </article>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
