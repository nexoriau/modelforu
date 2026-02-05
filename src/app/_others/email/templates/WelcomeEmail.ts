const WelcomeEmail = ({ firstName }: { firstName: string }) => {
  return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Model For You</title>
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
        .features-card {
            padding: 20px;
            background-color: #f4f4f5;
            border: 1px solid #e4e4e7;
            border-radius: 6px;
            margin: 24px 0;
        }
        .feature-list {
            margin: 12px 0;
            padding-left: 0;
            list-style: none;
        }
        .feature-list li {
            padding-left: 28px;
            margin-bottom: 10px;
            position: relative;
            color: #52525b;
            font-size: 15px;
        }
        .feature-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #22c55e;
            font-weight: bold;
            font-size: 16px;
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
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #09090b;
            margin: 24px 0 12px;
        }
        .text-body {
            font-size: 15px;
            color: #52525b;
            margin: 0 0 16px;
            line-height: 1.7;
        }
        .badge {
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
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #fafafa; line-height: 1.2;">Welcome to Model For You</h1>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <p class="greeting">Hi ${firstName},</p>
                        
                        <p class="text-body">Thank you for joining Model For You! We're excited to have you on board. Your account is now ready, and you have access to our advanced platform.</p>
                        
                        
                        <p class="text-body" style="margin-bottom: 8px;">Here's what to do next:</p>
                        <ul class="feature-list" style="margin-top: 8px;">
                            <li>Explore our voice library and test different voices and styles</li>
                            <li>Try out various use cases to see what works best for your project</li>
                            <li>For developers: Connect through our API documentation for quick integration</li>
                        </ul>
                        
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Start Creating Your First AI Voice</a>
                        </div>
                        
                        <p class="text-body" style="margin-top: 32px; text-align: center; color: #71717a; font-size: 14px;">
                            Have questions? Our support team is here to help you every step of the way.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p style="margin: 0 0 8px; font-weight: 500; color: #52525b;">Best regards,</p>
                        <p style="margin: 0; color: #71717a;">The Model For You Team</p>
                        
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

export default WelcomeEmail;

/* <div class="features-card">
                             <p class="section-title" style="margin-top: 0;">What you can do with SynthDream:</p>
                             <ul class="feature-list">
                                 <li>Generate lifelike voices in multiple languages and accents</li>
                                 <li>Experience ultra-low latency performance for real-time use cases</li>
                                 <li>Reach global audiences with voices that sound natural and engaging</li>
                                 <li>Access our powerful API for seamless integration</li>
                             </ul>
                         </div>
                        
                         <p class="section-title">Getting Started</p>
                         <p class="text-body">To help you get started, we've added <span class="badge">50 Free Credits</span> to your account. You can begin generating AI voices right away!</p> */
