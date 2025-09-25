import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faBars,
faHouse,
faUserGear,
faBank,
faFileAlt,
faChartBar,
faFileLines,
faCog,
faSignOutAlt,
faBell,
faEye,
faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';

const AdminSetting = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [adminDetails, setAdminDetails] = useState({});
const navigate = useNavigate();
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [message, setMessage] = useState('');
const [isError, setIsError] = useState(false);

const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const toggleSidebar = () => setSidebarActive(!sidebarActive);

useEffect(() => {
const token = sessionStorage.getItem('authToken');
if (!token) {
navigate('/signin');
return;
}

axios.get('https://e-bursary-backend.onrender.com/api/admin-details')
.then(response => {
setAdminDetails({
name: response.data.name,
email: response.data.email,
});
})
.catch(error => console.error('Error fetching admin details:', error));
}, [navigate]);

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

const navItems = [
{ icon: faHouse, label: 'Dashboard', to: '/admindashboard' },
{ icon: faUserGear, label: 'User Management', to: '/usermanagement' },
{ icon: faBank, label: 'Bursary Management', to: '/bursarymanagement' },
{ icon: faFileAlt, label: 'Application Monitoring', to: '/monitoring' },
{ icon: faChartBar, label: 'Analysis', to: '/adminreport' },
{ icon: faFileLines, label: 'Audit Logs', to: '/auditlogs' },
{ icon: faCog, label: 'Settings', to: '/adminsetting' },
{ icon: faSignOutAlt, label: 'Logout', isLogout: true }
];

return (
<div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2">
{/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-1 md:p-2.5 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
<div className="flex items-center space-x-1">
<h2 className="mr-1 md:mr-5 text-[1rem] md:text-[1.2rem] font-bold text-[#14213d]">
Welcome: {adminDetails.name || 'Admin'}
</h2>
<div className="flex items-center space-x-2">
<img
src="/images/patient.png"
alt="Admin"
className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-2 md:mr-20"
/>
<FontAwesomeIcon icon={faBell} className="text-2xl md:text-2xl" />
</div>  
{/* Sidebar toggle only visible on small screens */}
{/* Toggle Button for opening sidebar on mobile */}
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

<div className="flex pt-20 min-h-screen">
{/* Sidebar */}
<div
className={`
fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14
transition-all duration-100 ease-in-out
overflow-visible
${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
${sidebarActive ? 'md:w-[260px] md:p-4' : 'md:w-[45px] md:p-2'}
`}
>
<div className="hidden md:flex justify-end mb-4">
<FontAwesomeIcon
icon={faBars}
className={`text-white cursor-pointer text-[1.5rem] ${sidebarActive ? 'ml-auto' : 'mr-2'}`}
onClick={toggleSidebar}
/>
</div>
<ul className="flex flex-col h-full mt-6">
  {/* Top nav items */}
  <div className="flex flex-col space-y-10">
    {navItems.filter((item) => !item.isLogout).map((item, index) => (
      <li className="group relative" key={index}>
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

        {!sidebarActive && (
          <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[1.1rem] w-[220px] flex items-center justify-center z-50">
            {item.label}
          </span>
        )}
      </li>
    ))}
  </div>

  {/* Logout item pinned at bottom */}
  {navItems.filter((item) => item.isLogout).map((item, index) => (
    <li className="group relative mt-30" key={index}>
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

      {!sidebarActive && (
        <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[1.1rem] w-[120px] flex items-center justify-center z-50">
          {item.label}
        </span>
      )}
    </li>
  ))}
</ul>
</div>

{/* Main Content */}
<div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:-mt-10 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
  ${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}
  `}>
<div className="max-w-xl mx-auto backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-8">
<h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
<form onSubmit={handleChangePassword}>
<div className="mb-5">
<label className="block font-semibold mb-1">Current Password</label>
<div className="relative flex items-center">
<input
type={showCurrentPassword ? 'text' : 'password'}
className="form-input px-4 py-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
value={currentPassword}
onChange={(e) => setCurrentPassword(e.target.value)}
required
/>
<button
type="button"
className="absolute right-2 p-1 text-gray-500"
onClick={() => setShowCurrentPassword(!showCurrentPassword)}
tabIndex={-1}
>
<FontAwesomeIcon icon={showCurrentPassword ? faEye : faEyeSlash} />
</button>
</div>
</div>

<div className="mb-5">
<label className="block font-semibold mb-1">New Password</label>
<div className="relative flex items-center">
<input
type={showNewPassword ? 'text' : 'password'}
className="form-input px-4 py-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
required
/>
<button
type="button"
className="absolute right-2 p-1 text-gray-500"
onClick={() => setShowNewPassword(!showNewPassword)}
tabIndex={-1}
>
<FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
</button>
</div>
</div>

<div className="mb-5">
<label className="block font-semibold mb-1">Confirm New Password</label>
<div className="relative flex items-center">
<input
type={showConfirmPassword ? 'text' : 'password'}
className="form-input px-4 py-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
required
/>
<button
type="button"
className="absolute right-2 p-1 text-gray-500"
onClick={() => setShowConfirmPassword(!showConfirmPassword)}
tabIndex={-1}
>
<FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
</button>
</div>
</div>
<button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 mt-2 rounded w-full font-semibold">
Update Password
</button>
</form>
{message && (
<p className={`mt-4 text-center font-semibold ${isError ? 'text-red-600' : 'text-green-600'}`}>
{typeof message === 'object' ? JSON.stringify(message) : message}
</p>
)}
</div>
</div>
</div>
</div>
);
}

export default AdminSetting;