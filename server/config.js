require('dotenv').config()

const development = {
  databaseURL: 'postgres:///cv_db',
  clientURL: 'http://localhost:5000',
  env: 'local',
  auth_id: process.env.AUTH_ID,
  auth_secret: process.env.AUTH_SECRET,
  login_domains: process.env.ALLOWED_LOGIN_DOMAINS,
  update_pdf_from_fs: process.env.UPDATE_PDF_FROM_FS || 1,
}
const production = {
  databaseURL: process.env.DATABASE_URL,
  clientURL: process.env.CLIENT_URL,
  env: 'production',
  auth_id: process.env.AUTH_ID,
  auth_secret: process.env.AUTH_SECRET,
  login_domains: process.env.ALLOWED_LOGIN_DOMAINS,
  update_pdf_from_fs: process.env.UPDATE_PDF_FROM_FS || 1,
}

const test = {
  databaseURL: 'postgres:///cv_db_test',
  env: 'test',
  update_pdf_from_fs: 1,
}

console.log(`Running, config is: ${process.env.NODE_ENV}`)

switch (process.env.NODE_ENV) {
  case 'development':
    module.exports = development
    break

  case 'production':
    module.exports = production
    break

  case 'test':
    module.exports = test
    break

  default:
    module.exports = development
    break
}
