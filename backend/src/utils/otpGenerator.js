exports.generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

exports.getExpiryTime = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5); // 5 min validity
  return expiry;
};