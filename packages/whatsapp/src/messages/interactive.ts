// ============================================
// packages/whatsapp/src/messages/interactive.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { SendMessageResponse, InteractiveMessage as InteractiveMessageType, InteractiveButton, InteractiveListSection } from '../types';

export class InteractiveMessage {
  constructor(
    private http: HttpClient,
    private phoneNumberId: string
  ) {}

  async sendButtons(
    to: string,
    bodyText: string,
    buttons: InteractiveButton[],
    options?: {
      headerText?: string;
      footerText?: string;
    }
  ): Promise<SendMessageResponse> {
    if (buttons.length > 3) {
      throw new Error('Maximum 3 buttons allowed');
    }

    const interactive: InteractiveMessageType = {
      type: 'button',
      body: { text: bodyText },
      action: { buttons }
    };

    if (options?.headerText) {
      interactive.header = {
        type: 'text',
        text: options.headerText
      };
    }

    if (options?.footerText) {
      interactive.footer = {
        text: options.footerText
      };
    }

    return this.send(to, interactive);
  }

  async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: InteractiveListSection[],
    options?: {
      headerText?: string;
      footerText?: string;
    }
  ): Promise<SendMessageResponse> {
    if (sections.length > 10) {
      throw new Error('Maximum 10 sections allowed');
    }

    const interactive: InteractiveMessageType = {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonText,
        sections
      }
    };

    if (options?.headerText) {
      interactive.header = {
        type: 'text',
        text: options.headerText
      };
    }

    if (options?.footerText) {
      interactive.footer = {
        text: options.footerText
      };
    }

    return this.send(to, interactive);
  }

  private async send(
    to: string,
    interactive: InteractiveMessageType
  ): Promise<SendMessageResponse> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive
    };

    return this.http.post(`/${this.phoneNumberId}/messages`, payload);
  }
}