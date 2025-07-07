import React, { useState } from 'react';

const ForgotPassword = () => {
  const [contactMethod, setContactMethod] = useState('email');
  const [contactValue, setContactValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleSendOTP = () => {
    if (!contactValue) {
      alert('Please enter your email or phone number.');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);

    console.log(`OTP sent to ${contactMethod === 'email' ? 'email' : 'phone'}:`, otp);
    alert(`OTP has been sent to your ${contactMethod}. (Simulated)`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Forgot Password</h2>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Choose where to receive OTP:</label>
          <select
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="email">Email</option>
            <option value="phone">Phone Number</option>
          </select>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder={contactMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSendOTP}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Send OTP
        </button>

        {otpSent && (
          <div className="mt-4 text-green-600 text-sm">
            OTP has been sent. (For demo: {generatedOtp})
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
