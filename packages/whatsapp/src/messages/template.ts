// ============================================
// packages/whatsapp/src/messages/template.ts
// ============================================
import { HttpClient } from '@sndp/meta-core';
import { SendMessageResponse, TemplateMessage as TemplateMessageType } from '../types';

export class TemplateMessage {
  constructor(
    private http: HttpClient,
    private phoneNumberId: string
  ) {}

  async send(
    to: string,
    template: TemplateMessageType
  ): Promise<SendMessageResponse> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: template.name,
        language: {
          code: template.language
        },
        ...(template.components && { components: template.components })
      }
    };

    return this.http.post(`/${this.phoneNumberId}/messages`, payload);
  }

  /**
   * Helper: Create a simple text template
   */
  createTextTemplate(
    name: string,
    language: string,
    bodyVariables: string[]
  ): TemplateMessageType {
    return {
      name,
      language,
      components: [
        {
          type: 'body',
          parameters: bodyVariables.map(text => ({
            type: 'text',
            text
          }))
        }
      ]
    };
  }

  /**
   * Helper: Create a template with header image
   */
  createImageHeaderTemplate(
    name: string,
    language: string,
    imageUrl: string,
    bodyVariables?: string[]
  ): TemplateMessageType {
    const components: any[] = [
      {
        type: 'header',
        parameters: [
          {
            type: 'image',
            image: { link: imageUrl }
          }
        ]
      }
    ];

    if (bodyVariables && bodyVariables.length > 0) {
      components.push({
        type: 'body',
        parameters: bodyVariables.map(text => ({
          type: 'text',
          text
        }))
      });
    }

    return {
      name,
      language,
      components
    };
  }

  /**
   * Helper: Create a template with button
   */
  createButtonTemplate(
    name: string,
    language: string,
    bodyVariables: string[],
    buttonVariables: string[]
  ): TemplateMessageType {
    return {
      name,
      language,
      components: [
        {
          type: 'body',
          parameters: bodyVariables.map(text => ({
            type: 'text',
            text
          }))
        },
        ...buttonVariables.map((text, index) => ({
          type: 'button' as const,
          sub_type: 'url',
          index,
          parameters: [
            {
              type: 'text' as const,
              text
            }
          ]
        }))
      ]
    };
  }
}