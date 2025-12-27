// ============================================
// NEXT.JS TYPESCRIPT - app/api/auth/status/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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