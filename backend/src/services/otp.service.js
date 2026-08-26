const otpModel = require('../models/otp.model');
const { generateOtp, getExpiryTime } = require('../utils/otpGenerator');
const { sendSmsViaVispl } = require('../utils/smsService'); // tera existing VISPL wala

exports.sendOtp = async (mobile) => {
  const otp = generateOtp();
  const expiresAt = getExpiryTime();

  await otpModel.saveOtp(mobile, otp, expiresAt);
  await sendSmsViaVispl(mobile, otp); // tera existing integration

  return { message: 'OTP sent successfully' };
};

exports.verifyOtp = async (mobile, otp) => {
  const record = await otpModel.findValidOtp(mobile, otp);
  
  if (!record) {
    const err = new Error('Invalid or expired OTP');
    err.statusCode = 400;
    throw err;
  }

  await otpModel.markVerified(mobile);
  return { message: 'OTP verified successfully' };
};