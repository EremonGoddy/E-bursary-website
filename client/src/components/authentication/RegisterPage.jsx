import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import "./Authentication.css";

const RegisterPage = () => {
const [formData, setFormData] = useState({
name: '',
email: '',
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
.catch((err) => alert(err.response.data));
};

const togglePasswordVisibility = () => {
setShowPassword((prevState) => !prevState);
};

return (
<div className="flex items-center justify-center min-h-screen">
<div className="bg-white rounded-lg p-8 w-11/12 max-w-md shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
<h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Sign Up</h2>
<form onSubmit={handleSubmit}>
<div className="mb-4">
<label className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Full Name</label>
<input
type="text"
className="w-full px-4 py-2 border text-[1rem] md:text-[1.1rem]  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
value={formData.name}
onChange={(e) => setFormData({ ...formData, name: e.target.value })}
placeholder="Enter your full name"
/>
{errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
</div>

<div className="mb-4">
<label className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Email</label>
<input
type="email"
className="w-full px-4 py-2 border text-[1rem] md:text-[1.1rem]  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
value={formData.email}
onChange={(e) => setFormData({ ...formData, email: e.target.value })}
placeholder="Enter your email"
/>
{errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
</div>

<div className="mb-4 relative">
<label className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Password</label>
<input
type={showPassword ? 'text' : 'password'}
className="w-full px-4 py-2 border text-[1rem] md:text-[1.1rem]  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
value={formData.password}
onChange={(e) => setFormData({ ...formData, password: e.target.value })}
placeholder="Enter your password"
/>
{errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
</div>

<div className="mb-4 relative">
<label className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Confirm Password</label>
<input
type={showPassword ? 'text' : 'password'}
className="w-full px-4 py-2 border text-[1rem] md:text-[1.1rem]  border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
value={formData.confirmPassword}
onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
placeholder="Confirm your password"
/>
<span
className="text-[1.4rem] md:text-[1.6rem] mt-7 md:mt-7 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-gray-500"
onClick={togglePasswordVisibility}>
<FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
</span>
{errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
</div>

<div className="mb-4 flex items-center justify-center">
<input
type="checkbox"
id="terms"
className="h-4 w-4 md:h-4.5 md:w-4.5 text-gray-600 border-gray-300 rounded "
checked={isTermsAccepted}
onChange={(e) => setIsTermsAccepted(e.target.checked)}
  />
  <label htmlFor="terms" className="ml-2 text-[1rem] md:text-[1.1rem] text-gray-700">
    I agree with terms and conditions
  </label>
</div>

<button
type="submit"
className="text-[1rem] md:text-[1.1rem] w-full text-white  py-2 rounded-lg bg-gray-900 hover:bg-gray-700 cursor-pointer  transition"
>
Register
</button>

<div className="text-center mt-4">
<span className="text-[1rem] md:text-[1.1rem] text-gray-600">Already have an account? </span>
<Link to="/login" className="text-[1rem] md:text-[1.1rem]  text-blue-600 hover:text-blue-800">
Sign in
</Link>
</div>
</form>
</div>
</div>
);
};

export default RegisterPage;