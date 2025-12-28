// ============================================
// NEXT.JS JAVASCRIPT - app/api/whatsapp/send/route.js
// ============================================
import { NextResponse } from 'next/server';
import { WhatsAppClient } from '@sndp/meta-whatsapp';

export async function POST(request) {
  try {
    // Get access token from cookie
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Initialize WhatsApp client
    const wa = new WhatsAppClient({
      accessToken,
      phoneNumberId: process.env.META_PHONE_NUMBER_ID
    });

    // Send message
    const response = await wa.sendText(to, message);

    return NextResponse.json({
      success: true,
      messageId: response.messages[0].id
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
