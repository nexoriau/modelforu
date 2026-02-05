import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailData = {
  to: string;
  userName: string;
  notificationType: string;
  title: string;
  message: string;
};

/**
 * Sends notification email using Resend
 */
export async function sendNotificationEmail(data: EmailData) {
  try {
    const { to, userName, notificationType, title, message } = data;

    // Generate email HTML
    const emailHtml = generateEmailTemplate({
      userName,
      title,
      message,
      notificationType,
    });

    // Send email via Resend
    const response = await resend.emails.send({
      from: process.env.COMPANY_EMAIL || 'notifications@modelforyou.com',
      to: [to],
      subject: title,
      html: emailHtml,
    });

    if (response.error) {
      console.error('Resend email error:', response.error);
      return { error: true, message: response.error };
    }

    return { error: false, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending notification email:', error);
    return { error: true, message: 'Failed to send email' };
  }
}

/**
 * Generate HTML email template
 */
function generateEmailTemplate(data: {
  userName: string;
  title: string;
  message: string;
  notificationType: string;
}) {
  const { userName, title, message, notificationType } = data;

  // Get icon and color based on notification type
  const styles = getNotificationStyles(notificationType);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    Model For You
                  </h1>
                </td>
              </tr>
              
              <!-- Icon -->
              <tr>
                <td align="center" style="padding: 32px 40px 16px;">
                  <div style="width: 64px; height: 64px; background-color: ${styles.bgColor}; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                    <span style="font-size:32px; line-height: 1; margin: auto;">${styles.icon}</span>
                  </div>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 0 40px 32px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600; text-align: center;">
                    ${title}
                  </h2>
                  <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                    Hi ${userName},
                  </p>
                  <p style="margin: 16px 0 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                    ${message}
                  </p>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 0 40px 32px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || '/'}" 
                     style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    View Dashboard
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5; text-align: center;">
                    You're receiving this email because you have notifications enabled for this type of activity.
                  </p>
                  <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.5; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/notification-management" style="color: #667eea; text-decoration: none;">
                      Manage notification preferences
                    </a>
                  </p>
                  <p style="margin: 16px 0 0; color: #d1d5db; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} Model For You. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Get styling based on notification type
 */
function getNotificationStyles(type: string): { icon: string; bgColor: string } {
  const styles: Record<string, { icon: string; bgColor: string }> = {
    model_cloned: { icon: '🎨', bgColor: '#dbeafe' },
    subscription: { icon: '💳', bgColor: '#e0e7ff' },
    invoice: { icon: '📄', bgColor: '#fef3c7' },
    credits: { icon: '⚡', bgColor: '#fef3c7' },
    referral: { icon: '🎁', bgColor: '#d1fae5' },
    product_updates: { icon: '🚀', bgColor: '#e0e7ff' },
  };

  return styles[type] || { icon: '🔔', bgColor: '#e5e7eb' };
}