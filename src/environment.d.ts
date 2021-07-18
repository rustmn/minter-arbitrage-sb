declare global {
  namespace NodeJS {
    interface processEnv {
      NODE_ENV: 'development' | 'production'
      DB_USER: string
      DB_PASS: string
      DB_USER_DEV: string
      DB_PASS_DEV: string
    }
  }
}