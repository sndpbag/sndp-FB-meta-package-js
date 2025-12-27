// ============================================
// packages/cli/src/utils/prompts.ts
// ============================================
import inquirer from 'inquirer';
import { ProjectConfig } from '../types';

export async function promptProjectSetup(): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'What are you building?',
      choices: [
        { name: 'Next.js (App Router)', value: 'nextjs' },
        { name: 'React', value: 'react' },
        { name: 'Node.js (Express)', value: 'express' },
        { name: 'Node.js (Standalone)', value: 'nodejs' }
      ],
      default: 'nextjs'
    },
    {
      type: 'list',
      name: 'language',
      message: 'Choose your language:',
      choices: [
        { name: 'TypeScript (Recommended)', value: 'typescript' },
        { name: 'JavaScript', value: 'javascript' }
      ],
      default: 'typescript'
    },
    {
      type: 'checkbox',
      name: 'modules',
      message: 'Select Meta Modules:',
      choices: [
        { name: 'Facebook Login', value: 'auth', checked: true },
        { name: 'WhatsApp Cloud API', value: 'whatsapp', checked: true },
        { name: 'Instagram + Pages', value: 'instagram', checked: true },
        { name: 'Ads API (Coming Soon)', value: 'ads', disabled: true }
      ],
      validate: (answer) => {
        if (answer.length < 1) {
          return 'You must select at least one module.';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['npm', 'yarn', 'pnpm'],
      default: 'npm'
    },
    {
      type: 'confirm',
      name: 'generateEnv',
      message: 'Generate .env.example file?',
      default: true
    },
    {
      type: 'confirm',
      name: 'webhookSupport',
      message: 'Add webhook support? (Recommended)',
      default: true
    }
  ]);

  return {
    framework: answers.framework,
    language: answers.language,
    modules: {
      auth: answers.modules.includes('auth'),
      whatsapp: answers.modules.includes('whatsapp'),
      instagram: answers.modules.includes('instagram'),
      pages: answers.modules.includes('instagram')
    },
    packageManager: answers.packageManager,
    generateEnv: answers.generateEnv,
    webhookSupport: answers.webhookSupport
  };
}

export async function promptEnvVariables(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'META_APP_ID',
      message: 'Meta App ID:',
      validate: (input) => input.length > 0 || 'App ID is required'
    },
    {
      type: 'password',
      name: 'META_APP_SECRET',
      message: 'Meta App Secret:',
      validate: (input) => input.length > 0 || 'App Secret is required'
    },
    {
      type: 'password',
      name: 'META_ACCESS_TOKEN',
      message: 'Meta Access Token (optional):',
    },
    {
      type: 'input',
      name: 'META_PHONE_NUMBER_ID',
      message: 'WhatsApp Phone Number ID (optional):'
    }
  ]);

  return answers;
}
