import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faHouse,
faFileAlt,
faPaperclip,
faDownload,
faComments,
faCog,
faTimes,
faSignOutAlt,
faBars,
faBell,
faEye,
faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';

const StudentSetting = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [userName, setUserName] = useState('');
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [studentDetails, setStudentDetails] = useState({});
const [documentUploaded, setDocumentUploaded] = useState(false);
const [hasNewMessage, setHasNewMessage] = useState(false);
const [message, setMessage] = useState('');const [isError, setIsError] = useState(false);
const [loading, setLoading] = useState(true);

// Password field visibility states
const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

// Step 1: Add state to store student profile
const [studentProfile, setStudentProfile] = useState({});

const navigate = useNavigate();

const toggleSidebar = () => setSidebarActive(!sidebarActive);

// Toggle functions for each field
const toggleCurrentVisibility = () => setShowCurrent((s) => !s);
const toggleNewVisibility = () => setShowNew((s) => !s);
const toggleConfirmVisibility = () => setShowConfirm((s) => !s);

const handleChangePassword = async (e) => {
e.preventDefault();
setMessage('');
setIsError(false);

if (!currentPassword || !newPassword || !confirmPassword) {
setMessage('All password fields are required');
setIsError(true);
return;
}

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
const verifyResponse = await axios.get('https://e-bursary-backend.onrender.com/api/verify-password', {
headers: { Authorization: `Bearer ${token}` },
params: { password: currentPassword },
});

if (verifyResponse.status === 200) {
const response = await axios.post(
'https://e-bursary-backend.onrender.com/api/change-password',
{ currentPassword, newPassword },
{
headers: { Authorization: `Bearer ${token}` },
}
);
setMessage(response.data.message || 'Password updated successfully');
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

// Fetch student info and document upload status
useEffect(() => {
const token = sessionStorage.getItem('authToken');
const name = sessionStorage.getItem('userName');
const userId = sessionStorage.getItem('userId');
   
if (!token) {
navigate('/signin');
return;
}
   
setUserName(name);
setLoading(true);
   
// ✅ Fetch student details only if token is present
axios.get('https://e-bursary-backend.onrender.com/api/student', {
headers: {
Authorization: token,
'Cache-Control': 'no-cache',
Pragma: 'no-cache',
Expires: '0',
},
})
.then((response) => {
setStudentDetails(response.data);
setFormData(response.data);
setLoading(false);
})
.catch((error) => {
setLoading(false);
if (error.response && error.response.status === 401) {
navigate('/signin');
}
});
   
// ✅ Only call document status API if both token and userId exist
if (userId) {
axios
.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, {
headers: { Authorization: token }  // Optional but recommended for security
})
.then((res) => {
const isUploaded = res.data && res.data.uploaded === true;
setDocumentUploaded(isUploaded);
           
})
.catch(() => setDocumentUploaded(false));
}
   
}, [navigate]);

useEffect(() => {
const token = sessionStorage.getItem('authToken');
const userId = sessionStorage.getItem('userId');
  
if (!token) {
navigate('/signin');
return;
}
  
if (userId) {
axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, {
headers: { Authorization: token }
})
.then(response => {
const message = response.data.status_message;
if (message && message.toLowerCase().includes("new")) {
setHasNewMessage(true);
} else {
setHasNewMessage(false);
}
})
.catch(err => {
console.error('Error checking status message:', err);
});
}
}, []);


