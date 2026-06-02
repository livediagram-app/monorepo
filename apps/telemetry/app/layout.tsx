import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

// The public transparency dashboard (spec/22). Indexable: it's part of
// the open, "here's exactly what we measure" story, not a private app.
export const metadata: Metadata = {
  metadataBase: new URL('https://livediagram.app'),
  title: 'Telemetry · livediagram',
  description:
    'Anonymous, first-party product usage for livediagram, in the open. No third-party vendors; data is never sold or shared beyond this page.',
  alternates: { canonical: '/telemetry' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
