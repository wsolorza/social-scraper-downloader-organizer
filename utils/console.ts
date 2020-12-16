import chalk from "chalk";

export const consoleError = (text: string) => {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toUTCString()}] ${chalk.red(text)}`);
};

export const consoleInfo = (text: string) => {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toUTCString()}] ${text}`);
};
