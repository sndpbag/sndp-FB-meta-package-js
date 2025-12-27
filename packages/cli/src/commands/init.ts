// ============================================
// packages/cli/src/commands/init.ts
// ============================================
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from '../utils/logger';
import { promptProjectSetup } from '../utils/prompts';
import { TemplateGenerator } from '../utils/templates';
import { execSync } from 'child_process';

export async function initCommand() {
  logger.header('🚀 Meta SDK Project Setup');

  try {
    // Get project configuration
    const config = await promptProjectSetup();

    // Validate current directory
    const targetDir = process.cwd();
    const files = await fs.readdir(targetDir);
    
    if (files.length > 0) {
      logger.warning('Directory is not empty. Files may be overwritten.');
    }

    // Generate project
    const spinner = logger.spinner('Generating project files...');
    
    const generator = new TemplateGenerator(config);
    await generator.generate(targetDir);

    spinner.succeed('Project files generated');

    // Install dependencies
    const installSpinner = logger.spinner('Installing dependencies...');
    
    try {
      if (config.packageManager === 'npm') {
        execSync('npm install', { stdio: 'ignore' });
      } else if (config.packageManager === 'yarn') {
        execSync('yarn install', { stdio: 'ignore' });
      } else if (config.packageManager === 'pnpm') {
        execSync('pnpm install', { stdio: 'ignore' });
      }
      installSpinner.succeed('Dependencies installed');
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      logger.warning('Please run the install command manually');
    }

    // Success message
    logger.success('\n✨ Project initialized successfully!\n');

    // Next steps
    logger.section('📋 Next Steps:');
    logger.info('1. Copy .env.example to .env and fill in your credentials');
    logger.info('2. Get your Meta App credentials from https://developers.facebook.com');
    
    if (config.modules.whatsapp) {
      logger.info('3. Setup WhatsApp Business API at https://business.facebook.com');
    }
    
    logger.info(`4. Run '${config.packageManager} run dev' to start development`);
    
    logger.suggestion('\nRun "meta-sdk doctor" to verify your setup');

  } catch (error: any) {
    logger.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}