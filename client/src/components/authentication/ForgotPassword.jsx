// ForgotPassword.jsx

import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!email) {
      alert('Please enter your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://e-bursary-backend.onrender.com/api/send-otp', { email });
      if (response.status === 200) {
        setOtpSent(true);
        alert('OTP has been sent to your email.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Forgot Password</h2>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Enter your registered email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSendOTP}
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>

        {otpSent && (
          <div className="mt-4 text-green-600 text-sm">
            OTP has been sent to your email.
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 text-sm">
            {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
