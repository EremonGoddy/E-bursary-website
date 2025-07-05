import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
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

        // Clear both storages before saving new session
        sessionStorage.clear();
        localStorage.clear();

        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('authToken', token);
        storage.setItem('student', JSON.stringify(student));
        storage.setItem('userName', name);

        if (role === 'Student') navigate('/studentdashboard');
        else if (role === 'Admin') navigate('/admindashboard');
        else if (role === 'Committee') navigate('/committeedashboard');
        else alert('Role not recognized');
      })
      .catch((err) => alert(err.response?.data?.message || 'Login failed.'));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg p-8 w-11/12 max-w-md shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Sign in</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 border text-[1rem] md:text-[1.1rem] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className="w-full px-4 py-2 border text-[1rem] md:text-[1.1rem] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <span
              className="text-[1.4rem] md:text-[1.6rem] mt-7 md:mt-7 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-gray-500"
              onClick={togglePasswordVisibility}
              style={{ display: 'inline-flex', width: 'auto', padding: '0.5rem' }}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </span>
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
              <label htmlFor="rememberMe" className="ml-2 text-[1rem] md:text-[1.1rem] text-gray-700">Remember me</label>
            </div>
            <Link to="/forgotpassword" className="text-[1rem] md:text-[1.1rem] text-blue-600 hover:text-blue-800">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="text-[1rem] md:text-[1.1rem] w-full text-white focus:ring-2 focus:ring-blue-600 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 cursor-pointer transition"
          >
            Sign in
          </button>

          <div className="text-center mt-4">
            <span className="text-[1rem] md:text-[1.1rem] text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-[1rem] md:text-[1.1rem] text-blue-600 hover:text-blue-800">Create an Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
