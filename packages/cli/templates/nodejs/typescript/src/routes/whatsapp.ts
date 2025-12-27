
// ============================================
// NODE.JS TYPESCRIPT - src/routes/whatsapp.ts
// ============================================
import { Router } from 'express';
import { WhatsAppClient } from '@sndp/meta-whatsapp';

export const whatsappRouter = Router();

whatsappRouter.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    const accessToken = (req.session as any).accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const wa = new WhatsAppClient({
      accessToken,
      phoneNumberId: process.env.META_PHONE_NUMBER_ID!
    });

    const response = await wa.sendText(to, message);

    res.json({
      success: true,
      messageId: response.messages[0].id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});