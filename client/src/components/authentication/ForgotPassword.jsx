import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setOtpSent(false);  // OTP expired, allow sending again
    }

    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendOTP = async () => {
    if (!contactValue) {
      alert('Please enter your email or phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = contactValue.includes('@') ? { email: contactValue } : { phoneNumber: contactValue };
      const response = await axios.post('https://e-bursary-backend.onrender.com/api/send-otp', payload);

      if (response.status === 200) {
        alert('OTP has been sent.');
        setOtpSent(true);
        setTimer(120); // 2-minute countdown
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      alert('Please enter the OTP.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const payload = contactValue.includes('@') ? { email: contactValue, otp } : { phoneNumber: contactValue, otp };
      const response = await axios.post('https://e-bursary-backend.onrender.com/api/verify-otp', payload);

      if (response.status === 200) {
        alert('OTP verified successfully.');
        navigate('/resetpassword', { state: { contactValue } });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid OTP or expired.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md p-6 backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Forgot Password</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter email or phone number"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSendOTP}
          disabled={loading || (!contactValue || otpSent)}
          className={`w-full py-3 rounded-lg text-white font-semibold ${loading || otpSent ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Sending OTP...' : otpSent ? 'OTP Sent' : 'Send OTP'}
        </button>

        {otpSent && (
          <div className="mt-2 text-sm text-gray-600 text-center">
            OTP expires in: <span className="font-semibold">{formatTime(timer)}</span>
          </div>
        )}

        <div className="mt-6 mb-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={verifying || !otp}
          className={`w-full py-3 rounded-lg text-white font-semibold ${verifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {verifying ? 'Verifying...' : 'Verify & Next'}
        </button>

        {error && <div className="mt-4 text-red-600 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;
