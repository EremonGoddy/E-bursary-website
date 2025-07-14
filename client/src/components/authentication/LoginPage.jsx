import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const LoginPage = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const navigate = useNavigate();

const handleSubmit = (e) => {
e.preventDefault();
const newErrors = {};
if (!email) newErrors.email = '*Please provide an email';
    if (!password) newErrors.password = '*Please provide a password';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    axios
      .post('https://e-bursary-backend.onrender.com/api/signin', { email, password })
      .then((response) => {
        const { token, student, role, name } = response.data;
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('authToken', token);
        storage.setItem('student', JSON.stringify(student));
        storage.setItem('userName', name);
        storage.setItem('userId', student?.user_id || '');

        if (role === 'Student') {
          axios
            .get(`https://e-bursary-backend.onrender.com/api/upload/status/${student?.user_id}`, {
              headers: { Authorization: token },
            })
            .then((uploadRes) => {
              const uploaded = uploadRes.data?.uploaded;
              storage.setItem('documentUploaded', uploaded ? 'true' : 'false');
              navigate('/studentdashboard');
            })
            .catch((err) => {
              console.error('Failed to fetch document status:', err);
              storage.setItem('documentUploaded', 'false');
              navigate('/studentdashboard');
            });
        } else if (role === 'Admin') {
          navigate('/admindashboard');
        } else if (role === 'Committee') {
          navigate('/committeedashboard');
        } else {
         toast.warning('Role not recognized');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        const message = err?.response?.data?.message || 'Login failed. Please try again.';
        toast.error(message); // Replaces alert
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
  <div className="flex items-center justify-center -mt-5 md:-mt-20 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
  <div className=" p-6 md:p-8 w-12/12 md:w-11/12 max-w-md backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
  <h2 className=" text-[#14213d] text-2xl md:text-3xl font-bold text-center mb-1">Welcome back</h2>

        <h2 className="text-2xl md:text-[1.8rem] text-[#14213d] font-bold text-center mb-6">Sign in</h2>
        <form onSubmit={handleSubmit}>
      <div className="mb-4">
  <label htmlFor="email" className="block text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold mb-1">
    Email
  </label>
  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
    <FontAwesomeIcon icon={faEnvelope} className="text-[#14213d] text-[1.3rem] mr-2" />
    <input
      type="email"
      id="email"
      name="email"
      className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your email"
    />
  </div>
  {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
</div>


<div className="mb-4 relative">
  <label htmlFor="password" className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">
    Password
  </label>
  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#14213d] px-3">
    <FontAwesomeIcon icon={faLock} className="text-[#14213d] text-[1.3rem]  mr-2" />
    <input
      type={showPassword ? 'text' : 'password'}
      id="password"
      name="password"
      className="w-full py-2 text-[1rem] md:text-[1.1rem] focus:outline-none"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
    />
    <span
      className="text-[1.2rem] md:text-[1.3rem] inline-flex items-center cursor-pointer text-[#14213d] ml-2"
      onClick={togglePasswordVisibility}
    >
      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
    </span>
  </div>
  {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
</div>


          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="h-4 w-4 md:h-4.5 md:w-4.5 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className="ml-2 text-[1rem] md:text-[1.1rem] text-[#14213d]">
                Remember me
              </label>
            </div>
            <Link to="/forgotpassword" className="text-[1rem] md:text-[1.1rem] text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="text-[1rem] md:text-[1.1rem] w-full text-white focus:ring-2 focus:ring-[#fca311] py-2 rounded-lg bg-[#14213d] hover:bg-gray-700 cursor-pointer transition"
          >
            Sign in
          </button>

          <div className="text-center mt-4">
            <span className="text-[1rem] md:text-[1.1rem] text-[#14213d]">Don't have an account? </span>
            <Link to="/register" className="text-[1rem] md:text-[1.1rem] text-blue-600 hover:text-blue-800">
              Create an Account
            </Link>
          </div>
        </form>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default LoginPage;
