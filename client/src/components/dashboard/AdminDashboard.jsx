import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
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


// inside component
const chartData = useMemo(() => ({
  labels: ["Approved", "Rejected", "Pending", "Incomplete"],
  datasets: [
    {
      data: [approvedPercentage, rejectedPercentage, pendingPercentage, incompletePercentage],
      backgroundColor: ["#4CAF50", "#FF5252", "#FFC107", "#2196F3"],
      hoverBackgroundColor: ["#388E3C", "#D32F2F", "#FFA000", "#1976D2"],
    },
  ],
}), [approvedPercentage, rejectedPercentage, pendingPercentage, incompletePercentage]);

const chartOptions = useMemo(() => ({
  plugins: {
    datalabels: {
      color: "#fff",
      formatter: (value) => `${value.toFixed(2)}%`,
      font: { weight: "bold", size: 15 },
    },
  },
}), []);

// Bar chart
const barData = useMemo(() => ({
  labels: ["Approved", "Rejected", "Pending", "Incomplete"],
  datasets: [
    {
      label: "Applications",
      data: [
        approvedApplications,
        rejectedApplications,
        pendingApplications,
        incompleteApplications,
      ],
      backgroundColor: ["#4CAF50", "#FF5252", "#FFC107", "#2196F3"],
    },
  ],
}), [approvedApplications, rejectedApplications, pendingApplications, incompleteApplications]);

const barOptions = useMemo(() => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#14213d",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 10,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
}), []);


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
<div className={`flex-1 ml-0 md:ml-64 p-2 mt-6 md:-mt-5 transition-all duration-100 pr-1 pl-0 md:pr-5 md:pl-5
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[0px] md:ml-[30px]'}
`}>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Bursary Fund Details */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-xl font-bold text-[#14213d] text-center">Bursary Fund Details</h2>
<div className="flex flex-col gap-2 md:flex-row md:justify-around md:gap-4">
<div className="flex-1 text-center bg-white border-3 md:border-4 border-blue-500 rounded-xl p-0 md:p-3 shadow-sm">
<p className="text-blue-700 font-semibold mb-0 md:mb-1">Total Funds Available</p>
<strong className="text-blue-700 text-2xl">{bursaryAmount}</strong>
</div>
<div className="flex-1 text-center bg-white border-3 md:border-4 border-green-500 rounded-xl p-0 md:p-3 shadow-sm">
<p className="text-green-700 font-semibold mb-0 md:mb-1">Allocated to Students</p>
<strong className="text-green-700 text-2xl">{allocatedAmount}</strong>
</div>
<div className="flex-1 text-center bg-white border-3 md:border-4 border-yellow-500 rounded-xl p-0 md:p-3  shadow-sm">
<p className="text-yellow-700 font-semibold mb-0 md:mb-1">Remaining Funds</p>
<strong className="text-yellow-700 text-2xl">{remainingAmount}</strong>
</div>
</div>
</div>
{/* Quick Statistics */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-xl font-bold text-[#14213d] text-center">Quick Statistics</h2>
<div className="flex flex-col gap-2 md:flex-row md:justify-around md:gap-2">
<div className="flex-1 text-center bg-white border-3 md:border-4 border-yellow-500 rounded-xl p-0 md:p-3 shadow-sm">
<p className="text-yellow-700 font-semibold mb-0 md:mb-1">Pending</p>
<strong className="text-yellow-700 text-2xl">{pendingApplications}</strong>
</div>
<div className="flex-1 text-center bg-white border-3 md:border-4 border-gray-500 rounded-xl p-0 md:p-3 shadow-sm">
<p className="text-gray-700 font-semibold mb-0 md:mb-1">Incomplete</p>
<strong className="text-gray-600 text-2xl">{incompleteApplications}</strong>
</div>
<div className="flex-1 text-center bg-white border-3 md:border-4 border-blue-500 rounded-xl p-0 md:p-3 shadow-sm">
<p className="text-blue-700 font-semibold mb-0 md:mb-1">Total Student</p>
<strong className="text-blue-700 text-2xl">{totalApplications}</strong>
</div>
<div className="flex-1 text-center bg-white border-3 md:border-4 border-green-500 rounded-xl p-0 md:p-3 shadow-sm">
<p className="text-green-700 font-semibold mb-0 md:mb-1">Approved</p>
<strong className="text-green-700 text-2xl">{approvedApplications}</strong>
</div>
<div className="flex-1 text-center bg-white border-3 md:border-4  border-red-500 rounded-xl p-0 md:p-3 shadow-sm">
<p className="text-red-700 font-semibold mb-0 md:mb-1">Rejected</p>
<strong className="text-red-700 text-2xl">{rejectedApplications}</strong>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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

{/* Activity Logs */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/90 border border-gray-200 shadow-lg rounded-2xl 
  transition-all duration-300 hover:shadow-xl hover:scale-[1.01] p-4">

  <h2 className="text-lg md:text-xl font-bold text-[#14213d] mb-3 border-b pb-2">
    Activity Logs
  </h2>

  {/* Scrollable list wrapper */}
  <div className="overflow-y-auto max-h-[450px] pr-2">
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

{/* Approval Status Chart (Pie) */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
  <h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">
    Approval Status (Pie)
  </h2>
  <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
    <div className="w-full md:w-2/3 lg:w-1/2">
<Pie data={chartData} options={chartOptions} />
 {/* ✅ added redraw */}
    </div>

    {/* Custom Legend */}
    <div className="flex flex-col space-y-3 text-sm md:text-base">
      {[
        { label: 'Approved', color: '#4CAF50' },
        { label: 'Rejected', color: '#FF5252' },
        { label: 'Pending', color: '#FFC107' },
        { label: 'Incomplete', color: '#2196F3' },
      ].map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span
            className="inline-block w-4 h-4 rounded-full shadow-md"
            style={{ backgroundColor: item.color }}
          ></span>
          <span className="font-medium text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Application Status Chart (Bar) */}
<div className="w-full mb-6 md:mb-8 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
  <h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">
    Application Status (Bar)
  </h2>
  <div className="w-full">
<Bar data={barData} options={barOptions} /> {/* ✅ uses barData + barOptions */}
  </div>
</div>


</div>
</div>
</div>
);
};

export default AdminDashboard;