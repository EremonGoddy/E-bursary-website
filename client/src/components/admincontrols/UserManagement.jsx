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
<div
  className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:-mt-10 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
  ${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}
  `}
>
    <h2 className="text-2xl font-bold mb-6 text-center">User Account Management</h2>

    {/* Add + Existing Users side by side */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
      {/* Add User */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-8">
  <h3 className="text-xl font-bold mb-4">Add New User</h3>

  <div className="mb-3">
    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
      Full Name
    </label>
    <input
      type="text"
      id="fullname"
      name="fullname"
      className="form-input w-full px-3 py-2 border border-gray-300 rounded"
      placeholder="Enter full name"
      value={newUser.fullname}
      onChange={handleInputChange}
    />
  </div>

  <div className="mb-3">
    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
      Email
    </label>
    <input
      type="email"
      id="email"
      name="email"
      className="form-input w-full px-3 py-2 border border-gray-300 rounded"
      placeholder="Enter email"
      value={newUser.email}
      onChange={handleInputChange}
    />
  </div>

  <div className="mb-3">
    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
      Role
    </label>
    <select
      id="role"
      name="role"
      className="form-select w-full px-3 py-2 border border-gray-300 rounded"
      value={newUser.role}
      onChange={handleInputChange}
    >
      <option value="Committee">Committee</option>
      <option value="Admin">Admin</option>
    </select>
  </div>

  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold w-full"
    onClick={handleAddUser}
  >
    Add User
  </button>
</div>


      {/* Existing Users */}
     <div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">

  <h2 className="text-xl font-bold mb-3 text-[#14213d]">Existing Users</h2>

  {/* Scrollable table wrapper with fixed height */}
 <div className="overflow-y-auto max-h-[450px] w-full">
  <table className="min-w-[600px] w-full border-collapse border border-gray-300">
    <thead className="bg-[#14213d] text-white">
      <tr>
        <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2 whitespace-nowrap sticky top-0 bg-[#14213d] z-10">ID</th>
        <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2 whitespace-nowrap sticky top-0 bg-[#14213d] z-10">Full Name</th>
        <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2 whitespace-nowrap sticky top-0 bg-[#14213d] z-10">Email</th>
        <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2 whitespace-nowrap sticky top-0 bg-[#14213d] z-10">Role</th>
        <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2 whitespace-nowrap sticky top-0 bg-[#14213d] z-10">Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr key={user.id} className="hover:bg-gray-100">
          <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1 whitespace-nowrap">{user.id}</td>
          <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1 whitespace-nowrap">{user.name}</td>
          <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1 whitespace-nowrap">{user.email}</td>
          <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1 whitespace-nowrap">{user.role}</td>
          <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1 text-center whitespace-nowrap">
            <span
              onClick={() => handleDeleteUser(user.id)}
              className="text-red-500 cursor-pointer hover:text-red-700 font-semibold transition"
            >
              Delete
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Mobile hint */}
  <div className="md:hidden text-center text-xs text-gray-500 mt-2">
    Swipe left/right to see all columns
  </div>
</div>

</div>
    </div>

    {/* Activity Logs */}
<div className="max-w-[750px] mb-0 md:mb-4 backdrop-blur-xl bg-white/90 border border-gray-200 shadow-lg rounded-2xl 
  transition-all duration-300 hover:shadow-xl hover:scale-[1.01] p-4">

  <h2 className="text-lg md:text-xl font-bold text-[#14213d] mb-3 border-b pb-2">
    Activity Logs
  </h2>

  {/* Scrollable list wrapper */}
  <div className="overflow-y-auto max-h-[450px]  pr-2">
    <ul className="space-y-2 text-sm md:text-base">
      {activityLogs.map((log, index) => (
        <li
          key={index}
          className="p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
        >
          <span className="text-gray-800">{log.log_message}</span>
          <span className="text-gray-500 text-xs md:text-sm italic">
            {log.log_time}
          </span>
        </li>
      ))}
    </ul>
  </div>
</div>
</div>

</div>
</div>
);
};

export default UserManagement;