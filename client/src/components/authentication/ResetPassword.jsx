import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const PasswordReset = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const contactValue = location.state?.contactValue || '';  // Get contactValue from navigation state

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!contactValue) {
      setErrorMessage('Missing user contact information. Please restart the process.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'https://e-bursary-backend.onrender.com/api/reset-password',
        { contactValue, newPassword }
      );

      if (response.status === 200) {
        setSuccessMessage('Password reset successfully. You can now log in.');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/login');  // Optional: Redirect to login after success
        }, 3000);
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Reset Password</h2>

        <div className="mb-4 relative">
          <label className="block mb-2 text-sm text-gray-700">New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
          </span>
        </div>

        <div className="mb-4 relative">
          <label className="block mb-2 text-sm text-gray-700">Confirm New Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
          </span>
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
