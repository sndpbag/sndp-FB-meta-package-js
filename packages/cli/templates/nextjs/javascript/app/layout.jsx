// ============================================
// NEXT.JS JAVASCRIPT - app/layout.js
// ============================================
import './globals.css';

export const metadata = {
  title: 'Meta SDK App',
  description: 'Built with @sndp/meta-sdk',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}