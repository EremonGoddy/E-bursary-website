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
faChartLine,
faDisplay,
faClipboardList,
faFileCircleCheck,
faFileLines,
faCog,
faSignOutAlt,
faBell,
} from '@fortawesome/free-solid-svg-icons';

const BursaryFundManagement = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [adminDetails, setAdminDetails] = useState({});
const [amount, setAmount] = useState('');
const [ward, setWard] = useState('');
const navigate = useNavigate();

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

// ✅ Submit funds for a specific ward
  const handleSubmit = async () => {
    if (!amount || !ward) {
      alert('Please select a ward and enter an amount.');
      return;
    }

    try {
      await axios.post('https://e-bursary-backend.onrender.com/api/bursary-funds', {
        ward,
        ward_amount: amount,
      });
      alert(`Funds for ${ward} ward disbursed successfully!`);
      setAmount('');
      setWard('');
    } catch (error) {
      console.error('Error disbursing funds:', error);
      alert('Error submitting funds. Please try again.');
    }
  };

  // ✅ Adjust funds for a specific ward
  const handleAdjust = async () => {
    if (!amount || !ward) {
      alert('Please select a ward and enter an amount.');
      return;
    }

    try {
      await axios.put('https://e-bursary-backend.onrender.com/api/adjust-funds', {
        ward,
        ward_amount: amount,
      });
      alert(`Funds for ${ward} ward adjusted successfully!`);
      setAmount('');
      setWard('');
    } catch (error) {
      console.error('Error adjusting funds:', error);
      alert('Error adjusting funds. Please try again.');
    }
  };

const navItems = [
{ icon: faHouse, label: 'Dashboard', to: '/admindashboard' },
{ icon: faUserGear, label: 'User Management', to: '/usermanagement' },
{ icon: faBank, label: 'Bursary Management', to: '/bursarymanagement' },
{ icon: faDisplay, label: 'Application Monitoring', to: '/monitoring' },
{ icon: faChartLine, label: 'Analysis', to: '/adminreport' },
{ icon: faClipboardList, label: 'Audit Logs', to: '/auditlogs' },
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
<h2 className="mr-1 md:mr-5 text-sm md:text-lg font-bold text-[#14213d]">
Welcome: {adminDetails.name || 'Admin'}
</h2>
<div className="flex items-center space-x-2">
<img
src="/images/patient.png"
alt="Admin"
className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-2 md:mr-20"
/>
<FontAwesomeIcon icon={faBell} className="text-xl" />
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
${sidebarActive ? 'md:w-[260px] md:p-4' : 'md:w-[36px] md:p-2'}
`}
>
<div className="hidden md:flex justify-end mb-4">
<FontAwesomeIcon
icon={faBars}
className={`text-white cursor-pointer text-xl ${sidebarActive ? 'ml-auto' : 'mr-1'}`}
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
<FontAwesomeIcon icon={item.icon} className="text-xl" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'
}`}
>
{item.label}
</span>
</Link>

{!sidebarActive && (
<span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-[220px] flex items-center justify-center z-50">
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
<FontAwesomeIcon icon={item.icon} className="text-xl" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'
}`}
>
{item.label}
</span>
</a>

{!sidebarActive && (
<span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-[120px] flex items-center justify-center z-50">
{item.label}
</span>
)}
</li>
))}
</ul>

</div>

{/* Main Content */}
<div className={`flex-1 ml-0 md:ml-64 p-2 md:p-4 -mt-12 md:-mt-10 transition-all duration-100 pr-2 pl-2 md:pr-10 md:pl-10
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[0px] md:ml-[30px]'}
`}>
<div className="max-w-xl mx-auto backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3  mt-10">
<h2 className="text-2xl font-bold mb-6 text-center text-[#14213d]">Fund Allocation</h2>

<div className="mb-6">
<label
htmlFor="amount"
className="block font-medium text-[#14213d] mb-2"
>
Amount Disbursed
</label>
<input
id="amount"
type="number"
className="form-input px-4 py-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black-400"
value={amount}
placeholder="Enter amount disbursed"
min="0"
onChange={(e) => setAmount(e.target.value)}
/>
<p className=" text-[#14213d] mt-1">
Please enter the total funds received for allocation.
</p>
</div>

{/* ✅ Ward Dropdown */}
<div className="mb-3">
  <label htmlFor="ward" className="block font-medium text-[#14213d] mb-1">
    Ward
  </label>
  <select
    id="ward"
    className="form-select w-full px-3 py-2 border border-gray-300 rounded"
    value={ward}
    onChange={(e) => setWard(e.target.value)}
    required
  >
    <option value="">Select Ward</option>
    {[
      "Kanamkemer", "Kerio Delta", "Kang’atotha", "Kalokol", "Lodwar Township",
      "Lokori/Kochodin", "Katilia", "Kapedo/Napeitom", "Kaputir", "Katilu", "Lobokat",
      "Lokichar", "Kalapata", "Lokiriama/Lorengipi", "Lobei/Kotaruk", "Loima", "Turkwel",
      "Kaeris", "Kaaleng/Kaikor", "Lake Zone", "Kibish", "Nakalale", "Lapur", "Letea",
      "Kalobeyei", "Kakuma", "Lopur", "Songot"
    ].map((w, i) => (
      <option key={i} value={w}>{w}</option>
    ))}
  </select>
</div>


<div className="flex gap-3">
<button
className="bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-blue-300 text-white px-6 py-2 rounded font-semibold"
onClick={handleSubmit}
disabled={!amount}
>
Submit
</button>
<button
className="bg-gray-600 hover:bg-gray-700 cursor-pointer disabled:bg-gray-300 text-white px-6 py-2 rounded font-semibold"
onClick={handleAdjust}
disabled={!amount}
>
Adjust
</button>
</div>
</div>

</div>
</div>
</div>
);
}

export default BursaryFundManagement;