import chalk from 'chalk';

export function logIOS(message: string) {
    // eslint-disable-next-line no-console
    console.log('🍎', chalk.bold.blue(message));
}

export function logIOSAlt(message: string) {
    // eslint-disable-next-line no-console
    console.log('📱', chalk.bold.cyan(message));
}

export function logAndroid(message: string) {
    // eslint-disable-next-line no-console
    console.log('🤖', chalk.bold.green(message));
}

export function logError(message: string) {
    // eslint-disable-next-line no-console
    console.log('💥', chalk.bold.red(message));
}
