// ============================================
// packages/cli/src/commands/whatsapp.ts
// ============================================
import * as dotenv from 'dotenv';
import { WhatsAppClient } from '@sndp/meta-whatsapp';
import { logger } from '../utils/logger';
import inquirer from 'inquirer';

dotenv.config();

export async function whatsappCommand() {
  logger.header('📲 WhatsApp Cloud API Check');

  const accessToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  // Validate environment variables
  if (!accessToken) {
    logger.error('META_ACCESS_TOKEN not found in .env');
    return;
  }

  if (!phoneNumberId) {
    logger.error('META_PHONE_NUMBER_ID not found in .env');
    logger.suggestion('Get your Phone Number ID from https://business.facebook.com/latest/whatsapp_manager');
    return;
  }

  logger.success('Access Token valid');
  logger.success('Phone Number ID linked');

  // Initialize client
  const wa = new WhatsAppClient({
    accessToken,
    phoneNumberId
  });

  // Ask for test message
  const { sendTest } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'sendTest',
      message: 'Send a test message?',
      default: false
    }
  ]);

  if (sendTest) {
    const { phoneNumber } = await inquirer.prompt([
      {
        type: 'input',
        name: 'phoneNumber',
        message: 'Enter phone number (with country code, e.g., 8801712345678):',
        validate: (input) => {
          if (input.length < 10) {
            return 'Please enter a valid phone number';
          }
          return true;
        }
      }
    ]);

    const spinner = logger.spinner('Sending test message...');

    try {
      const response = await wa.sendText(
        phoneNumber,
        '🎉 Test message from Meta SDK CLI!'
      );

      spinner.succeed('Test message sent');
      logger.success(`Message ID: ${response.messages[0].id}`);
      logger.info(`Status: SENT ✅`);

    } catch (error: any) {
      spinner.fail('Failed to send message');
      
      if (error.response?.data?.error) {
        logger.error(`Error: ${error.response.data.error.message}`);
        
        if (error.response.data.error.code === 131047) {
          logger.suggestion('Phone number not registered. User needs to message your WhatsApp Business number first.');
        }
      } else {
        logger.error(`Error: ${error.message}`);
      }
    }
  }
}