'use server';

import { resend } from '../resend';
import WelcomeEmail from '../templates/WelcomeEmail';

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  const resendObj = await resend();
  try {
    const { data, error } = await resendObj.emails.send({
      from: process.env.COMPANY_EMAIL!,
      to: email,
      subject: 'Welcome to Our Service!',
      html: WelcomeEmail({ firstName }),
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: (error as any).error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'Failed to send email' };
  }
};
