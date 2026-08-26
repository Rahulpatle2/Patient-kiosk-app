const axios = require('axios'); // npm install axios agar nahi hai
const { otp: otpConfig } = require('../config/env');

exports.sendSmsViaVispl = async (mobile, otp) => {
 console.log(otp)
 const message = `Dear Customer, ${otp} is your OTP to authenticate your mobile number on LIVWAY.`;

const uri = `https://pgapi.vispl.in/fe/api/v1/send?username=${encodeURIComponent(otpConfig.username)}&password=${encodeURIComponent(otpConfig.password)}&unicode=false&from=${encodeURIComponent(otpConfig.from)}&to=${encodeURIComponent(mobile)}&dltContentId=${encodeURIComponent(otpConfig.dltContentId)}&dltPrincipalEntityId=${encodeURIComponent(otpConfig.dltPrincipalEntityId)}&text=${message}`;
console.log(uri)
  try {
  const response = await axios.get(uri);
  console.log('VISPL Response:', response.data); // ye add kar
  console.log('VISPL Status:', response.status);
  return response.data;
} catch (err) {
  console.error('SMS sending failed:', err.message);
  console.error('Full error:', err.response?.data); // ye bhi add kar
  const error = new Error('Failed to send OTP SMS');
  error.statusCode = 502;
  throw error;
}
};