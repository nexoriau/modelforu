"use server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.COMPANY_EMAIL!,
    to: email,
    subject: "Reset your password",
    html: PasswordResetEmail({ resetLink }),
  });
};

export const sendVerificationRequestEmail = async (
  email: string,
  token: string,
) => {
  const confirmLink = `${domain}/auth/email-verification?token=${token}`;

  const { error } = await resend.emails.send({
    from: process.env.COMPANY_EMAIL!,
    to: email,
    subject: "Confirm your email address",
    html: VerificationEmail({ confirmLink }),
  });
  console.log({ error });
  return { error: error?.message };
};

// Password Reset Email Template
const PasswordResetEmail = ({ resetLink }: { resetLink: string }) => {
  return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #09090b;
            background-color: #fafafa;
        }
        .container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #18181b;
            padding: 48px 32px;
            text-align: center;
            border-bottom: 1px solid #27272a;
        }
        .logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #dc2424 0%, #2563eb 100%);
            border-radius: 8px;
            display: inline-block;
            margin-bottom: 16px;
        }
        .content {
            padding: 40px 32px;
            text-align: left;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #09090b;
            margin: 0 0 16px;
            line-height: 1.3;
        }
        .footer {
            padding: 32px;
            text-align: center;
            font-size: 14px;
            color: #71717a;
            background-color: #fafafa;
            border-top: 1px solid #e4e4e7;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #18181b;
            color: #fafafa !important;
            font-size: 15px;
            font-weight: 500;
            border-radius: 6px;
            text-align: center;
            text-decoration: none;
            margin: 20px 0;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #27272a;
        }
        .text-body {
            font-size: 15px;
            color: #52525b;
            margin: 0 0 16px;
            line-height: 1.7;
        }
        .warning-box {
            padding: 16px;
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            margin: 24px 0;
        }
        .warning-icon {
            display: inline-block;
            color: #dc2626;
            font-weight: bold;
            margin-right: 8px;
        }
        .link-expiry {
            display: inline-block;
            padding: 4px 12px;
            background-color: #fef3c7;
            color: #92400e;
            font-size: 13px;
            font-weight: 500;
            border-radius: 4px;
            margin: 8px 0;
        }
        a[x-apple-data-detectors],
        u + #body a,
        a[href^="tel"],
        a[href^="sms"] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        .link-alt {
            word-break: break-all;
            color: #2563eb;
            text-decoration: none;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="background-color: #fafafa; padding: 40px 16px;">
        <tr>
            <td align="center">
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <div class="logo"></div>
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #fafafa; line-height: 1.2;">Password Reset Request</h1>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <p class="greeting">Reset Your Password</p>
                        
                        <p class="text-body">You recently requested to reset your password for your Model For You account. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" class="button">Reset Password</a>
                        </div>
                        
                        <p class="text-body" style="text-align: center; font-size: 14px;">
                            Or copy and paste this link into your browser:<br>
                            <a href="${resetLink}" class="link-alt">${resetLink}</a>
                        </p>
                        
                        <div class="warning-box">
                            <span class="warning-icon">⚠</span>
                            <span style="color: #7f1d1d; font-size: 14px;">
                                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                            </span>
                        </div>
                        
                        <p class="text-body" style="margin-top: 24px;">
                            For security reasons, please don't forward this email to anyone. Our support team will never ask you for your password or this reset link.
                        </p>
                        
                        <div style="margin-top: 24px; text-align: center;">
                            <span class="link-expiry">Expires in 1 hour</span>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p style="margin: 0 0 8px; font-weight: 500; color: #52525b;">Need help?</p>
                        <p style="margin: 0; color: #71717a;">
                            Contact our support team if you have any questions about this request.
                        </p>
                        
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                                © ${new Date().getFullYear()} Model For You. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

// Email Verification Template
const VerificationEmail = ({ confirmLink }: { confirmLink: string }) => {
  return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #09090b;
            background-color: #fafafa;
        }
        .container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #18181b;
            padding: 48px 32px;
            text-align: center;
            border-bottom: 1px solid #27272a;
        }
        .logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #dc2424 0%, #2563eb 100%);
            border-radius: 8px;
            display: inline-block;
            margin-bottom: 16px;
        }
        .content {
            padding: 40px 32px;
            text-align: left;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #09090b;
            margin: 0 0 16px;
            line-height: 1.3;
        }
        .footer {
            padding: 32px;
            text-align: center;
            font-size: 14px;
            color: #71717a;
            background-color: #fafafa;
            border-top: 1px solid #e4e4e7;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #18181b;
            color: #fafafa !important;
            font-size: 15px;
            font-weight: 500;
            border-radius: 6px;
            text-align: center;
            text-decoration: none;
            margin: 20px 0;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #27272a;
        }
        .text-body {
            font-size: 15px;
            color: #52525b;
            margin: 0 0 16px;
            line-height: 1.7;
        }
        .success-box {
            padding: 16px;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 6px;
            margin: 24px 0;
        }
        .success-icon {
            display: inline-block;
            color: #16a34a;
            font-weight: bold;
            margin-right: 8px;
        }
        .verification-badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: #22c55e;
            color: #ffffff;
            font-size: 13px;
            font-weight: 500;
            border-radius: 4px;
            margin: 8px 0;
        }
        a[x-apple-data-detectors],
        u + #body a,
        a[href^="tel"],
        a[href^="sms"] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        .link-alt {
            word-break: break-all;
            color: #2563eb;
            text-decoration: none;
            font-size: 14px;
        }
        .benefits-list {
            margin: 16px 0;
            padding-left: 0;
            list-style: none;
        }
        .benefits-list li {
            padding-left: 28px;
            margin-bottom: 8px;
            position: relative;
            color: #52525b;
            font-size: 15px;
        }
        .benefits-list li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #2563eb;
            font-weight: bold;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="background-color: #fafafa; padding: 40px 16px;">
        <tr>
            <td align="center">
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <div class="logo"></div>
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #fafafa; line-height: 1.2;">Verify Your Email</h1>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <p class="greeting">Welcome to Model For You! 👋</p>
                        
                        <p class="text-body">Thank you for signing up! To complete your registration and start using all features, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${confirmLink}" class="button">Verify Email Address</a>
                        </div>
                        
                        <p class="text-body" style="text-align: center; font-size: 14px;">
                            Or copy and paste this link into your browser:<br>
                            <a href="${confirmLink}" class="link-alt">${confirmLink}</a>
                        </p>
                        
                        <div class="success-box">
                            <span class="success-icon">✓</span>
                            <span style="color: #14532d; font-size: 14px;">
                                Email verification is required to ensure the security of your account and to unlock all platform features.
                            </span>
                        </div>
                        
                        <p class="text-body" style="margin-top: 24px; font-weight: 600; color: #09090b;">
                            After verification, you'll get access to:
                        </p>
                        
                        <ul class="benefits-list">
                            <li>Full access to our voice library and AI models</li>
                            <li>Ability to save and manage your projects</li>
                            <li>Advanced API integration features</li>
                            <li>Personalized recommendations and settings</li>
                        </ul>
                        
                        <div style="margin-top: 24px; text-align: center;">
                            <span class="verification-badge">One-time verification</span>
                        </div>
                        
                        <p class="text-body" style="margin-top: 32px; text-align: center; color: #71717a; font-size: 14px;">
                            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p style="margin: 0 0 8px; font-weight: 500; color: #52525b;">Ready to get started?</p>
                        <p style="margin: 0; color: #71717a;">
                            After verification, you can immediately begin creating AI voices.
                        </p>
                        
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                                © ${new Date().getFullYear()} Model For You. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};
