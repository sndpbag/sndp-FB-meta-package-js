// ============================================
// NEXT.JS JAVASCRIPT - components/LoginButton.js
// ============================================
'use client';

import { useState, useEffect } from 'react';

export default function LoginButton({ onAuthChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (onAuthChange) {
        onAuthChange(data.authenticated);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'DELETE' });
      setIsAuthenticated(false);
      if (onAuthChange) {
        onAuthChange(false);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓ Authenticated</span>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isLoading ? 'Loading...' : 'Login with Facebook'}
    </button>
  );
}
