
// ============================================
// NEXT.JS TYPESCRIPT - app/layout.tsx
// ============================================
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meta SDK App',
  description: 'Built with @sndp/meta-sdk',
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