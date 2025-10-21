import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,CategoryScale,LinearScale,BarElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faBars,
faHouse,
faUserGear,
faBank,
faFileAlt,
faChartBar,
faChartLine,
faFileLines,
faCog,
faDisplay,
faClipboardList,
faSignOutAlt,
faBell,
faDownload,
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(
ArcElement,
Tooltip,
Legend,
CategoryScale,
LinearScale,
BarElement,
ChartDataLabels
);

const AdminReport = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [adminDetails, setAdminDetails] = useState({});
const [bursaryInfo, setBursaryInfo] = useState({});
const [bursaryAmount, setBursaryAmount] = useState(0);
const [allocatedAmount, setAllocatedAmount] = useState(0);
const [remainingAmount, setRemainingAmount] = useState(0);
const [totalApplications, setTotalApplications] = useState(0);
const [approvedApplications, setApprovedApplications] = useState(0);
const [rejectedApplications, setRejectedApplications] = useState(0);
const [pendingApplications, setPendingApplications] = useState(0);
const [incompleteApplications, setIncompleteApplications] = useState(0);
const [applicationInfo, setApplicationInfo] = useState({});
const navigate = useNavigate();

const toggleSidebar = () => setSidebarActive(!sidebarActive);


useEffect(() => {
const token = sessionStorage.getItem('authToken');
if (!token) {
navigate('/signin');
return;
}

axios
.get('https://e-bursary-backend.onrender.com/api/committee-count')
.then((response) => {
setBursaryInfo({
totalFunds: response.data.amount,
allocated: response.data.allocated,
remaining: response.data.remaining,
});
})
.catch((error) => console.error('Error fetching bursary info:', error));

axios
.get('https://e-bursary-backend.onrender.com/api/quick-statistics')
.then((response) => {
setApplicationInfo({
total: response.data.total,
approved: response.data.approved,
rejected: response.data.rejected,
});
})
.catch((error) => console.error('Error fetching application statistics:', error));

axios
.get('https://e-bursary-backend.onrender.com/api/admin-details')
.then((response) => {
setAdminDetails({
name: response.data.name,
email: response.data.email,
});
})
.catch((error) => console.error('Error fetching admin details:', error));
}, [navigate]);

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

const approvedPercentage = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
const rejectedPercentage = totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0;
const pendingPercentage = totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0;
const incompletePercentage = totalApplications > 0 ? (incompleteApplications / totalApplications) * 100 : 0;

const chartData = {
labels: ['Approved', 'Rejected', 'Pending', 'Incomplete'],
datasets: [
{
data: [approvedPercentage, rejectedPercentage, pendingPercentage, incompletePercentage],
backgroundColor: [
"#A5D6A7", // soft modern green
"#EF9A9A", // soft modern red
"#FFF59D", // soft modern yellow
"#90CAF9"  // soft modern blue
],
borderColor: [
"#2E7D32", // deep green
"#C62828", // deep red
"#F9A825", // deep yellow
"#1565C0"  // deep blue
],
borderWidth: 2,
hoverBackgroundColor: [
"#66BB6A", // brighter green hover
"#E57373", // brighter red hover
"#FFD54F", // brighter yellow hover
"#64B5F6"  // brighter blue hover
],
hoverBorderColor: [
"#1B5E20", // strongest green
"#B71C1C", // strongest red
"#F57F17", // strongest yellow
"#0D47A1"  // strongest blue
],
},
],
};

const chartOptions = {
plugins: {
legend: { display: false },  // ✅ hides the Pie chart legend
datalabels: {
color: '#000',
formatter: (value) => `${value.toFixed(2)}%`,
font: {
weight: 'bold',
size: 15,
},
},
},
};


// Bar chart config
const barData = {
labels: ['Approved', 'Rejected', 'Pending', 'Incomplete'],
datasets: [
{
label: 'Applications',
data: [approvedApplications, rejectedApplications, pendingApplications, incompleteApplications],
backgroundColor: [
"#A5D6A7", // soft modern green
"#EF9A9A", // soft modern red
"#FFF59D", // soft modern yellow
"#90CAF9"  // soft modern blue
],
borderColor: [
"#2E7D32", // deep green
"#C62828", // deep red
"#F9A825", // deep yellow
"#1565C0"  // deep blue
],
borderWidth: 2,
barThickness: 60,
},
],
};

const barOptions = {
responsive: true,
maintainAspectRatio: false, // ✅ allows bars to scale freely within container
plugins: {
legend: { display: false },
datalabels: {
color: '#000',
font: { weight: 'bold', size: 14 },
},
},
scales: {
x: {
ticks: {
color: '#000',
font: { size: 14, weight: 'bold' },
},
grid: { display: false },
// ✅ Increase bar thickness here
barPercentage: 1.0,   // increase up to 1.0 (default 0.9)
categoryPercentage: 0.6, // lower this (e.g., 0.5) makes bars thicker
},
y: {
beginAtZero: true,
ticks: {
stepSize: 1,
color: '#000',
font: { size: 14, weight: 'bold' },
},
// ✅ Reduce the max value to make bars visually taller
suggestedMax: Math.max(
approvedApplications,
rejectedApplications,
pendingApplications,
incompleteApplications
) * 1.2, // adjust multiplier for desired height
},
},
};


