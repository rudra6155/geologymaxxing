import type { Metadata, Viewport } from 'next';
import { Fraunces, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import { OfflineIndicator } from '@/components/layout/OfflineIndicator';
import { AuthModal } from '@/components/auth/AuthModal';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: {
    default: 'geology.filtree.in — Maharashtra Board Geology Study Guide',
    template: '%s | geology.filtree.in',
  },
  description:
    'Free offline-first study guide for Maharashtra State Board Geology (Std 11 & 12). Lessons, revision sheets, last-minute notes, diagrams, and practice questions.',
  keywords: [
    'Maharashtra Board Geology',
    'HSC Geology',
    'Std 12 Geology',
    'Geology study guide',
    'Board exam preparation',
    'Structural Geology',
    'Petrology',
    'filtree',
  ],
  authors: [{ name: 'geology.filtree.in' }],
  creator: 'geology.filtree.in',
  metadataBase: new URL('https://geology.filtree.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'geology.filtree.in',
    title: 'geology.filtree.in — Maharashtra Board Geology Study Guide',
    description:
      'Free offline-first study guide for Maharashtra State Board Geology. Lessons, revision, last-minute notes, and practice questions.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Geology Filtree',
  },
};

export const viewport: Viewport = {
  themeColor: '#14171B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <OfflineIndicator />
        <AuthModal />
        {children}
      </body>
    </html>
  );
}
