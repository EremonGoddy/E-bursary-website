import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const PersonalInformation = () => {
const { id } = useParams();
const [committeeDetails, setCommitteeDetails] = useState({});
const navigate = useNavigate();
const [personalData, setPersonalData] = useState([]);
const [amountData, setAmountData] = useState([]);
const [familyData, setFamilyData] = useState([]);
const [disclosureData, setDisclosureData] = useState([]);
const [documentData, setDocumentData] = useState([]);
const [userName, setUserName] = useState('');
const [sidebarActive, setSidebarActive] = useState(false);

const toggleSidebar = () => setSidebarActive(!sidebarActive);

// Data fetch functions
const loadPersonalData = useCallback(async () => {
try {
const response = await axios.get(`https://e-bursary-backend.onrender.com/api/personalInformation/${id}`);
setPersonalData(response.data);
} catch (error) {
console.error('Error fetching personal information:', error);
}
}, [id]);

const loadAmountData = useCallback(async () => {
try {
const response = await axios.get(`https://e-bursary-backend.onrender.com/api/amountInformation/${id}`);
setAmountData(response.data);
} catch (error) {
console.error('Error fetching amount information:', error);
}
}, [id]);

const loadFamilyData = useCallback(async () => {
try {
const response = await axios.get(`https://e-bursary-backend.onrender.com/api/familyInformation/${id}`);
setFamilyData(response.data);
} catch (error) {
console.error('Error fetching family information:', error);
}
}, [id]);

const loadDisclosureData = useCallback(async () => {
try {
const response = await axios.get(`https://e-bursary-backend.onrender.com/api/disclosureInformation/${id}`);
setDisclosureData(response.data);
} catch (error) {
console.error('Error fetching disclosure information:', error);
}
}, [id]);

const loadDocumentData = useCallback(async () => {
try {
const response = await axios.get(`https://e-bursary-backend.onrender.com/api/get-document/${id}`);
setDocumentData(response.data);
} catch (error) {
console.error('Error fetching document information:', error);
}
}, [id]);

useEffect(() => {
loadPersonalData();
loadAmountData();
loadFamilyData();
loadDisclosureData();
loadDocumentData();
}, [loadPersonalData, loadAmountData, loadFamilyData, loadDisclosureData, loadDocumentData]);

// Approval/Rejection
const updateStatus = async (userId, status) => {
try {
await axios.put(`https://e-bursary-backend.onrender.com/api/update-status/${userId}`, { status });
alert(`Application ${status}`);
if (status === 'Approved') {
navigate(`/bursaryallocation/${userId}`);
} else {
loadPersonalData();
loadAmountData();
loadFamilyData();
loadDisclosureData();
loadDocumentData();
}
} catch (error) {
console.error('Error updating status:', error);
}
};

// Fetch profile data when component loads
useEffect(() => {
const token = sessionStorage.getItem('authToken');
const name = sessionStorage.getItem('userName');
if (!token) {
navigate('/signin');
} else {
setUserName(name);
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
<div className="w-full min-h-screen relative bg-white-100">
{/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
<div className="flex items-center space-x-6">
<h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
Welcome:{userName}
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
flex items-center w-full space-x-2 mt-25 md:mt-50 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faSignOutAlt} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Logout</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[0px] md:mt-[98px] -translate-y-1/2
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
{/* Header Info */}
{personalData.length > 0 && (
<div className="mb-4 bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded text-center">
<h1 className="text-2xl font-bold">{personalData[0].fullname}</h1>
<p className="font-semibold text-[1.2rem]">Admission Number: {personalData[0].admission}</p>
<p className="font-semibold text-[1.2rem]">Institution: {personalData[0].institution}</p>
</div>
)}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Personal Info */}
<div className="bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded mb-0 md:mb-4">
<h2 className="text-xl font-bold mb-2">Personal Information</h2>
{personalData.map((item) => (
<div key={item.user_id} className="mb-2">
<div><span className="font-semibold">Email:</span> {item.email}</div>
<div><span className="font-semibold">Sub County:</span> {item.subcounty}</div>
<div><span className="font-semibold">Ward:</span> {item.ward}</div>
<div><span className="font-semibold">Village:</span> {item.village}</div>
<div><span className="font-semibold">Date of Birth:</span> {item.birth}</div>
<div><span className="font-semibold">Gender:</span> {item.gender}</div>
<div><span className="font-semibold">Institution:</span> {item.institution}</div>
<div><span className="font-semibold">Year/Form:</span> {item.year}</div>
<div><span className="font-semibold">Admission:</span> {item.admission}</div>
</div>
))}
</div>
{/* Amount Info */}
<div className="bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded mb-4">
<h2 className="text-xl font-bold mb-2">Amount Information</h2>
{amountData.map((item) => (
<div key={item.user_id} className="mb-2">
<div><span className="font-semibold">Payable Amount (Words):</span> {item.payable_words}</div>
<div><span className="font-semibold">Payable Amount (Figures):</span> {item.payable_figures}</div>
<div><span className="font-semibold">Outstanding Amount (Words):</span> {item.outstanding_words}</div>
<div><span className="font-semibold">Outstanding Amount (Figures):</span> {item.outstanding_figures}</div>
<div><span className="font-semibold">School Account Name:</span> {item.school_accountname}</div>
<div><span className="font-semibold">School Account Number:</span> {item.school_accountnumber}</div>
<div><span className="font-semibold">School Branch:</span> {item.school_branch}</div>
</div>
))}
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Family Info */}
<div className="bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded mb-0 md:mb-4">
<h2 className="text-xl font-bold mb-2">Family Information</h2>
{familyData.map((item) => (
<div key={item.user_id} className="mb-2">
<div><span className="font-semibold">Family Status:</span> {item.family_status}</div>
<div><span className="font-semibold">Disability Issue:</span> {item.disability}</div>
<div><span className="font-semibold">Parent/Guardian Name:</span> {item.parent_guardian_name}</div>
<div><span className="font-semibold">Relationship:</span> {item.relationship}</div>
<div><span className="font-semibold">Contact Information:</span> {item.contact_info}</div>
<div><span className="font-semibold">Occupation:</span> {item.occupation}</div>
<div><span className="font-semibold">Guardian Children:</span> {item.guardian_children}</div>
<div><span className="font-semibold">Working Siblings:</span> {item.working_siblings}</div>
<div><span className="font-semibold">Studying Siblings:</span> {item.studying_siblings}</div>
<div><span className="font-semibold">Monthly Income:</span> {item.monthly_income}</div>
</div>
))}
</div>
{/* Disclosure Info */}
<div className="bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded mb-4">
<h2 className="text-xl font-bold mb-2">Disclosure Information</h2>
{disclosureData.map((item) => (
<div key={item.user_id} className="mb-2">
<div><span className="font-semibold">Bursary Received:</span> {item.receiving_bursary}</div>
<div><span className="font-semibold">Bursary Source:</span> {item.bursary_source}</div>
<div><span className="font-semibold">Bursary Amount:</span> {item.bursary_amount}</div>
<div><span className="font-semibold">Applied HELB:</span> {item.applied_helb}</div>
<div><span className="font-semibold">HELB Outcome:</span> {item.helb_outcome}</div>
<div><span className="font-semibold">Reason for Not Applying HELB:</span> {item.helb_noreason}</div>
</div>
))}
</div>
</div>
<div className="bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded mb-4">
<h2 className="text-xl font-bold mb-2">Uploaded Documents</h2>
{documentData.map((item) => (
<div key={item.user_id} className="mb-2">
<div><span className="font-semibold">Document Name:</span> {item.document_name}</div>
<div><span className="font-semibold">File Path:</span> {item.file_path}</div>
<div>
<a
className="text-blue-500 underline"
href={`https://e-bursary-backend.onrender.com/uploads/${item.document_name}`}
target="_blank"
rel="noopener noreferrer"
>
View Document
</a>
</div>
</div>
))}
</div>
{/* Approval and Rejection Buttons */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<button
className="bg-green-500 hover:bg-green-700 text-white px-4 py-3 rounded font-bold"
onClick={() => updateStatus(id, 'Approved')}
>
Approve Application
</button>
<button
className="bg-red-500 hover:bg-red-700 text-white px-4 py-3 rounded font-bold"
onClick={() => updateStatus(id, 'Rejected')}
>
Reject Application
</button>
<button
className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-3 rounded font-bold"
onClick={() => updateStatus(id, 'Incomplete')}
>
Incomplete Application
</button>
</div>
</div>
</div>
</div>
);
};

export default PersonalInformation;