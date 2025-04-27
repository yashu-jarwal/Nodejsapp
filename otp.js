// otp.js
const twilio = require('twilio');

const accountSid = 'ACa0ca4526e0fa5360942806d8e1d17ee4';
const authToken = '85d91eb7f98bea5ea15f30982c87a4f5';
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
