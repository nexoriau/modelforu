import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Providers from '@/lib/Providers';
import { AuthContextProvider } from '@/context/AuthContext';
import { auth } from './auth/_services/auth';
import { I18nProvider } from '@/lib/I18nProvider';
import MainContent from './wrapper';
import ScrollTop from '@/components/shared/ScrollTop';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Model For You',
  description: 'Custom Photos, Videos, and Voice Messages — Powered by AI',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContextProvider userId={session?.user.id}>
          <Providers>
            <I18nProvider>
              <ScrollTop />
              <div className="flex flex-col justify-between min-h-screen">
                <Navbar />
                <main className="pt-[60px] bg-gray-50">{children}</main>
                <Footer />
              </div>
            </I18nProvider>
          </Providers>
        </AuthContextProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
