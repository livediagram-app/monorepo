import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import './globals.css';

// The livediagram help centre (spec/55). Indexable static site served
// under /help by the router. No third-party scripts, it stays
// self-host-clean (spec/03).
export const metadata: Metadata = {
  metadataBase: new URL('https://livediagram.app'),
  title: {
    default: 'Help Centre · livediagram',
    template: '%s · livediagram Help',
  },
  description:
    'Guides, tutorials, and answers for livediagram. Browse feature documentation, getting-started guides, and troubleshooting.',
  alternates: { canonical: '/help' },
  openGraph: {
    type: 'website',
    siteName: 'livediagram Help Centre',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary',
  },
  robots: { index: true, follow: true },
  // Literal hrefs, so Next leaves them un-prefixed by the `/help`
  // basePath and the router resolves them to the workers that already
  // serve them (live serves /icon.svg, marketing serves the PNG +
  // /apple-icon). Mirrors apps/telemetry. See spec/16.
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/livediagram-icon-256.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: '/apple-icon',
  },
};

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-800 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
