'use server';

import { Resend } from 'resend';
export const resend = async () => new Resend(process.env.RESEND_API_KEY!);
