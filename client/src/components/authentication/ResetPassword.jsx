import React, { useState } from 'react';
import axios from 'axios';

const PasswordReset = () => {
  const [contactValue, setContactValue] = useState('');  // Email or Phone (whichever was used)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!contactValue || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        newPassword,
        email: contactValue,   // or phoneNumber if you prefer
      };

      const response = await axios.post('https://e-bursary-backend.onrender.com/api/reset-password', payload);

      if (response.status === 200) {
        setSuccessMessage('Password reset successful. You can now log in.');
        setNewPassword('');
        setConfirmPassword('');
        setContactValue('');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Reset Password</h2>

        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-700">Your Email or Phone Number</label>
          <input
            type="text"
            placeholder="Enter your email or phone"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-700">New Password</label>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm text-gray-700">Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handlePasswordReset}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        {successMessage && <div className="mt-4 text-green-600 text-sm text-center">{successMessage}</div>}
        {errorMessage && <div className="mt-4 text-red-600 text-sm text-center">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default PasswordReset;
