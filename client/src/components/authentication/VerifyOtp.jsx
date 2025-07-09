import React, { useState } from 'react';
import axios from 'axios';

const OTPVerification = () => {
  const [contactMethod, setContactMethod] = useState('email'); // or 'phone' if using phone
  const [contactValue, setContactValue] = useState(''); // email or phone number value
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerifyOTP = async () => {
    if (!otp || (!contactValue)) {
      setError('Please provide both contact information and OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = { otp };
      if (contactMethod === 'email') {
        payload.email = contactValue;
      } else {
        payload.phoneNumber = contactValue;
      }

      const response = await axios.post('https://e-bursary-backend.onrender.com/api/verify-otp', payload);

      if (response.status === 200) {
        setMessage('OTP Verified Successfully.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Verify OTP</h2>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Your Email or Phone Number</label>
          <input
            type="text"
            placeholder="Enter email or phone"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Enter OTP</label>
          <input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        {message && <div className="mt-4 text-green-600 text-sm text-center">{message}</div>}
        {error && <div className="mt-4 text-red-600 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
};

export default OTPVerification;
