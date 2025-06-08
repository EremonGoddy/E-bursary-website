import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@fortawesome/free-solid-svg-icons';

const UserManagement = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [users, setUsers] = useState([]);
const [adminDetails, setAdminDetails] = useState({});
const [activityLogs, setActivityLogs] = useState([]);
const [newUser, setNewUser] = useState({
fullname: '',
email: '',
role: 'Committee',
password: '123',
});
const navigate = useNavigate();

const toggleSidebar = () => setSidebarActive(!sidebarActive);

useEffect(() => {
const fetchUsers = async () => {
const response = await axios.get('https://e-bursary-backend.onrender.com/api/users');
setUsers(response.data);
};
fetchUsers();
}, []);

useEffect(() => {
const fetchLogs = async () => {
const response = await axios.get('https://e-bursary-backend.onrender.com/api/activity-logs');
setActivityLogs(response.data);
};
fetchLogs();
}, []);

useEffect(() => {
axios
.get('https://e-bursary-backend.onrender.com/api/admin-details')
.then((response) => {
setAdminDetails({
name: response.data.name,
email: response.data.email,
});
})
.catch((error) => console.error('Error fetching admin details:', error));
}, []);

const handleInputChange = (e) => {
setNewUser({ ...newUser, [e.target.name]: e.target.value });
};

const handleAddUser = async () => {
await axios.post('https://e-bursary-backend.onrender.com/api/users', newUser);
setNewUser({ fullname: '', email: '', role: 'Committee', password: '123' });
const usersResponse = await axios.get('https://e-bursary-backend.onrender.com/api/users');
setUsers(usersResponse.data);
const logsResponse = await axios.get('https://e-bursary-backend.onrender.com/api/activity-logs');
setActivityLogs(logsResponse.data);
};

const handleDeleteUser = async (userId) => {
await axios.delete(`https://e-bursary-backend.onrender.com/api/users/${userId}`);
const usersResponse = await axios.get('https://e-bursary-backend.onrender.com/api/users');
setUsers(usersResponse.data);
const logsResponse = await axios.get('https://e-bursary-backend.onrender.com/api/activity-logs');
setActivityLogs(logsResponse.data);
};

  return (
<div className="w-full min-h-screen relative bg-gray-100">
{/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
<div className="flex items-center space-x-6">
<h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
Welcome, {adminDetails.name}
</h2>
<div className="flex items-center space-x-2">
<img
src="/images/patient.png"
alt="Admin"
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
<Link to="/admindashboard" className={`
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
{/* User Management */}
<li className="relative group">
<div className="flex items-center">
<Link to="/usermanagement" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faUserGear} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>User Management</span>
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
User Management
</span>
</div>
</li>
{/* Bursary Management */}
<li className="relative group">
<div className="flex items-center">
<Link to="/bursarymanagement" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faBank} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Bursary Management</span>
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
Bursary Management
</span>
</div>
</li>
{/* Application Monitoring */}
<li className="relative group">
<div className="flex items-center">
<Link to="/monitoring" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Application Monitoring</span>
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
Application Monitoring
</span>
</div>
</li>
{/* Analysis */}
<li className="relative group">
<div className="flex items-center">
<Link to="/adminreport" className={`
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
{/* Audit Logs */}
<li className="relative group">
<div className="flex items-center">
<Link to="/auditlogs" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faFileLines} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Audit Logs</span>
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
Audit Logs
</span>
</div>
</li>
{/* Settings */}
<li className="relative group">
<div className="flex items-center">
<Link to="/adminsetting" className={`
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
flex items-center w-full space-x-2 mt-25 md:mt-20 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faSignOutAlt} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Logout</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[0px] md:mt-[38px] -translate-y-1/2
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

{/* Main Content */}
<div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}
`}>
<div className="max-w-5xl mx-auto bg-white p-8 shadow rounded-md mt-10">
<h2 className="text-2xl font-bold mb-6 text-center">User Account Management</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
{/* Add User */}
<div className="bg-gray-50 p-6 rounded shadow">
<h3 className="text-xl font-bold mb-4">Add New User</h3>
<input
type="text"
name="fullname"
className="form-input mb-3 w-full px-3 py-2 border border-gray-300 rounded"
placeholder="Full Name"
value={newUser.fullname}
onChange={handleInputChange}
/>
<input
type="email"
name="email"
className="form-input mb-3 w-full px-3 py-2 border border-gray-300 rounded"
placeholder="Email"
value={newUser.email}
onChange={handleInputChange}
/>
<select
name="role"
className="form-select mb-3 w-full px-3 py-2 border border-gray-300 rounded"
value={newUser.role}
onChange={handleInputChange}
>
<option value="Committee">Committee</option>
<option value="Admin">Admin</option>
</select>
<button
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold w-full"
onClick={handleAddUser}
>
Add User
</button>
</div>
{/* Existing Users */}
<div className="bg-gray-50 p-6 rounded shadow">
<h3 className="text-xl font-bold mb-4">Existing Users</h3>
<div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200">
<thead className="bg-blue-200">
<tr>
<th className="px-3 py-2 text-center font-semibold">ID</th>
<th className="px-3 py-2 text-center font-semibold">Full Name</th>
<th className="px-3 py-2 text-center font-semibold">Email</th>
<th className="px-3 py-2 text-center font-semibold">Role</th>
<th className="px-3 py-2 text-center font-semibold">Actions</th>
</tr>
</thead>
<tbody className="bg-white divide-y divide-gray-100">
{users.map((user) => (
<tr key={user.id}>
<td className="px-3 py-2 text-center">{user.id}</td>
<td className="px-3 py-2 text-center">{user.fullname}</td>
<td className="px-3 py-2 text-center">{user.email}</td>
<td className="px-3 py-2 text-center">{user.role}</td>
<td className="px-3 py-2 text-center">
<button
className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-semibold"
onClick={() => handleDeleteUser(user.id)}
>
Delete
</button>
</td>
</tr>
))}
</tbody>
</table>
{users.length === 0 && (
<div className="py-4 text-center text-gray-400">No users found.</div>
)}
</div>
</div>
</div>
{/* Activity Logs */}
<div className="bg-gray-50 p-6 rounded shadow">
<h3 className="text-xl font-bold mb-4">Activity Logs</h3>
<ul className="divide-y divide-gray-200">
{activityLogs.map((log, index) => (
<li className="py-2" key={index}>
<span className="text-gray-700">{log.log_message}</span>
<span className="ml-2 text-gray-400 text-sm">at {log.log_time}</span>
</li>
))}
{activityLogs.length === 0 && (
<li className="py-4 text-center text-gray-400">No activity logs found.</li>
)}
</ul>
</div>
</div>
</div>
</div>
</div>
);
};

export default UserManagement;