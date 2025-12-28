// ============================================
// NEXT.JS JAVASCRIPT - app/api/auth/status/route.js
// ============================================
import { NextResponse } from 'next/server';

export async function GET(request) {
  const cookies = request.cookies;
  const accessToken = cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false });
  }

  // Validate token with Meta
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    );
    
    if (response.ok) {
      return NextResponse.json({ authenticated: true });
    }
  } catch (error) {
    // Token is invalid
  }

  return NextResponse.json({ authenticated: false });
}
