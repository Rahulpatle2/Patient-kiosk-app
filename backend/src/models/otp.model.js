const db = require('../config/db');

exports.saveOtp = async (mobile, otp, expiresAt) => {
  // purana OTP hoga to delete karke naya dalenge (clean approach)
  await db.query('DELETE FROM otp_verification WHERE mobile = ?', [mobile]);
  
  const [result] = await db.query(
    'INSERT INTO otp_verification (mobile, otp, expires_at) VALUES (?, ?, ?)',
    [mobile, otp, expiresAt]
  );
  return result.insertId;
};

exports.findValidOtp = async (mobile, otp) => {
  const [rows] = await db.query(
    `SELECT * FROM otp_verification 
     WHERE mobile = ? AND otp = ? AND is_verified = FALSE AND expires_at > NOW()`,
    [mobile, otp]
  );
  return rows[0];
};

exports.markVerified = async (mobile) => {
  await db.query(
    'UPDATE otp_verification SET is_verified = TRUE WHERE mobile = ?',
    [mobile]
  );
};