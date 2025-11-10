import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Social Media Scraper Agent',
  description: 'Discover niche content across multiple social platforms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
