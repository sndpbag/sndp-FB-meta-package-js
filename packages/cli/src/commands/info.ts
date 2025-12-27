// ============================================
// packages/cli/src/commands/info.ts
// ============================================
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';
import chalk from 'chalk';
import boxen from 'boxen';

export async function infoCommand() {
  const version = '1.0.0';
  
  // ASCII Art Logo
  const logo = chalk.cyan.bold(`
   __  __ _____ _____  _    
  |  \\/  | ____|_   _|/ \\   
  | |\\/| |  _|   | | / _ \\  
  | |  | | |___  | |/ ___ \\ 
  |_|  |_|_____| |_/_/   \\_\\
                            
   ${chalk.white('SDK for Meta Platforms')}
  `);

  console.log(logo);

  // Version and info
  const info = `
${chalk.bold('Version:')} ${chalk.green(version)}
${chalk.bold('Author:')} Sandip (SNDP)
${chalk.bold('License:')} MIT

${chalk.bold.cyan('Supported Platforms:')}
${chalk.green('✓')} Facebook Login & Pages
${chalk.green('✓')} WhatsApp Business Cloud API
${chalk.green('✓')} Instagram Business & Creator
${chalk.green('✓')} Meta Webhooks

${chalk.bold.cyan('Supported Frameworks:')}
${chalk.green('✓')} Next.js (App Router & Pages Router)
${chalk.green('✓')} React (with Vite)
${chalk.green('✓')} Node.js (Express & Standalone)
${chalk.green('✓')} TypeScript & JavaScript
  `.trim();

  console.log(boxen(info, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }));

  // Check installed modules
  logger.section('📦 Installed Modules:');
  
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const modules = [
      { name: '@sndp/meta-core', label: 'Core' },
      { name: '@sndp/meta-auth-client', label: 'Auth (Client)' },
      { name: '@sndp/meta-auth-server', label: 'Auth (Server)' },
      { name: '@sndp/meta-whatsapp', label: 'WhatsApp' },
      { name: '@sndp/meta-instagram', label: 'Instagram' },
      { name: '@sndp/meta-pages', label: 'Pages' }
    ];
    
    let installedCount = 0;
    
    modules.forEach(module => {
      const installed = packageJson.dependencies?.[module.name] || 
                       packageJson.devDependencies?.[module.name];
      
      if (installed) {
        logger.success(`${module.label.padEnd(20)} ${chalk.dim(installed)}`);
        installedCount++;
      } else {
        logger.info(`${module.label.padEnd(20)} ${chalk.dim('not installed')}`);
      }
    });
    
    if (installedCount === 0) {
      logger.warning('\nNo Meta SDK modules found in this project');
    }
    
  } catch (error) {
    logger.warning('Could not read package.json');
  }

  // Available commands
  logger.section('\n🚀 Available Commands:');
  
  const commands = [
    { cmd: 'meta-sdk init', desc: 'Initialize a new project with interactive setup' },
    { cmd: 'meta-sdk auth', desc: 'Diagnose authentication and token issues' },
    { cmd: 'meta-sdk whatsapp', desc: 'Test WhatsApp Cloud API connection' },
    { cmd: 'meta-sdk webhook', desc: 'Verify webhook configuration' },
    { cmd: 'meta-sdk doctor', desc: 'Run complete health check' },
    { cmd: 'meta-sdk info', desc: 'Show SDK information (this command)' }
  ];
  
  commands.forEach(({ cmd, desc }) => {
    console.log(`  ${chalk.cyan(cmd.padEnd(25))} ${chalk.dim(desc)}`);
  });

  // Quick links
  logger.section('\n📚 Resources:');
  
  const links = [
    { label: 'Documentation', url: 'https://docs.sndp.dev/meta-sdk' },
    { label: 'GitHub Repository', url: 'https://github.com/sndp/meta-sdk' },
    { label: 'NPM Package', url: 'https://npmjs.com/package/@sndp/meta-sdk' },
    { label: 'Meta Developer Docs', url: 'https://developers.facebook.com/docs' },
    { label: 'WhatsApp Business API', url: 'https://developers.facebook.com/docs/whatsapp' },
    { label: 'Report Issues', url: 'https://github.com/sndp/meta-sdk/issues' }
  ];
  
  links.forEach(({ label, url }) => {
    console.log(`  ${chalk.cyan('•')} ${label.padEnd(25)} ${chalk.dim(url)}`);
  });

  // Environment mode
  logger.section('\n⚙️  Current Environment:');
  
  const mode = process.env.NODE_ENV || 'development';
  const modeColor = mode === 'production' ? chalk.green : chalk.yellow;
  
  logger.info(`Mode: ${modeColor(mode)}`);
  logger.info(`Node: ${chalk.cyan(process.version)}`);
  logger.info(`Platform: ${chalk.cyan(process.platform)}`);
  logger.info(`Architecture: ${chalk.cyan(process.arch)}`);

  // Configuration status
  logger.section('\n🔧 Configuration Status:');
  
  const envVars = [
    'META_APP_ID',
    'META_APP_SECRET',
    'META_ACCESS_TOKEN',
    'META_PHONE_NUMBER_ID',
    'META_WEBHOOK_VERIFY_TOKEN'
  ];
  
  let configuredCount = 0;
  
  envVars.forEach(varName => {
    if (process.env[varName]) {
      logger.success(`${varName.padEnd(30)} ✓`);
      configuredCount++;
    } else {
      logger.warning(`${varName.padEnd(30)} ✗`);
    }
  });
  
  const percentage = Math.round((configuredCount / envVars.length) * 100);
  
  console.log(`\n  ${chalk.bold('Setup Completion:')} ${getProgressBar(percentage)} ${chalk.cyan(`${percentage}%`)}`);

  // Quick tips
  logger.section('\n💡 Quick Tips:');
  
  console.log(chalk.dim(`
  • Run ${chalk.cyan('meta-sdk doctor')} to diagnose issues
  • Use ${chalk.cyan('meta-sdk init')} to scaffold new projects
  • Check ${chalk.cyan('.env.example')} for required variables
  • Enable ${chalk.cyan('strict mode')} in TypeScript for better safety
  • Keep your access tokens secure and never commit them
  `));

  // Footer
  console.log(chalk.dim('\n  Made with ❤️  by Sandip (SNDP)'));
  console.log(chalk.dim(`  Get support: support@sndp.dev\n`));
}

function getProgressBar(percentage: number): string {
  const total = 20;
  const filled = Math.round((percentage / 100) * total);
  const empty = total - filled;
  
  const bar = chalk.green('█').repeat(filled) + chalk.gray('░').repeat(empty);
  return `[${bar}]`
}