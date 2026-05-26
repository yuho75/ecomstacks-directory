import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Sends a confirmation email when a user successfully submits a tool to EcomStacks.
 */
export async function sendSubmissionEmail(email: string, title: string, tier: string) {
  if (!resend) {
    console.log('📬 Resend email skipped (API key not configured) for submission:', title);
    return;
  }

  const tierLabel = tier.toUpperCase();

  try {
    const { data, error } = await resend.emails.send({
      from: `EcomStacks <${resendFromEmail}>`,
      to: email,
      subject: `📥 Your tool submission has been received: ${title} - EcomStacks`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333333;">
          <h1 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px;">Submission Received! ✨</h1>
          <p>Thank you for submitting <strong>${title}</strong> to EcomStacks Directory!</p>
          <p>We have successfully received your listing details under the <strong>${tierLabel} Plan</strong>. Your tool is now in the queue for manual review.</p>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #0f172a;">What happens next?</h3>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li>🕵️‍♂️ <strong>Quality Review:</strong> We review all submissions within 24 hours to ensure high-quality listings.</li>
              <li>🤖 <strong>AI Enrichment:</strong> Once approved, our advanced <strong>Gemini AI</strong> will automatically analyze your website to write premium search-optimized features, summaries, and reviews for your detailed page.</li>
              <li>🚀 <strong>Going Live:</strong> As soon as the review is complete, your tool will go live on ecomstacksdirectory.com and we will email you the link!</li>
            </ul>
          </div>
          
          <p>If you have any questions or need to update your submission before approval, please feel free to reply directly to this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #64748b;">
            &copy; 2026 EcomStacks. All rights reserved.<br/>
            You received this email because you submitted a tool to EcomStacks Directory.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend submission email error:', error);
    } else {
      console.log(`✉️ Submission confirmation email sent to ${email} for ${title}`, data);
    }
  } catch (err) {
    console.error('❌ Failed to call Resend for submission email:', err);
  }
}

/**
 * Sends a congratulations email when a tool is approved by the administrator.
 */
export async function sendApprovalEmail(email: string, title: string, id: string) {
  if (!resend) {
    console.log('📬 Resend email skipped (API key not configured) for approval:', title);
    return;
  }

  const liveLink = `https://ecomstacksdirectory.com/items/${id}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `EcomStacks <${resendFromEmail}>`,
      to: email,
      subject: `🚀 Congratulations! Your tool is now live on EcomStacks: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333333;">
          <h1 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px;">Your tool is live! 🎉</h1>
          <p>Great news! Your tool <strong>${title}</strong> has been successfully approved and is now officially published on EcomStacks Directory.</p>
          
          <p>It is visible to thousands of e-commerce store owners, operators, and D2C brands searching for advanced AI and SaaS solutions to optimize their growth.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${liveLink}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Live Listing 🚀</a>
          </div>

          <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #0f172a;">🤖 Supercharged by Gemini AI</h3>
            <p style="margin-bottom: 0;">To make your listing convert maximum visitors, our **Gemini 2.5 Flash AI** has automatically analyzed your website and crafted a highly compelling, search-optimized overview, 3 key features, and realistic customer reviews for your detailed page!</p>
          </div>
          
          <p>Thank you for submitting your tool and helping us grow the e-commerce SaaS ecosystem!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #64748b;">
            &copy; 2026 EcomStacks. All rights reserved.<br/>
            You received this email because you submitted a tool to EcomStacks Directory.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend approval email error:', error);
    } else {
      console.log(`✉️ Approval notification email sent to ${email} for ${title}`, data);
    }
  } catch (err) {
    console.error('❌ Failed to call Resend for approval email:', err);
  }
}
