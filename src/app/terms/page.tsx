import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service - EcomStacks',
  description: 'Terms of Service governing the use of the EcomStacks curated directory.',
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-on-surface-variant mb-10">Last updated: May 25, 2026</p>

          <div className="space-y-8 text-on-surface text-[15px] leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                1. Agreement to Terms
              </h2>
              <p>
                Welcome to EcomStacks (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using our website, directory, and associated services (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use the Service.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                2. Directory Submission & Content Rules
              </h2>
              <p>
                By submitting a software tool, template, website, or service (a &quot;Submission&quot;) to our directory, you warrant that:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-on-surface-variant">
                <li>All information provided in your submission is accurate, complete, and up-to-date.</li>
                <li>You own or possess the necessary rights and licenses for the software, branding, and content submitted.</li>
                <li>The submission does not violate any third-party intellectual property or privacy rights.</li>
              </ul>
              <p>
                We reserve the absolute right to review, edit, reject, categorize, or permanently remove any Submission from the directory at any time, for any reason, without prior notice.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                3. Sponsored Placements & Refund Policy
              </h2>
              <p>
                We offer paid promotional plans (e.g., &quot;Featured Sponsors&quot; or &quot;Premium Launch&quot;) to enhance listing visibility. 
              </p>
              <p>
                Payments for sponsored placements are processed securely through PayPal. All billing cycles and pricing packages are governed by the terms specified at checkout. 
              </p>
              <p className="font-semibold text-on-surface bg-on-surface/5 p-4 rounded-xl border border-outline-variant/40">
                ⚠️ Refund Policy: Due to the immediate delivery of visual advertising real estate, exposure, and manual review efforts, all payments for approved and published placements are final and non-refundable. If a submission is rejected by our quality team, a full refund will be processed immediately.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                4. Intellectual Property Rights
              </h2>
              <p>
                We do not claim ownership of the brand assets, logos, and product screenshots you submit to the directory. However, by submitting your tool, you grant us a worldwide, non-exclusive, royalty-free, fully-paid license to display, host, and distribute your submission assets solely for displaying, hosting, and marketing EcomStacks Directory and our monthly newsletter.
              </p>
              <p>
                The overall design, logos, brand markers, code structure, custom vectors, and compilation of the EcomStacks Directory are the exclusive property of EcomStacks and are protected under international copyright and trademark laws.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                5. Third-Party Tools & Limitation of Liability
              </h2>
              <p className="font-semibold">
                EcomStacks is a curated directory of third-party software tools. We do not own, develop, or operate any of the listed tools.
              </p>
              <p>
                Your interactions, business dealings, or software downloads with any third-party tools listed in the directory are solely between you and the respective provider. 
              </p>
              <p className="italic bg-surface-container/60 p-4 rounded-xl border border-outline-variant/30 text-on-surface-variant">
                &quot;EcomStacks, its founders, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages, software bugs, data losses, security breaches, or transaction disputes arising from your use of any third-party tools listed on our website.&quot;
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 
                className="text-xl font-bold text-on-surface tracking-tight border-b border-outline-variant/60 pb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                6. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. When we make updates, we will revise the &quot;Last updated&quot; date at the top of this page. Your continued use of the Service after changes are published constitutes your acceptance of the updated terms.
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
                If you have any questions or concerns regarding these Terms of Service, please contact us at:
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
