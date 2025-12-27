// ============================================
// packages/cli/src/index.ts
// ============================================
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { authCommand } from './commands/auth';
import { whatsappCommand } from './commands/whatsapp';
import { webhookCommand } from './commands/webhook';
import { doctorCommand } from './commands/doctor';
import { infoCommand } from './commands/info';
import { showWelcome } from './utils/logger';

const program = new Command();

program
  .name('meta-sdk')
  .description('CLI tool for Meta SDK - Build Facebook, Instagram & WhatsApp apps')
  .version('1.0.0');

// Show welcome banner
showWelcome();

// Commands
program
  .command('init')
  .description('Initialize a new Meta SDK project')
  .action(initCommand);

program
  .command('auth')
  .description('Diagnose Meta authentication setup')
  .action(authCommand);

program
  .command('whatsapp')
  .description('Test WhatsApp Cloud API connection')
  .action(whatsappCommand);

program
  .command('webhook')
  .description('Verify and test webhook configuration')
  .action(webhookCommand);

program
  .command('doctor')
  .description('Run complete health check on your Meta SDK setup')
  .action(doctorCommand);

program
  .command('info')
  .description('Display Meta SDK information')
  .action(infoCommand);

program.parse();
