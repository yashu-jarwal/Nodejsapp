// otp.js
const twilio = require('twilio');

const accountSid = '';
const authToken = '';
const client = new twilio(accountSid, authToken);

let otpStore = {}; // temporary in-memory storage

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const sendOTP = async (mobileNumber) => {
  const otp = generateOTP();
  otpStore[mobileNumber] = otp;

  await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: 'YOUR_TWILIO_PHONE_NUMBER',
    to: `+91${mobileNumber}`
  });
  
  console.log('OTP sent to:', mobileNumber);
  return otp;
};

const verifyOTP = (mobileNumber, enteredOtp) => {
  const storedOtp = otpStore[mobileNumber];
  if (storedOtp && storedOtp == enteredOtp) {
    delete otpStore[mobileNumber];
    return true;
  } else {
    return false;
  }
};

// Export functions
module.exports = {
  sendOTP,
  verifyOTP
};
