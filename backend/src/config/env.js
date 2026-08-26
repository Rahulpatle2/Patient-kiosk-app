
require('dotenv').config();

module.exports = {
  otp: {
    username: process.env.OTP_GEN_USERNAME,
    password: process.env.OTP_GEN_PASSWORD,
    unicode: process.env.OTP_GEN_UNICODE,
    from: process.env.OTP_GEN_FROM,
    dltContentId: process.env.DLT_CONTENT_ID,
    dltPrincipalEntityId: process.env.DLT_PRINCIPAL_ENTITY_ID,
    apiUrl: process.env.VISPL_API_URL,
  },
  database:{
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }
};