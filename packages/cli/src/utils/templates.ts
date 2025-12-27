// ============================================
// packages/cli/src/utils/templates.ts
// ============================================
import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectConfig } from '../types';

export class TemplateGenerator {
  constructor(private config: ProjectConfig) {}

  async generate(targetDir: string) {
    const templateDir = this.getTemplateDir();
    
    // Copy base template
    await fs.copy(templateDir, targetDir);

    // Generate package.json
    await this.generatePackageJson(targetDir);

    // Generate .env.example
    if (this.config.generateEnv) {
      await this.generateEnvFile(targetDir);
    }

    // Generate example files
    await this.generateExamples(targetDir);
  }

  private getTemplateDir(): string {
    const baseDir = path.join(__dirname, '../../templates');
    
    if (this.config.framework === 'nextjs') {
      return path.join(baseDir, 'nextjs', this.config.language);
    } else if (this.config.framework === 'react') {
      return path.join(baseDir, 'react', this.config.language);
    } else {
      return path.join(baseDir, 'nodejs', this.config.language);
    }
  }

  private async generatePackageJson(targetDir: string) {
    const dependencies: Record<string, string> = {};

    if (this.config.modules.auth) {
      dependencies['@sndp/meta-auth-client'] = '^1.0.0';
      dependencies['@sndp/meta-auth-server'] = '^1.0.0';
    }

    if (this.config.modules.whatsapp) {
      dependencies['@sndp/meta-whatsapp'] = '^1.0.0';
    }

    if (this.config.modules.instagram) {
      dependencies['@sndp/meta-instagram'] = '^1.0.0';
      dependencies['@sndp/meta-pages'] = '^1.0.0';
    }

    const packageJson = {
      name: 'meta-sdk-app',
      version: '1.0.0',
      scripts: this.getScripts(),
      dependencies: {
        ...dependencies,
        '@sndp/meta-core': '^1.0.0'
      },
      devDependencies: this.getDevDependencies()
    };

    await fs.writeJSON(
      path.join(targetDir, 'package.json'),
      packageJson,
      { spaces: 2 }
    );
  }

  private getScripts(): Record<string, string> {
    if (this.config.framework === 'nextjs') {
      return {
        dev: 'next dev',
        build: 'next build',
        start: 'next start'
      };
    } else if (this.config.framework === 'react') {
      return {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      };
    } else {
      return {
        dev: this.config.language === 'typescript' ? 'ts-node src/index.ts' : 'node src/index.js',
        build: this.config.language === 'typescript' ? 'tsc' : 'echo "No build needed"',
        start: 'node dist/index.js'
      };
    }
  }

  private getDevDependencies(): Record<string, string> {
    const deps: Record<string, string> = {};

    if (this.config.language === 'typescript') {
      deps['typescript'] = '^5.3.0';
      deps['@types/node'] = '^20.0.0';
    }

    if (this.config.framework === 'nextjs') {
      deps['next'] = '^14.0.0';
      deps['react'] = '^18.0.0';
      deps['react-dom'] = '^18.0.0';
    } else if (this.config.framework === 'react') {
      deps['vite'] = '^5.0.0';
      deps['react'] = '^18.0.0';
      deps['react-dom'] = '^18.0.0';
    } else if (this.config.framework === 'express') {
      deps['express'] = '^4.18.0';
      deps['@types/express'] = '^4.17.0';
    }

    return deps;
  }

  private async generateEnvFile(targetDir: string) {
    const envContent: string[] = [
      '# Meta App Configuration',
      'META_APP_ID=your_app_id_here',
      'META_APP_SECRET=your_app_secret_here',
      'META_ACCESS_TOKEN=your_access_token_here',
      ''
    ];

    if (this.config.modules.whatsapp) {
      envContent.push(
        '# WhatsApp Configuration',
        'META_PHONE_NUMBER_ID=your_phone_number_id_here',
        'META_BUSINESS_ACCOUNT_ID=your_business_account_id_here',
        ''
      );
    }

    if (this.config.webhookSupport) {
      envContent.push(
        '# Webhook Configuration',
        'META_WEBHOOK_VERIFY_TOKEN=your_verify_token_here',
        'META_WEBHOOK_URL=https://your-domain.com/api/webhook',
        ''
      );
    }

    await fs.writeFile(
      path.join(targetDir, '.env.example'),
      envContent.join('\n')
    );
  }

  private async generateExamples(targetDir: string) {
    const examplesDir = path.join(targetDir, 'examples');
    await fs.ensureDir(examplesDir);

    if (this.config.modules.whatsapp) {
      await this.generateWhatsAppExample(examplesDir);
    }

    if (this.config.modules.auth) {
      await this.generateAuthExample(examplesDir);
    }
  }

  private async generateWhatsAppExample(examplesDir: string) {
    const ext = this.config.language === 'typescript' ? 'ts' : 'js';
    
    const content = this.config.language === 'typescript' ? `
import { WhatsAppClient } from '@sndp/meta-whatsapp';

const wa = new WhatsAppClient({
  accessToken: process.env.META_ACCESS_TOKEN!,
  phoneNumberId: process.env.META_PHONE_NUMBER_ID!
});

async function sendMessage() {
  try {
    // Send text message
    const response = await wa.sendText('8801712345678', 'Hello from Meta SDK!');
    console.log('Message sent:', response.messages[0].id);

    // Send image
    await wa.sendImage(
      '8801712345678',
      'https://example.com/image.jpg',
      'Check this out!'
    );

    // Send template
    await wa.template.send('8801712345678', {
      name: 'hello_world',
      language: 'en_US'
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

sendMessage();
` : `
const { WhatsAppClient } = require('@sndp/meta-whatsapp');

const wa = new WhatsAppClient({
  accessToken: process.env.META_ACCESS_TOKEN,
  phoneNumberId: process.env.META_PHONE_NUMBER_ID
});

async function sendMessage() {
  try {
    // Send text message
    const response = await wa.sendText('8801712345678', 'Hello from Meta SDK!');
    console.log('Message sent:', response.messages[0].id);

    // Send image
    await wa.sendImage(
      '8801712345678',
      'https://example.com/image.jpg',
      'Check this out!'
    );

  } catch (error) {
    console.error('Error:', error);
  }
}

sendMessage();
`;

    await fs.writeFile(path.join(examplesDir, `whatsapp-example.${ext}`), content.trim());
  }

  private async generateAuthExample(examplesDir: string) {
    const ext = this.config.language === 'typescript' ? 'tsx' : 'jsx';
    
    const content = `
import { createFacebookLogin } from '@sndp/meta-auth-client';

const { loginWithPopup, logout } = createFacebookLogin({
  appId: process.env.NEXT_PUBLIC_META_APP_ID${this.config.language === 'typescript' ? '!' : ''},
  scopes: ['email', 'public_profile', 'whatsapp_business_messaging']
});

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      const result = await loginWithPopup();
      console.log('Login successful:', result);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button onClick={handleLogin}>
      Login with Facebook
    </button>
  );
}
`;

    await fs.writeFile(path.join(examplesDir, `auth-example.${ext}`), content.trim());
  }
}
