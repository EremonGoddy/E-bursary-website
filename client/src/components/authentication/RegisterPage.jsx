import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
  });
  const [errors, setErrors] = useState({});
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = '*Please provide your full name';
    if (!formData.email) newErrors.email = '*Please provide an email';
    if (!formData.phoneNumber) newErrors.phoneNumber = '*Please provide a phone number';
    if (!formData.password) newErrors.password = '*Please provide a password';
    if (!formData.confirmPassword) newErrors.confirmPassword = '*Please confirm your password';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '*Passwords do not match';
    if (!isTermsAccepted) return alert('You must accept the terms and conditions.');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    axios
      .post('https://e-bursary-backend.onrender.com/api/post', formData)
      .then(() => {
        alert('Registration successful');
        navigate('/login');
      })
      .catch((err) => {
        let errorMsg = '';
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'object' && err.response.data.message) {
            errorMsg = err.response.data.message.toLowerCase();
          } else if (typeof err.response.data === 'object' && err.response.data.error) {
            errorMsg = err.response.data.error.toLowerCase();
          } else if (typeof err.response.data === 'string') {
            errorMsg = err.response.data.toLowerCase();
          } else if (Array.isArray(err.response.data) && err.response.data.length > 0) {
            errorMsg = String(err.response.data[0]).toLowerCase();
          }
        }
        if (errorMsg.includes('email')) {
          setErrors({ email: '*This email is already registered. Please use another.' });
        } else if (errorMsg.includes('name')) {
          setErrors({ name: '*This name is already registered. Please use another.' });
        } else if (errorMsg) {
          alert(errorMsg);
        } else {
          alert('An error occurred. Please try again.');
        }
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className=" p-6 md:p-8 w-12/12 md:w-11/12 max-w-md -mt-2 md:mt-0 backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
        <h2 className="text-[#14213d] text-2xl md:text-3xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">Full Name</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
              <FontAwesomeIcon icon={faUser} className="text-[#14213d] text-[1.3rem] mr-2" />
              <input
                type="text"
                className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
              <FontAwesomeIcon icon={faEnvelope} className="text-[#14213d] text-[1.3rem] mr-2" />
              <input
                type="email"
                className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">Phone Number</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
              <FontAwesomeIcon icon={faPhone} className="text-[#14213d] text-[1.3rem] mr-2" />
              <input
                type="text"
                className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phoneNumber && <div className="text-red-500 text-sm mt-1">{errors.phoneNumber}</div>}
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
              <FontAwesomeIcon icon={faLock} className="text-[#14213d] text-[1.3rem] mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="mb-4 relative">
            <label className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">Confirm Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
              <FontAwesomeIcon icon={faLock} className="text-[#14213d] text-[1.3rem] mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
              <span
                className="text-[1.2rem] md:text-[1.3rem] ml-2 inline-flex items-center cursor-pointer text-[#14213d]"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
            {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
          </div>

          {/* Terms and Conditions */}
          <div className="mb-4 flex items-center justify-center">
            <input
              type="checkbox"
              id="terms"
              className="h-4 w-4 text-gray-600 border-gray-300 rounded"
              checked={isTermsAccepted}
              onChange={(e) => setIsTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="ml-2 text-[1rem] md:text-[1.1rem] text-[#14213d]">
              I agree with terms and conditions
            </label>
          </div>

          <button
            type="submit"
            className="text-[1rem] md:text-[1.1rem] w-full text-white py-2 rounded-lg bg-[#14213d] hover:bg-gray-700 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[#fca311]"
          >
            Register
          </button>

          <div className="text-center mt-4">
            <span className="text-[1rem] md:text-[1.1rem] text-[#14213d]">Already have an account? </span>
            <Link to="/login" className="text-[1rem] md:text-[1.1rem] text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
