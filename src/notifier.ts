import chalk from 'chalk';

const config = {
  info: {
    message: '[INFO]',
    color: 'blue'
  },
  error: {
    message: '[ERROR]',
    color: 'red'
  },
  warn: {
    message: '[WARN]',
    color: 'yellow'
  },
  success: {
    message: '[SUCCESS]',
    color: 'green'
  }
};

export default function notifier({
  message,
  type,
}: {
  message: string,
  type: 'info' | 'error' | 'warn' | 'success'
}) {

  console.log(
    //@ts-ignore
    chalk[config[type].color](`${config[type].message} ${message}`)
  );
}