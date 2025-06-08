import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
faUsers,
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
const [data, setData] = useState([]);
const navigate = useNavigate();

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
console.error('Error fetching bursary data:', error);
});

axios
.get('https://e-bursary-backend.onrender.com/api/quick-statistics')
.then((response) => {
const { total, approved, rejected } = response.data;
setTotalApplications(total);
setApprovedApplications(approved);
setRejectedApplications(rejected);
})
.catch((error) => {
console.error('Error fetching application statistics:', error);
});
}, []);

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

return (
<div className="w-full min-h-screen relative">
{/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
<div className="flex items-center space-x-6">
<h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
Welcome, {committeeDetails.fullname}
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
{/* Bursary Fund Details & Statistics */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="bg-white p-6 shadow rounded-md">
<h2 className="text-center text-xl font-bold mb-4">Bursary Fund Details</h2>
<div className="flex justify-around">
<div className="text-center">
<p>Total Funds Available:</p>
<strong>{bursaryAmount}</strong>
</div>
<div className="text-center">
<p>Amount Allocated to Students:</p>
<strong>{allocatedAmount}</strong>
</div>
<div className="text-center">
<p>Remaining Funds:</p>
<strong>{remainingAmount}</strong>
</div>
</div>
</div>
<div className="bg-white p-6 shadow rounded-md">
<h2 className="text-center text-xl font-bold mb-4">Quick Statistics</h2>
<div className="flex justify-between items-center">
<div className="text-center bg-green-500 text-white p-4 rounded shadow">
<p>Total Applications:</p>
<strong>{totalApplications}</strong>
</div>
<div className="text-center bg-blue-500 text-white p-4 rounded shadow">
<p>Approved Applications:</p>
<strong>{approvedApplications}</strong>
</div>
<div className="text-center bg-red-500 text-white p-4 rounded shadow">
<p>Rejected Applications:</p>
<strong>{rejectedApplications}</strong>
</div>
</div>
</div>
</div>
{/* Personal Information Table */}
<div className="mt-6 bg-white p-6 shadow rounded-md">
<h2 className="text-center text-2xl font-bold mb-4">Personal Information</h2>
<div className="overflow-x-auto">
<table className="table-auto w-full border-collapse border border-gray-300">
<thead className="bg-gray-200">
<tr>
<th className="border border-gray-300 px-4 py-2">Full Name</th>
<th className="border border-gray-300 px-4 py-2">Email</th>
<th className="border border-gray-300 px-4 py-2">Institution</th>
<th className="border border-gray-300 px-4 py-2">Admission</th>
<th className="border border-gray-300 px-4 py-2">Sub County</th>
<th className="border border-gray-300 px-4 py-2">Action</th>
</tr>
</thead>
<tbody>
{data.map((item) => (
<tr key={item.id} className="hover:bg-gray-100">
<td className="border border-gray-300 px-4 py-2">{item.fullname}</td>
<td className="border border-gray-300 px-4 py-2">{item.email}</td>
<td className="border border-gray-300 px-4 py-2">{item.institution}</td>
<td className="border border-gray-300 px-4 py-2">{item.admission}</td>
<td className="border border-gray-300 px-4 py-2">{item.subcounty}</td>
<td className="border border-gray-300 px-4 py-2 text-center">
<Link to={`/PersonalInformation/${item.user_id}`}>
<button className="bg-blue-500 text-white px-4 py-2 rounded">User Details</button>
</Link>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>
);
};

export default CommitteeDashboard;