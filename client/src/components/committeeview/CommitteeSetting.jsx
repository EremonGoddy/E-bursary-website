import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faBars,
faHouse,
faUser,
faFileAlt,
faChartBar,
faCog,
faSignOutAlt,
faBell,
faEye,
faUsers,
faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';

const CommitteeSetting = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [committeeDetails, setCommitteeDetails] = useState({});
const navigate = useNavigate();
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [message, setMessage] = useState('');
const [userName, setUserName] = useState('');
const [isError, setIsError] = useState(false);

// State to manage visibility of password fields
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const toggleSidebar = () => setSidebarActive(!sidebarActive);

const handleChangePassword = async (e) => {
e.preventDefault();
setMessage('');
setIsError(false);

if (newPassword !== confirmPassword) {
setMessage('New password and confirmation do not match');
setIsError(true);
return;
}

const token = sessionStorage.getItem('authToken');
if (!token) {
setMessage('No authentication token found');
setIsError(true);
return;
}

try {
// Verify current password first
const verifyResponse = await axios.get('https://e-bursary-backend.onrender.com/api/verify-password', {
headers: { Authorization: `Bearer ${token}` },
params: { password: currentPassword },
});

if (verifyResponse.status === 200) {
// If current password is verified, proceed to change password
const response = await axios.post(
'https://e-bursary-backend.onrender.com/api/change-password',
{ currentPassword, newPassword },
{
headers: { Authorization: `Bearer ${token}` },
}
);
setMessage(response.data.message);
setIsError(false);
setCurrentPassword('');
setNewPassword('');
setConfirmPassword('');
}
} catch (error) {
const errorMessage = error.response?.data || 'Error updating password';
setMessage(errorMessage);
setIsError(true);
}
};

// Fetch profile data when component loads
useEffect(() => {
const token = sessionStorage.getItem('authToken');
const name = sessionStorage.getItem('userName');
if (!token) {
navigate('/signin');
} else {
setUserName(name);
axios
.get('https://e-bursary-backend.onrender.com/api/profile-committee', {
headers: { Authorization: `Bearer ${token}` },
})
.then((response) => {
setCommitteeDetails(response.data);
})
.catch((error) => {
console.error('Error fetching profile data:', error);
});
}
}, [navigate]);

const navItems = [
{ icon: faHouse, label: 'Dashboard', to: '/committeedashboard' },
{ icon: faUser, label: 'Profile', to: '/committeeprofile' },
{ icon: faUsers, label: 'Student Info', to: '/userdetails' },
{ icon: faBell, label: 'Analysis', to: '/committeereport' },
{ icon: faChartBar, label: 'Notification', to: '/committeereport' },
{ icon: faCog, label: 'Settings', to: '/committeesetting' },
{ icon: faSignOutAlt, label: 'Logout', isLogout: true }
];

return (
<div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
{/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-2.5 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
<div className="flex items-center space-x-1">
<h2 className="mr-1 md:mr-5 text-[1rem] md:text-[1.2rem] font-bold text-[#14213d]">
Welcome: {committeeDetails.name || userName}
</h2>
<div className="flex items-center space-x-2">
<img
src={
committeeDetails.gender === 'Female'
? '/images/woman.png'
: committeeDetails.gender === 'Male'
? '/images/patient.png'
: '/images/user.png'
}
alt="User"
className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-1 md:mr-0"
/>
</div>
<div className="block md:hidden">
<FontAwesomeIcon
icon={faBars}
className="text-[1.7rem] cursor-pointer text-[#14213d]"
onClick={toggleSidebar}
/>
</div>
</div>
</div>
</div>

<div className="flex flex-col md:flex-row pt-20 min-h-screen">
{/* Sidebar */}
<div
className={`
fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14
transition-all duration-100 ease-in-out
overflow-visible
${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[45px] md:p-2'}
`}
>
<div className="hidden md:flex justify-end mb-4">
<FontAwesomeIcon
icon={faBars}
className={`text-white cursor-pointer text-[1.5rem] ${sidebarActive ? 'ml-auto' : 'mr-2'}`}
onClick={toggleSidebar}
/>
</div>
<ul className="flex flex-col h-full mt-6 space-y-10">
{navItems.map((item, index) => (
<li className={`group relative ${item.isLogout ? 'mt-30 md:mt-45' : ''}`} key={index}>
{item.isLogout ? (
<a
href="#"
onClick={(e) => {
e.preventDefault();
const token = sessionStorage.getItem('authToken');
axios
.post('https://e-bursary-backend.onrender.com/api/logout', {}, {
headers: { Authorization: `Bearer ${token}` }
})
.catch(() => {})
.finally(() => {
sessionStorage.clear();
navigate('/');
});
}}
className={`flex items-center space-x-2 transition-all duration-200 ${
sidebarActive ? 'justify-start' : 'justify-center'
}`}
>
<FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
}`}
>
{item.label}
</span>
</a>
) : (
<Link
to={item.to}
className={`flex items-center space-x-2 transition-all duration-200 ${
sidebarActive ? 'justify-start' : 'justify-center'
}`}
>
<FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
}`}
>
{item.label}
</span>
</Link>
)}
{!sidebarActive && (
<span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[1.1rem] w-[120px] flex items-center justify-center z-50">
{item.label}
</span>
)}
</li>
))}
</ul>
</div>

{/* Main Content Area */}
<div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}
`}>
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-lg mx-auto  p-8  mt-10">
<h2 className="text-center text-2xl font-bold mb-6">Change Password</h2>
<form onSubmit={handleChangePassword}>
<div className="mb-5">
<label htmlFor="currentPassword" className="block mb-1 font-medium text-gray-700">
Current Password
</label>
<div className="relative">
<input
type={showCurrentPassword ? 'text' : 'password'}
id="currentPassword"
className="form-input w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
value={currentPassword}
placeholder="Enter Current password"
onChange={(e) => setCurrentPassword(e.target.value)}
required
/>
<span
className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
onClick={() => setShowCurrentPassword((prev) => !prev)}
>
<FontAwesomeIcon icon={showCurrentPassword ? faEye : faEyeSlash} />
</span>
</div>
</div>
<div className="mb-5">
<label htmlFor="newPassword" className="block mb-1 font-medium text-gray-700">
New Password
</label>
<div className="relative">
<input
type={showNewPassword ? 'text' : 'password'}
id="newPassword"
className="form-input w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
value={newPassword}
placeholder="Enter New password"
onChange={(e) => setNewPassword(e.target.value)}
required
/>
<span
className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
onClick={() => setShowNewPassword((prev) => !prev)}
>
<FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
</span>
</div>
</div>
<div className="mb-5">
<label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
Confirm New Password
</label>
<div className="relative">
<input
type={showConfirmPassword ? 'text' : 'password'}
id="confirmPassword"
className="form-input w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
value={confirmPassword}
placeholder="Enter Confirm password"
onChange={(e) => setConfirmPassword(e.target.value)}
required
/>
<span
className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
onClick={() => setShowConfirmPassword((prev) => !prev)}
>
<FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
</span>
</div>
</div>
<button type="submit" className="w-full bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700 font-semibold">
Update Password
</button>
</form>
{message && (
<p className={`mt-4 text-center text-sm font-semibold ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
)}
</div>
</div>
</div>
</div>
);
};

export default CommitteeSetting;