const downloadReport = () => {
const doc = new jsPDF();

doc.setFont('times', 'normal');
doc.setFontSize(25);
doc.text('Bursary Report', 105, 20, null, null, 'center');
doc.setFontSize(20);
doc.text('Generated by Bursary Management System', 105, 30, null, null, 'center');
doc.line(10, 35, 200, 35);

const personalInfo = [
['Full Name', adminDetails.name || 'N/A'],
['Email', adminDetails.email || 'N/A'],
];

autoTable(doc, {
startY: 50,
head: [['Personal Information', 'Details']],
body: personalInfo,
theme: 'striped',
headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontSize: 14 },
bodyStyles: { fontSize: 12 },
styles: { font: 'times' },
});

const bursaryData = [
['Total Funds Available', bursaryInfo.totalFunds || 'N/A'],
['Allocated Funds', bursaryInfo.allocated || 'N/A'],
['Remaining Funds', bursaryInfo.remaining || 'N/A'],
];

autoTable(doc, {
startY: doc.lastAutoTable.finalY + 10,
head: [['Bursary Information', 'Details']],
body: bursaryData,
theme: 'grid',
headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255], fontSize: 14 },
bodyStyles: { fontSize: 12 },
styles: { font: 'times' },
});

const applicationData = [
['Total Applications', applicationInfo.total || 'N/A'],
['Approved Applications', applicationInfo.approved || 'N/A'],
['Rejected Applications', applicationInfo.rejected || 'N/A'],
];

autoTable(doc, {
startY: doc.lastAutoTable.finalY + 10,
head: [['Application Information', 'Details']],
body: applicationData,
theme: 'grid',
headStyles: { fillColor: [192, 57, 43], textColor: [255, 255, 255], fontSize: 14 },
bodyStyles: { fontSize: 12 },
styles: { font: 'times' },
});

const declarationInfo = [
['Declaration', 'I hereby confirm the above details are accurate and complete.'],
['Committee Member Name', '________________________'],
['Signature', '________________________'],
['Date', '________________________'],
];

autoTable(doc, {
startY: doc.lastAutoTable.finalY + 20,
head: [['Declaration', '']],
body: declarationInfo,
theme: 'grid',
headStyles: { fillColor: [192, 57, 43], textColor: [255, 255, 255], fontSize: 14 },
bodyStyles: { fontSize: 12, halign: 'left' },
styles: { font: 'times' },
});

doc.setFontSize(10);
doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 290);
doc.text('Bursary Management System', 105, 290, null, null, 'center');

