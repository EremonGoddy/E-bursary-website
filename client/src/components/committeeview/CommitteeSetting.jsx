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

return (
<div className="w-full min-h-screen relative bg-white-100">
{/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
<div className="flex items-center space-x-6">
<h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
Welcome:{userName}
</h2>
<div className="flex items-center space-x-2">
<img
src="/images/patient.png"
alt="Committee"
className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-2 md:mr-20"
/>
<FontAwesomeIcon icon={faBell} className="text-2xl md:text-2xl" />
</div>
</div>
</div>
</div>
<div className="flex pt-20 min-h-screen">
{/* Sidebar */}
<div
className={`
fixed top-0 left-0 z-30 bg-[#1F2937] 
h-screen 
${sidebarActive ? 'w-[180px] md:w-[210px]' : 'w-[40px] md:w-[50px]'} 
mt-10
text-white p-4 
flex flex-col
transition-all duration-300
min-h-screen
md:min-h-screen
`}
>
<FontAwesomeIcon
icon={faBars}
className={`
text-white 
${sidebarActive ? 'transform translate-x-[130px] md:translate-x-[150px]' : ''}
text-[1.4rem] md:text-[1.7rem] -ml-2 md:-ml-1.5 mt-4 transition-all duration-300 cursor-pointer self-start
`}
onClick={toggleSidebar}
/>
<ul className="space-y-10 md:space-y-12 mt-1 md:mt-4 pl-0">
{/* Dashboard */}
<li className="list-none mt-[30px] text-center relative group">
<div className="flex items-center">
<Link to="/committeedashboard" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start md:pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faHouse} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Dashboard</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[40px] h-[40px] block
${sidebarActive ? 'hidden' : 'block'}
`}>
Dashboard
</span>
</div>
</li>
{/* Profile */}
<li className="relative group">
<div className="flex items-center">
<Link to="/committeeprofile" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faUser} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Profile</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[35px] h-[35px] block
${sidebarActive ? 'hidden' : 'block'}
`}>
Profile
</span>
</div>
</li>
{/* Student Information */}
<li className="relative group">
<div className="flex items-center">
<Link to="/userdetails" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faUsers} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Student Info</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[35px] h-[35px] block
${sidebarActive ? 'hidden' : 'block'}
`}>
Student Info
</span>
</div>
</li>
{/* Analysis */}
<li className="relative group">
<div className="flex items-center">
<Link to="/committeereport" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faChartBar} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Analysis</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[35px] h-[35px] block
${sidebarActive ? 'hidden' : 'block'}
`}>
Analysis
</span>
</div>
</li>
{/* Settings */}
<li className="relative group">
<div className="flex items-center">
<Link to="/committeesetting" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faCog} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Settings</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[35px] h-[35px] block
${sidebarActive ? 'hidden' : 'block'}
                `}>
Settings
</span>
</div>
</li>
{/* Logout */}
<li className="relative group">
<div className="flex items-center">
<Link to="/" className={`
flex items-center w-full space-x-2 mt-25 md:mt-50 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faSignOutAlt} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Logout</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[0px] md:mt-[98px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[35px] h-[35px] block
${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
`}>
Logout
</span>
</div>
</li>
</ul>
</div>

{/* Main Content Area */}
<div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}
`}>
<div className="max-w-lg mx-auto bg-white p-8 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded-md mt-10">
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