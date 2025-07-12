import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
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

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const AdminDashboard = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [adminDetails, setAdminDetails] = useState({});
const [bursaryAmount, setBursaryAmount] = useState(0);
const [allocatedAmount, setAllocatedAmount] = useState(0);
const [remainingAmount, setRemainingAmount] = useState(0);
const [totalApplications, setTotalApplications] = useState(0);
const [approvedApplications, setApprovedApplications] = useState(0);
const [rejectedApplications, setRejectedApplications] = useState(0);
const [pendingApplications, setPendingApplications] = useState(0);
const [incompleteApplications, setIncompleteApplications] = useState(0);
const [users, setUsers] = useState([]);
const [activityLogs, setActivityLogs] = useState([]);

const toggleSidebar = () => setSidebarActive(!sidebarActive);

useEffect(() => {
axios
.get('https://e-bursary-backend.onrender.com/api/committee-count')
.then((response) => {
setBursaryAmount(response.data.amount);
setAllocatedAmount(response.data.allocated);
setRemainingAmount(response.data.amount - response.data.allocated);
})
.catch((error) => {
console.error('Error fetching bursary amount:', error);
});

axios
.get('https://e-bursary-backend.onrender.com/api/admin-details')
.then((response) => {
setAdminDetails({
name: response.data.name,
email: response.data.email,
});
})
.catch((error) => console.error('Error fetching admin details:', error));

axios
.get('https://e-bursary-backend.onrender.com/api/quick-statistics')
.then((response) => {
const { total, approved, rejected, pending, incomplete } = response.data;
setTotalApplications(total);
setApprovedApplications(approved);
setRejectedApplications(rejected);
setPendingApplications(pending || 0);
setIncompleteApplications(incomplete || 0);
})
.catch((error) => {
console.error('Error fetching application statistics:', error);
});
}, []);

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

const handleDeleteUser = async (userId) => {
await axios.delete(`https://e-bursary-backend.onrender.com/api/users/${userId}`);
const usersResponse = await axios.get('https://e-bursary-backend.onrender.com/api/users');
setUsers(usersResponse.data);
const logsResponse = await axios.get('https://e-bursary-backend.onrender.com/api/activity-logs');
setActivityLogs(logsResponse.data);
};

const approvedPercentage = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
const rejectedPercentage = totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0;
const pendingPercentage = totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0;
const incompletePercentage = totalApplications > 0 ? (incompleteApplications / totalApplications) * 100 : 0;

const chartData = {
labels: ['Approved', 'Rejected', 'Pending', 'Incomplete'],
datasets: [
{
data: [approvedPercentage, rejectedPercentage, pendingPercentage, incompletePercentage],
backgroundColor: ['#4CAF50', '#FF5252', '#FFC107', '#2196F3'],
hoverBackgroundColor: ['#388E3C', '#D32F2F', '#FFA000', '#1976D2'],
},
],
};

const chartOptions = {
plugins: {
datalabels: {
color: '#fff',
formatter: (value) => `${value.toFixed(2)}%`,
font: {
weight: 'bold',
size: 15,
},
},
},
};

return (
<div className="w-full min-h-screen relative">
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
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Bursary Fund Details */}
<div className="bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.13)] rounded flex flex-col items-center">
<h2 className="text-xl font-bold text-center">Bursary Fund Details</h2>
<div className="flex flex-col md:flex-row justify-around items-center mt-4 w-full gap-4">
<div className="text-center bg-blue-100 p-3 rounded shadow w-full">
<p className="font-medium">Total Funds Available:</p>
<strong className="text-lg">{bursaryAmount}</strong>
</div>
<div className="text-center bg-green-100 p-3 rounded shadow w-full">
<p className="font-medium">Amount Allocated to Students:</p>
<strong className="text-lg">{allocatedAmount}</strong>
</div>
<div className="text-center bg-yellow-100 p-3 rounded shadow w-full">
<p className="font-medium">Remaining Funds:</p>
<strong className="text-lg">{remainingAmount}</strong>
</div>
</div>
</div>
{/* Quick Statistics */}
<div className="bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.13)] rounded flex flex-col items-center">
<h2 className="text-xl font-bold text-center">Quick Statistics</h2>
<div className="flex flex-col md:flex-row justify-between items-center mt-4 w-full gap-4">
<div className="text-center bg-blue-500 text-[0.8rem] md:text-[1rem] font-semibold md:bold text-white p-2 rounded shadow max-w-[100px] md:max-w-[140px]">
<p>Pending Application</p>
<strong>{pendingApplications}</strong>
</div>
<div className="text-center bg-yellow-500 text-[0.8rem] md:text-[1rem] font-semibold md:bold text-white p-2 rounded shadow max-w-[100px] md:max-w-[140px]">
<p>Incomplete Application</p>
<strong>{incompleteApplications}</strong>
</div>
<div className="text-center bg-green-500 text-white p-3 rounded shadow w-full">
<p>Total Applications:</p>
<strong className="text-lg">{totalApplications}</strong>
</div>
<div className="text-center bg-blue-500 text-white p-3 rounded shadow w-full">
<p>Approved Applications:</p>
<strong className="text-lg">{approvedApplications}</strong>
</div>
<div className="text-center bg-red-500 text-white p-3 rounded shadow w-full">
<p>Rejected Applications:</p>
<strong className="text-lg">{rejectedApplications}</strong>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
{/* Existing Users */}
<div className="bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.13)] rounded">
<h2 className="text-xl font-bold mb-3">Existing Users</h2>
<div className="overflow-x-auto">
<table className="table-auto w-full mt-4 text-sm md:text-base">
<thead>
<tr>
<th className="border px-4 py-2">ID</th>
<th className="border px-4 py-2">Full Name</th>
<th className="border px-4 py-2">Email</th>
<th className="border px-4 py-2">Role</th>
<th className="border px-4 py-2">Actions</th>
</tr>
</thead>
<tbody>
{users.map((user) => (
<tr key={user.id}>
<td className="border px-4 py-2">{user.id}</td>
<td className="border px-4 py-2">{user.name}</td>
<td className="border px-4 py-2">{user.email}</td>
<td className="border px-4 py-2">{user.role}</td>
<td className="border px-4 py-2">
<button
className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
onClick={() => handleDeleteUser(user.id)}
>
Delete
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
{/* Activity Logs */}
<div className="bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.13)] rounded">
<h2 className="text-xl font-bold mb-3">Activity Logs</h2>
<ul className="mt-4 space-y-2 text-sm md:text-base">
{activityLogs.map((log, index) => (
<li key={index} className="border-b pb-2">
{log.log_message} <span className="text-gray-500">at {log.log_time}</span>
</li>
))}
</ul>
</div>
</div>

{/* Approval Status Chart */}
<div className="bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.14)] rounded mt-4">
<h2 className="text-xl font-bold text-center">Approval Status</h2>
<div className="mt-4 flex justify-center">
<div className="w-full md:w-2/3 lg:w-1/2">
<Pie data={chartData} options={chartOptions} />
</div>
</div>
</div>
</div>
</div>
</div>
);
};

export default AdminDashboard;