doc.save('Bursary_Report.pdf');
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
<div className={`flex-1 p-1 sm:p-4 -mt-10 md:-mt-4 transition-all duration-200 overflow-y-auto overflow-x-hidden 
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-0 md:ml-[30px]'}`}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Bursary Fund Details */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-xl font-bold text-[#14213d] text-center mb-4">
Bursary Fund Details
</h2>

<div className="flex flex-col gap-4 md:flex-row md:justify-around md:gap-6">
{/* Total Funds Available */}
<div className="flex-1 text-center  border-3 border-[#1565C0] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#1565C0] font-semibold mb-1">Total Funds Available</p>
<strong className="text-[#1565C0] text-xl">{bursaryAmount}</strong>
</div>

{/* Allocated to Students */}
<div className="flex-1 text-center  border-3 border-[#2E7D32] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#2E7D32] font-semibold mb-1">Allocated to Students</p>
<strong className="text-[#2E7D32] text-xl">{allocatedAmount}</strong>
</div>

{/* Remaining Funds */}
<div className="flex-1 text-center  border-3 border-[#F9A825] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#F9A825] font-semibold mb-1">Remaining Funds</p>
<strong className="text-[#F9A825] text-xl">{remainingAmount}</strong>
</div>
</div>
</div>

{/* Quick Statistics */}
<div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-xl font-bold text-[#14213d] text-center mb-4">
Quick Statistics
</h2>

<div className="flex flex-col gap-4 md:flex-row md:justify-around md:gap-3">
{/* Pending */}
<div className="flex-1 text-center  border-3 border-[#F9A825] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#F9A825] font-semibold mb-1">Pending</p>
<strong className="text-[#F9A825] text-xl">{pendingApplications}</strong>
</div>

{/* Incomplete */}
<div className="flex-1 text-center  border-3 border-[#616161] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#424242] font-semibold mb-1">Incomplete</p>
<strong className="text-[#424242] text-xl">{incompleteApplications}</strong>
</div>

{/* Total Student */}
<div className="flex-1 text-center  border-3 border-[#1565C0] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#1565C0] font-semibold mb-1">Total Student</p>
<strong className="text-[#1565C0] text-xl">{totalApplications}</strong>
</div>

{/* Approved */}
<div className="flex-1 text-center  border-3 border-[#2E7D32] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#2E7D32] font-semibold mb-1">Approved</p>
<strong className="text-[#2E7D32] text-xl">{approvedApplications}</strong>
</div>

{/* Rejected */}
<div className="flex-1 text-center  border-3 border-[#C62828] rounded-xl p-3 shadow-md 
transition-transform hover:scale-105">
<p className="text-[#C62828] font-semibold mb-1">Rejected</p>
<strong className="text-[#C62828] text-xl">{rejectedApplications}</strong>
</div>
</div>
</div>
</div>

{/* Charts Section (Pie + Bar) */}
<div className="w-full flex flex-col md:flex-row justify-between gap-6 mt-3 md:mt-0">
{/* Pie Chart Container */}
<div className="w-full md:w-1/2 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">
Approval Status (Pie)
</h2>
<div className="flex flex-col lg:flex-row items-center justify-center gap-0 md:gap-6">
<div className="w-full lg:w-2/3 flex justify-center">
<div className="w-[300px] h-[300px]">
<Pie data={chartData} options={chartOptions} />
</div>
</div>

{/* Vertical Stat Circles */}
<div className="flex flex-col items-start lg:items-start gap-0 md:gap-4 w-full lg:w-auto mt-4 lg:mt-0">
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-green-100 border-3 border-green-500 shadow-md"></div>
<p className="text-green-700 font-bold">
Approved: <span>{approvedApplications}</span>
</p>
</div>
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-red-100 border-3 border-red-500 shadow-md"></div>
<p className="text-red-700 font-bold">
Rejected: <span>{rejectedApplications}</span>
</p>
</div>
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-yellow-100 border-3 border-yellow-500 shadow-md"></div>
<p className="text-yellow-700 font-bold">
Pending: <span>{pendingApplications}</span>
</p>
</div>
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-blue-100 border-3 border-blue-500 shadow-md"></div>
<p className="text-blue-700 font-bold">
Incomplete: <span>{incompleteApplications}</span>
</p>
</div>
</div>
</div>
</div>

{/* Bar Chart Container */}
<div className="w-full md:w-1/2 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
<h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">
Approval Status (Bar)
</h2>
<div className="flex flex-col lg:flex-row items-center justify-center gap-0 md:gap-6">
<div className="w-full lg:w-2/3 flex justify-center">
<div className="w-[330px] h-[300px] md:w-[380px] md:h-[300px]">
<Bar data={barData} options={barOptions} />
</div>
</div>

{/* Vertical Stat Circles */}
<div className="flex flex-col items-start lg:items-start w-full lg:w-auto mt-4 gap-0 md:gap-4 lg:mt-0">
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-green-100 border-3 border-green-500 shadow-md"></div>
<p className="text-green-700 font-bold">
Approved: <span>{approvedApplications}</span>
</p>
</div>
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-red-100 border-3 border-red-500 shadow-md"></div>
<p className="text-red-700 font-bold">
Rejected: <span>{rejectedApplications}</span>
</p>
</div>
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-yellow-100 border-3 border-yellow-500 shadow-md"></div>
<p className="text-yellow-700 font-bold">
Pending: <span>{pendingApplications}</span>
</p>
</div>
<div className="flex items-center gap-3">
<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-blue-100 border-3 border-blue-500 shadow-md"></div>
<p className="text-blue-700 font-bold">
Incomplete: <span>{incompleteApplications}</span>
</p>
</div>
</div>
</div>
</div>
</div>

<div className="max-w-8xl mx-auto backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3  mt-10">
<h1 className="text-2xl font-bold mb-6 text-center text-[#14213d]">Bursary Report</h1>
<table className="table-auto w-full border-collapse border border-gray-300 mb-8">
<thead className="bg-[#14213d]">
<tr>
<th className="border border-gray-300 px-4 py-2 text-white">Reference Number</th>
<th className="border border-gray-300 px-4 py-2 text-white">Application Title</th>
<th className="border border-gray-300 px-4 py-2 text-white">Download Application</th>
</tr>
</thead>
<tbody>
<tr>
<td className="border border-gray-300 px-4 py-2">REF001</td>
<td className="border border-gray-300 px-4 py-2 text-[#14213d]">Admin Report</td>
<td className="border border-gray-300 px-4 py-2 text-center">
<button
className=" text-white px-4 py-2 rounded flex items-center mx-auto"
onClick={downloadReport}
>
<FontAwesomeIcon icon={faDownload} className="mr-2 text-[#14213d] text-xl" /> Download
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
);
};

export default AdminReport;