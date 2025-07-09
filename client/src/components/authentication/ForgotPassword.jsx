import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [contactMethod, setContactMethod] = useState('email');
  const [contactValue, setContactValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpExpireTimer, setOtpExpireTimer] = useState(null);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const handleSendOTP = async () => {
    if (!contactValue) {
      alert(`Please enter your ${contactMethod === 'email' ? 'email' : 'phone number'}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = contactMethod === 'email' ? { email: contactValue } : { phoneNumber: contactValue };
      const response = await axios.post('https://e-bursary-backend.onrender.com/api/send-otp', payload);

      if (response.status === 200) {
        setOtpSent(true);
        setIsOtpExpired(false);
        alert(`OTP has been sent to your ${contactMethod === 'email' ? 'email' : 'phone number'}.`);

        if (otpExpireTimer) {
          clearInterval(otpExpireTimer);
        }

        setRemainingTime(5 * 60); // 5 minutes in seconds

        const timer = setInterval(() => {
          setRemainingTime(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsOtpExpired(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setOtpExpireTimer(timer);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (otpExpireTimer) {
        clearInterval(otpExpireTimer);
      }
    };
  }, [otpExpireTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Forgot Password</h2>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Choose where to receive OTP:</label>
          <select
            value={contactMethod}
            onChange={(e) => {
              setContactMethod(e.target.value);
              setContactValue('');
              setOtpSent(false);
              setError('');
              setIsOtpExpired(false);
              setRemainingTime(0);
              if (otpExpireTimer) clearInterval(otpExpireTimer);
            }}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="email">Email</option>
            <option value="phone">Phone Number</option>
          </select>
        </div>

        <div className="mb-4">
          <input
            type={contactMethod === 'email' ? 'email' : 'text'}
            placeholder={contactMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSendOTP}
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Sending OTP...' : otpSent && isOtpExpired ? 'Resend OTP' : 'Send OTP'}
        </button>

        {otpSent && remainingTime > 0 && !isOtpExpired && (
          <div className="mt-4 text-sm text-gray-600">
            OTP expires in: <span className="font-semibold">{formatTime(remainingTime)}</span>
          </div>
        )}

        {otpSent && !isOtpExpired && (
          <div className="mt-2 text-green-600 text-sm">
            OTP has been sent to your {contactMethod === 'email' ? 'email' : 'phone number'}.
          </div>
        )}

        {isOtpExpired && (
          <div className="mt-2 text-yellow-600 text-sm">
            OTP expired. Please click "Resend OTP".
          </div>
        )}

        {error && (
          <div className="mt-2 text-red-600 text-sm">
            {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
