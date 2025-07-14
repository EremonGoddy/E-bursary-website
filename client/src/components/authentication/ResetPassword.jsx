import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const PasswordReset = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const contactValue = location.state?.contactValue || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields.', {
        icon: <FontAwesomeIcon icon={faCircleExclamation} style={{ color: '#ffffff' }} />,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.', {
        icon: <FontAwesomeIcon icon={faCircleExclamation} style={{ color: '#ffffff' }} />,
      });
      return;
    }

    if (!contactValue) {
      toast.error('Missing user contact information. Please restart the process.', {
        icon: <FontAwesomeIcon icon={faCircleExclamation} style={{ color: '#ffffff' }} />,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://e-bursary-backend.onrender.com/api/reset-password', {
        contactValue,
        newPassword,
      });

      if (response.status === 200) {
        toast.success('Password reset successfully. You can now log in.', {
          icon: <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#00ff88' }} />,
        });
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || 'Failed to reset password.';
      toast.error(message, {
        icon: <FontAwesomeIcon icon={faCircleExclamation} style={{ color: '#ffffff' }} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="p-6 md:p-8 w-12/12 md:w-11/12 max-w-md backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
        <h2 className="text-[#14213d] text-2xl md:text-3xl font-bold text-center mb-6">Reset Password</h2>

        <div className="mb-4 relative">
          <label htmlFor="newPassword" className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">
            New Password
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
              placeholder="Enter new password"
            />
            <span className="text-[1.2rem] md:text-[1.3rem] text-[#14213d] ml-2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
          </div>
        </div>

        <div className="mb-4 relative">
          <label htmlFor="confirmPassword" className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">
            Confirm Password
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
              placeholder="Confirm new password"
            />
            <span className="text-[1.2rem] md:text-[1.3rem] text-[#14213d] ml-2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
            </span>
          </div>
        </div>

        <button
          onClick={handlePasswordReset}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold text-[1rem] md:text-[1.1rem] ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#14213d] hover:bg-gray-700'
          }`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default PasswordReset;
