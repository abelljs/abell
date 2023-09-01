import { createLogger } from 'vite';

const reset = '\u001b[0m';
const blueColorCode = '\u001b[34m';
export const bold = (message: string): string => `\u001b[1m${message}${reset}`;
const blue = (message: string) => `${blueColorCode}${message}${reset}`;
const grey = (message: string) => `\u001b[90m${message}${reset}`;
const underline = (message: string) => `\u001b[4m${message}${reset}`;

export const boldUnderline = (message: string): string =>
  bold(underline(message));

// VSCode's integrated terminal has some strange word spacing so we remove the space between icon and text in it
const terminalSpace = process.env.TERM_PROGRAM === 'vscode' ? '' : ' ';
const PREFIX = reset + bold(`🌀${terminalSpace}Abell ${terminalSpace}‣`);
export const viteCustomLogger = createLogger('info', {
  prefix: PREFIX
});

const loggerInfo = viteCustomLogger.info;
viteCustomLogger.info = (msg, options) => {
  if (msg.includes('building SSR bundle')) return;

  // Replacing colors in terminal with blue color for Abell theme
  loggerInfo(
    msg.replace(/\u001b\[3[0-6]m/g, blueColorCode).replaceAll('vite', 'Vite'),
    options
  );
};

export const log = (message: string, importance: 'p0' | 'p1' = 'p0'): void => {
  if (importance === 'p1') {
    console.log(blue('‣'), grey(message));
  } else {
    console.log('');
    console.log(PREFIX, message);
    console.log('');
  }
};
