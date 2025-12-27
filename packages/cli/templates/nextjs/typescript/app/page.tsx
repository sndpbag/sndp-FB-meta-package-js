// ============================================
// NEXT.JS TYPESCRIPT - app/page.tsx
// ============================================
'use client';

import { useState } from 'react';
import LoginButton from '@/components/LoginButton';
import WhatsAppSender from '@/components/WhatsAppSender';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Meta SDK Demo</h1>
        
        <div className="space-y-8">
          {/* Authentication Section */}
          <section className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">🔐 Authentication</h2>
            <LoginButton onAuthChange={setIsAuthenticated} />
          </section>

          {/* WhatsApp Section */}
          {isAuthenticated && (
            <section className="p-6 border rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">📲 WhatsApp</h2>
              <WhatsAppSender />
            </section>
          )}

          {/* Documentation */}
          <section className="p-6 border rounded-lg bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4">📚 Documentation</h2>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://docs.sndp.dev/meta-sdk" 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meta SDK Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://developers.facebook.com/docs" 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meta Developer Docs
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}