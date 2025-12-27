// ============================================
// packages/cli/src/commands/doctor.ts
// ============================================
import * as dotenv from 'dotenv';
import axios from 'axios';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export async function doctorCommand() {
  logger.header('🩺 Meta SDK Doctor Report');

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check Node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
  
  if (majorVersion >= 18) {
    logger.success(`Node version: ${nodeVersion}`);
  } else {
    logger.error(`Node version: ${nodeVersion} (minimum required: v18.0.0)`);
    issues.push('Upgrade Node.js to v18 or higher');
  }

  // Check SDK version
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const metaDeps = Object.keys(packageJson.dependencies || {}).filter(dep => 
      dep.startsWith('@sndp/meta-')
    );

    if (metaDeps.length > 0) {
      logger.success(`SDK packages installed: ${metaDeps.length}`);
    } else {
      logger.warning('No Meta SDK packages found');
      warnings.push('Install Meta SDK packages using: npm install @sndp/meta-core');
    }
  } catch (error) {
    logger.warning('Could not read package.json');
  }

  // Check .env file
  logger.section('\n📋 Environment Variables:');
  
  const envVars = [
    'META_APP_ID',
    'META_APP_SECRET',
    'META_ACCESS_TOKEN',
    'META_PHONE_NUMBER_ID',
    'META_WEBHOOK_VERIFY_TOKEN',
    'META_BUSINESS_ACCOUNT_ID'
  ];

  envVars.forEach(varName => {
    if (process.env[varName]) {
      logger.success(`${varName} ✓`);
    } else {
      logger.warning(`${varName} ✗`);
      warnings.push(`Add ${varName} to your .env file`);
    }
  });

  // Check Meta API connectivity
  logger.section('\n🌐 Meta API Connectivity:');
  
  const accessToken = process.env.META_ACCESS_TOKEN;
  
  if (accessToken) {
    const spinner = logger.spinner('Testing Meta Graph API...');
    
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: { access_token: accessToken },
        timeout: 10000
      });
      
      spinner.succeed('Meta Graph API connection successful');
      logger.info(`Connected as: ${response.data.name}`);
      
      // Check token permissions
      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      
      if (appId && appSecret) {
        try {
          const debugResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
            params: {
              input_token: accessToken,
              access_token: `${appId}|${appSecret}`
            }
          });
          
          const tokenData = debugResponse.data.data;
          const scopes = tokenData.scopes || [];
          
          // Required permissions
          const requiredPermissions = [
            'whatsapp_business_messaging',
            'whatsapp_business_management',
            'pages_show_list',
            'pages_read_engagement',
            'instagram_basic',
            'instagram_content_publish'
          ];
          
          logger.section('\n🔐 Permissions Check:');
          
          requiredPermissions.forEach(permission => {
            if (scopes.includes(permission)) {
              logger.success(`${permission} ✅`);
            } else {
              logger.warning(`${permission} ❌`);
              warnings.push(`Permission missing: ${permission}`);
            }
          });
          
          // Check token expiration
          if (tokenData.expires_at) {
            const expiresAt = new Date(tokenData.expires_at * 1000);
            const now = new Date();
            const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
              logger.error('Access token has expired');
              issues.push('Token expired - please re-authenticate');
            } else if (daysUntilExpiry < 7) {
              logger.warning(`Token expires in ${daysUntilExpiry} days`);
              warnings.push('Consider refreshing your token soon');
            } else {
              logger.success(`Token valid for ${daysUntilExpiry} more days`);
            }
          }
          
        } catch (error) {
          logger.warning('Could not debug token');
        }
      }
      
    } catch (error: any) {
      spinner.fail('Meta Graph API connection failed');
      
      if (error.code === 'ECONNABORTED') {
        issues.push('Connection timeout - check your internet connection');
      } else if (error.response?.data?.error) {
        issues.push(`API Error: ${error.response.data.error.message}`);
      } else {
        issues.push(`Network error: ${error.message}`);
      }
    }
  } else {
    logger.error('Access token not configured');
    issues.push('Add META_ACCESS_TOKEN to .env file');
  }

  // Check WhatsApp setup
  logger.section('\n📲 WhatsApp Configuration:');
  
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID;
  
  if (phoneNumberId) {
    logger.success('Phone Number ID configured');
    
    if (accessToken) {
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${phoneNumberId}`,
          { params: { access_token: accessToken } }
        );
        
        logger.success(`Phone Number: ${response.data.display_phone_number}`);
        logger.info(`Quality Rating: ${response.data.quality_rating || 'N/A'}`);
      } catch (error) {
        logger.warning('Could not verify phone number');
      }
    }
  } else {
    logger.warning('Phone Number ID not configured');
    warnings.push('Add META_PHONE_NUMBER_ID for WhatsApp features');
  }
  
  if (businessAccountId) {
    logger.success('Business Account ID configured');
  } else {
    logger.warning('Business Account ID not configured');
  }

  // Check webhook configuration
  logger.section('\n🔔 Webhook Configuration:');
  
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  const webhookUrl = process.env.META_WEBHOOK_URL;
  
  if (verifyToken) {
    logger.success('Webhook verify token configured');
  } else {
    logger.warning('Webhook verify token not configured');
    warnings.push('Add META_WEBHOOK_VERIFY_TOKEN for webhooks');
  }
  
  if (webhookUrl) {
    logger.success(`Webhook URL: ${webhookUrl}`);
    
    // Check if URL is accessible
    if (webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1')) {
      logger.warning('Webhook URL is localhost - use ngrok for testing');
      warnings.push('Use ngrok or similar tool to expose localhost webhooks');
    }
  } else {
    logger.warning('Webhook URL not configured');
  }

  // Check for common configuration files
  logger.section('\n📁 Project Files:');
  
  const files = [
    { name: '.env', required: true },
    { name: '.env.example', required: false },
    { name: 'package.json', required: true },
    { name: 'tsconfig.json', required: false },
    { name: 'next.config.js', required: false },
    { name: 'next.config.mjs', required: false }
  ];
  
  files.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file.name));
    if (exists) {
      logger.success(`${file.name} ✓`);
    } else if (file.required) {
      logger.error(`${file.name} ✗ (required)`);
      issues.push(`Create ${file.name} file`);
    } else {
      logger.info(`${file.name} ✗ (optional)`);
    }
  });

  // Check TypeScript configuration
  if (fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))) {
    logger.section('\n⚙️  TypeScript Configuration:');
    
    try {
      const tsconfig = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf-8')
      );
      
      if (tsconfig.compilerOptions?.strict) {
        logger.success('Strict mode enabled (recommended)');
      } else {
        logger.warning('Strict mode disabled');
        warnings.push('Enable strict mode in tsconfig.json for better type safety');
      }
      
      if (tsconfig.compilerOptions?.esModuleInterop) {
        logger.success('esModuleInterop enabled');
      } else {
        logger.warning('esModuleInterop disabled');
      }
      
    } catch (error) {
      logger.warning('Could not parse tsconfig.json');
    }
  }

  // Security checks
  logger.section('\n🔒 Security:');
  
  const gitignore = fs.existsSync(path.join(process.cwd(), '.gitignore'));
  if (gitignore) {
    const content = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf-8');
    if (content.includes('.env')) {
      logger.success('.env file is in .gitignore');
    } else {
      logger.error('.env file NOT in .gitignore');
      issues.push('Add .env to .gitignore to prevent exposing secrets');
    }
  } else {
    logger.warning('.gitignore file not found');
    warnings.push('Create .gitignore and add .env to it');
  }

  // Performance recommendations
  logger.section('\n⚡ Performance:');
  
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    // Check for connection pooling
    if (packageJson.dependencies?.['axios']) {
      logger.info('Using axios (built-in connection pooling)');
    }
    
    // Check for caching solutions
    const hasCaching = packageJson.dependencies?.['redis'] || 
                       packageJson.dependencies?.['node-cache'];
    
    if (hasCaching) {
      logger.success('Caching solution detected');
    } else {
      logger.info('No caching solution found (optional)');
      warnings.push('Consider adding Redis or node-cache for better performance');
    }
    
  } catch (error) {
    // Ignore
  }

  // Summary
  logger.section('\n📊 Summary:');
  
  if (issues.length === 0 && warnings.length === 0) {
    logger.success('🎉 Everything looks great! Your setup is ready to go.');
  } else {
    if (issues.length > 0) {
      logger.error(`\n❌ ${issues.length} Critical Issue(s) Found:`);
      issues.forEach((issue, index) => {
        logger.error(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (warnings.length > 0) {
      logger.warning(`\n⚠️  ${warnings.length} Warning(s):`);
      warnings.forEach((warning, index) => {
        logger.warning(`  ${index + 1}. ${warning}`);
      });
    }
  }

  // Suggestions
  if (issues.length > 0 || warnings.length > 0) {
    logger.section('\n💡 Suggestions:');
    
    if (issues.some(i => i.includes('token'))) {
      logger.suggestion('Get credentials from: https://developers.facebook.com/apps');
    }
    
    if (warnings.some(w => w.includes('permission'))) {
      logger.suggestion('Request permissions in App Review at: https://developers.facebook.com/apps');
    }
    
    if (warnings.some(w => w.includes('WhatsApp'))) {
      logger.suggestion('Setup WhatsApp Business at: https://business.facebook.com/wa/manage/home');
    }
    
    if (warnings.some(w => w.includes('webhook'))) {
      logger.suggestion('Configure webhooks in your Meta App Dashboard');
    }
  }

  // Exit code
  if (issues.length > 0) {
    process.exit(1);
  }
}
