import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faBars,
faHouse,
faUser,
faUsers,
faCog,
faBell,
faChartBar,
faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

const CommitteeDashboard = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [committeeDetails, setCommitteeDetails] = useState({});
const [bursaryAmount, setBursaryAmount] = useState(0);
const [allocatedAmount, setAllocatedAmount] = useState(0);
const [remainingAmount, setRemainingAmount] = useState(0);
const [totalApplications, setTotalApplications] = useState(0);
const [approvedApplications, setApprovedApplications] = useState(0);
const [rejectedApplications, setRejectedApplications] = useState(0);
const [pendingApplications, setPendingApplications] = useState(0);
const [incompleteApplications, setIncompleteApplications] = useState(0);
const [userName, setUserName] = useState('');
const [data, setData] = useState([]);
const navigate = useNavigate();

const toggleSidebar = () => setSidebarActive(!sidebarActive);

useEffect(() => {
const token = sessionStorage.getItem('authToken');
const name = sessionStorage.getItem('userName');
if (!token) {
navigate('/signin');
} else {
setUserName(name);
axios
.get('https://e-bursary-backend.onrender.com/api/committee-count')
.then((response) => {
setBursaryAmount(response.data.amount);
setAllocatedAmount(response.data.allocated);
setRemainingAmount(response.data.amount - response.data.allocated);
})
.catch((error) => {
console.error('Error fetching bursary data:', error);
});

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
}
}, [navigate]);

const loadData = async () => {
try {
const response = await axios.get('https://e-bursary-backend.onrender.com/api/personalInformation');
setData(response.data);
} catch (error) {
console.error('Error fetching personal information:', error);
}
};

useEffect(() => {
loadData();
}, []);

useEffect(() => {
const token = sessionStorage.getItem('authToken');
if (!token) {
navigate('/signin');
} else {
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

const handleApproveStudent = async (studentUserId) => {
try {
const committeeName = sessionStorage.getItem('userName');
if (!committeeName) return;
await axios.post('https://e-bursary-backend.onrender.com/api/approve-student', {
studentUserId,
committeeName,
});
} catch (error) {
console.error('Error approving student:', error);
}
};

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

{/* Main Content */}
<div className={`flex-1 w-full md:ml-64 p-4 md:p-10 -mt-6 md:-mt-10 transition-all duration-100
${sidebarActive ? 'ml-[0px] md:ml-[190px]' : 'ml-[0px] md:ml-[30px]'}
`}>
{/* Grid: stack on mobile */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
{/* Bursary Fund Details */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-xl font-bold text-center">Bursary Fund Details</h2>
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
<div className="w-full mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-center text-base md:text-2xl font-bold mb-2 md:mb-4">Quick Statistics</h2>
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

{/* Table: fully scrollable on mobile, cells shrink */}
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] w-full mx-auto p-2 md:p-4">
<h2 className="text-center  text-[1.3rem] md:text-2xl font-bold mb-2 md:mb-4">Personal Information</h2>
<div className="overflow-x-auto w-full">
<table className="min-w-[600px] w-full border-collapse border border-gray-300 text-[1rem] md:text-[1.1rem]">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Full Name</th>
<th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Email</th>
<th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Institution</th>
<th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Admission</th>
<th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Sub County</th>
<th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Action</th>
</tr>
</thead>
<tbody>
{data.map((item) => (
<tr key={item.id} className="hover:bg-gray-100">
<td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.fullname}</td>
<td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.email}</td>
<td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.institution}</td>
<td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.admission}</td>
<td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.subcounty}</td>
<td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 text-center whitespace-nowrap">
{(item.approved_by_committee && item.approved_by_committee !== userName) ? (
<span className="text-gray-500 text-[0.85rem] italic">
Reviewed by {item.approved_by_committee}
</span>
) : (
<Link
to={`/PersonalInformation/${item.user_id}`}
onClick={() => handleApproveStudent(item.user_id)}
className="text-blue-500 no-underline hover:text-blue-700 text-[0.95rem] font-bold"
>
User Details
</Link>
)}
</td>
</tr>
))}
</tbody>
</table>
{/* Table responsive hint for mobile */}
<div className="md:hidden text-center text-xs text-gray-500 mt-2">Swipe left/right to see all columns</div>
</div>
</div>
</div>
</div>
</div>
);
};

export default CommitteeDashboard;