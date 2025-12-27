// ============================================
// packages/cli/src/utils/logger.ts
// ============================================
import chalk from 'chalk';
import boxen from 'boxen';
import logSymbols from 'log-symbols';
import ora, { Ora } from 'ora';

export function showWelcome() {
  const message = chalk.bold.cyan(`
    🚀 Welcome to SNDP Meta SDK
    Build Facebook, Instagram & WhatsApp apps
  `);

  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    })
  );
}

export const logger = {
  success: (message: string) => {
    console.log(`${logSymbols.success} ${chalk.green(message)}`);
  },
  
  error: (message: string) => {
    console.log(`${logSymbols.error} ${chalk.red(message)}`);
  },
  
  warning: (message: string) => {
    console.log(`${logSymbols.warning} ${chalk.yellow(message)}`);
  },
  
  info: (message: string) => {
    console.log(`${logSymbols.info} ${chalk.blue(message)}`);
  },

  spinner: (message: string): Ora => {
    return ora(message).start();
  },

  header: (title: string) => {
    console.log('\n' + chalk.bold.cyan(`${title}\n`));
  },

  section: (title: string) => {
    console.log('\n' + chalk.bold.white(title));
  },

  suggestion: (message: string) => {
    console.log(chalk.dim(`→ ${message}`));
  }
};