return (
<div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
{/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
             
     
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
<div className="flex items-center space-x-1">
<h2 className="mr-1 md:mr-5 text-sm md:text-lg font-bold text-[#14213d]">
Welcome: {userName}
</h2>
<div className="flex items-center space-x-2">
<img
src={
studentDetails.gender === 'Female'
? '/images/woman.png'
: studentDetails.gender === 'Male'
? '/images/patient.png'
: '/images/user.png'
}
alt="User"
className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-1 md:mr-0"
/>
     
     
     
</div>
{/* Sidebar toggle only visible on small screens */}
{/* Toggle Button for opening sidebar on mobile */}
<div className="block md:hidden">
<FontAwesomeIcon
icon={faBars}
className="text-xl cursor-pointer text-[#14213d]"
onClick={toggleSidebar}
/>
</div>
     
</div>
</div>
</div>

<div className="flex pt-20 min-h-screen">
{/* Sidebar */}
<div
className={`
fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14
transition-all duration-100 ease-in-out
overflow-visible
${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[36px] md:p-2'}
`}
>
{/* Toggle Button for Desktop View */}
<div className="hidden md:flex justify-end mb-4">
<FontAwesomeIcon
icon={sidebarActive ? faTimes : faBars}
className={`text-white cursor-pointer text-xl ${
sidebarActive ? 'ml-auto' : 'mr-1'
}`}
onClick={toggleSidebar}
/>
</div>
       
{/* Navigation Menu */}
<ul className="flex flex-col h-full mt-6 space-y-10">
{[
{
icon: faHouse,
label: 'Dashboard',
to: '/studentdashboard'
},
{
icon: faFileAlt,
label: 'Apply',
isButton: true,
onClick: () => navigate('/personaldetails'),
disabled: documentUploaded
},
{
icon: faDownload,
label: 'Report',
to: '/studentreport'
},
{
icon: faBell,
label: 'Notification',
to: '/messages'
},
{
icon: faCog,
label: 'Settings',
to: '/studentsetting'
},
{
icon: faSignOutAlt,
label: 'Logout',
isLogout: true
}
].map((item, index) => (
<li
className={`group relative ${item.isLogout ? 'mt-30 md:mt-55' : ''}`}
key={index}
>
{/* Logout Action */}
{item.isLogout ? (
<a
href="#"
onClick={(e) => {
e.preventDefault();
const token = sessionStorage.getItem('authToken');
axios
.post(
'https://e-bursary-backend.onrender.com/api/logout',
{},
{
headers: { Authorization: `Bearer ${token}` }
}
)
.catch(() => {})
.finally(() => {
sessionStorage.clear();
setDocumentUploaded(false);
navigate('/');
});
}}
className={`flex items-center space-x-2 transition-all duration-200 ${
sidebarActive ? 'justify-start' : 'justify-center'
}`}
>
<FontAwesomeIcon
icon={item.icon}
className="text-xl"
/>
<span
className={`${
sidebarActive
? 'inline-block ml-2 text-xl font-semibold'
: 'hidden'
}`}
>
{item.label}
</span>
</a>
) : item.isButton ? (
<a
href="#"
onClick={item.disabled ? undefined : item.onClick}
className={`flex items-center space-x-2 transition-all duration-200 ${
sidebarActive ? 'justify-start' : 'justify-center'
} ${
item.disabled
? 'pointer-events-none opacity-60 cursor-not-allowed'
: ''
}`}
aria-disabled={item.disabled ? 'true' : 'false'}
>
<FontAwesomeIcon
icon={item.icon}
className="text-xl"
/>
<span
className={`${
sidebarActive
? 'inline-block ml-2 text-xl font-semibold'
: 'hidden'
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
<div className="relative">
<FontAwesomeIcon
icon={item.icon}
className="text-xl"
/>
{item.label === 'Notification' && hasNewMessage && (
<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
)}
</div>
<span
className={`${
sidebarActive
? 'inline-block ml-2 font-semibold'
: 'hidden'
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
<div className={`flex-1 md:ml-25 transition-all mt-2 duration-300
${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[50px]'}`}>
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[350px] md:max-w-[500px]  mx-auto -mt-9 md:-mt-2 mb-4 md:mb-6 p-4 md:p-8">
<h2 className="text-2xl font-bold text-[#14213d] mb-4 text-center">Change Password</h2>
<form onSubmit={handleChangePassword} className="space-y-4 text-[#14213d] relative">
<div className="relative">
<label htmlFor="currentPassword" className="block font-medium mb-2">
Current Password
</label>
<input
type={showCurrent ? "text" : "password"}
id="currentPassword"
className="form-input w-full border border-gray-300 rounded px-3 py-2 focus-within:ring-[#14213d] pr-12"
value={currentPassword}
onChange={(e) => setCurrentPassword(e.target.value)}
required
placeholder="Enter current password"
autoComplete="current-password"
/>
<span
className=" text-xl mt-8 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-[#14213d]"
onClick={toggleCurrentVisibility}
style={{
display: 'inline-flex',
width: 'auto',
padding: '0.5rem',
}}
>
<FontAwesomeIcon icon={showCurrent ? faEye : faEyeSlash} />
</span>
</div>
<div className="relative">
<label htmlFor="newPassword" className="block font-medium mb-2">
New Password
</label>
<input
type={showNew ? "text" : "password"}
id="newPassword"
className="form-input w-full border border-gray-300 rounded px-3 py-2 focus-within:ring-[#14213d] pr-12"
value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
required
placeholder="Enter new password"
autoComplete="new-password"
/>
<span
className="text-xl mt-8 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-[#14213d] "
onClick={toggleNewVisibility}
style={{
display: 'inline-flex',
width: 'auto',
padding: '0.5rem',
}}
>
<FontAwesomeIcon icon={showNew ? faEye : faEyeSlash} />
</span>
</div>
<div className="relative">
<label htmlFor="confirmPassword" className="block font-medium mb-2">
Confirm New Password
</label>
<input
type={showConfirm ? "text" : "password"}
id="confirmPassword"
className="form-input w-full border border-gray-300 rounded px-3 py-2 focus-within:ring-[#14213d] pr-12"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
required
placeholder="Re-enter new password"
autoComplete="new-password"
/>
<span
className="text-xl mt-8 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-[#14213d] "
onClick={toggleConfirmVisibility}
style={{
display: 'inline-flex',
width: 'auto',
padding: '0.5rem',
}}
>
<FontAwesomeIcon icon={showConfirm ? faEye : faEyeSlash} />
</span>
</div>
<div className="flex justify-end mt-6">
<button
type="submit"
className="bg-[#14213d] font-bold text-white px-6 py-2 cursor-pointer rounded hover:bg-gray-700 transition duration-200"
>
Update Password
</button>
</div>
</form>
{message && (
<p className={`mt-4 text-center text-[1rem] font-bold md:text-[1.1rem] ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
)}
</div>
</div>
</div>
</div>
);
};

export default StudentSetting;