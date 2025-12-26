// ============================================
// packages/whatsapp/src/client.ts
// ============================================
import { HttpClient, validateConfig, WhatsAppConfigSchema } from '@sndp/meta-core';
import { WhatsAppConfig, SendMessageResponse } from './types';
import { TextMessage } from './messages/text';
import { MediaMessage } from './messages/media';
import { TemplateMessage } from './messages/template';
import { InteractiveMessage } from './messages/interactive';
import { LocationMessage } from './messages/location';
import { ContactMessage } from './messages/contact';

export class WhatsAppClient {
  private http: HttpClient;
  private phoneNumberId: string;
  private businessAccountId?: string;

  public text: TextMessage;
  public media: MediaMessage;
  public template: TemplateMessage;
  public interactive: InteractiveMessage;
  public location: LocationMessage;
  public contact: ContactMessage;

  constructor(config: WhatsAppConfig) {
    // Validate configuration
    const validatedConfig = validateConfig(WhatsAppConfigSchema, config);

    this.phoneNumberId = validatedConfig.phoneNumberId;
    this.businessAccountId = config.businessAccountId;

    // Initialize HTTP client
    this.http = new HttpClient({
      baseURL: `https://graph.facebook.com/${config.version || 'v18.0'}`,
      accessToken: validatedConfig.accessToken,
      version: config.version || 'v18.0'
    });

    // Initialize message handlers
    this.text = new TextMessage(this.http, this.phoneNumberId);
    this.media = new MediaMessage(this.http, this.phoneNumberId);
    this.template = new TemplateMessage(this.http, this.phoneNumberId);
    this.interactive = new InteractiveMessage(this.http, this.phoneNumberId);
    this.location = new LocationMessage(this.http, this.phoneNumberId);
    this.contact = new ContactMessage(this.http, this.phoneNumberId);
  }

  /**
   * Send a text message (shorthand)
   */
  async sendText(to: string, message: string, options?: { previewUrl?: boolean }): Promise<SendMessageResponse> {
    return this.text.send(to, message, options);
  }

  /**
   * Send an image (shorthand)
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<SendMessageResponse> {
    return this.media.sendImage(to, imageUrl, caption);
  }

  /**
   * Send a template message (shorthand)
   */
  async sendTemplate(to: string, templateName: string, language: string, components?: any[]): Promise<SendMessageResponse> {
    return this.template.send(to, { name: templateName, language, components });
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<{ success: boolean }> {
    return this.http.post(`/${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    });
  }

  /**
   * Get media URL from media ID
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    const response: any = await this.http.get(`/${mediaId}`);
    return response.url;
  }

  /**
   * Download media from URL
   */
  async downloadMedia(url: string): Promise<Buffer> {
    const axios = require('axios');
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${this.http['client'].defaults.headers.Authorization}`
      }
    });
    return Buffer.from(response.data);
  }

  /**
   * Upload media file
   */
  async uploadMedia(file: Buffer, mimeType: string, filename?: string): Promise<{ id: string }> {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('messaging_product', 'whatsapp');
    form.append('file', file, {
      filename: filename || 'file',
      contentType: mimeType
    });

    return this.http.post(`/${this.phoneNumberId}/media`, form, {
      headers: form.getHeaders()
    });
  }
}