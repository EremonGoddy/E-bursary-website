import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

// Approval/Rejection with status message
const updateStatus = async (userId, status) => {
  try {
    let statusMessage = '';

    // Set a meaningful status message for each case
    if (status === 'Approved') {
      statusMessage = 'Your bursary application has been approved.';
    } else if (status === 'Rejected') {
      statusMessage = 'Your bursary application has been rejected.';
    } else if (status === 'Incomplete') {
      statusMessage = 'Your bursary application is incomplete. Please update your information.';
    }

    // Send both status and status_message to the backend
    await axios.put(`https://e-bursary-backend.onrender.com/api/update-status/${userId}`, {
      status: status,
      status_message: statusMessage
    });

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
    alert('Failed to update status.');
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

const isAllDataAvailable =
    personalData.length > 0 &&
    amountData.length > 0 &&
    familyData.length > 0 &&
    disclosureData.length > 0 &&
    documentData.length > 0;

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
<h2 className="mr-1 md:mr-5 text-sm md:text-lg font-bold text-[#14213d]">
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
className="text-xl cursor-pointer text-[#14213d]"
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
${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[36px] md:p-2'}
`}
>
<div className="hidden md:flex justify-end mb-4">
<FontAwesomeIcon
icon={faBars}
className={`text-white cursor-pointer text-xl ${sidebarActive ? 'ml-auto' : 'mr-1'}`}
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
<FontAwesomeIcon icon={item.icon} className="text-xl" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'
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
<FontAwesomeIcon icon={item.icon} className="text-xl" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'
}`}
>
{item.label}
</span>
</Link>
)}
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
<div className={`flex-1 ml-0 md:ml-64 p-1 md:p-4 -mt-8 -md:mt-10 transition-all duration-100 pr-1 pl-1 md:pr-10 md:pl-10
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[0px] md:ml-[30px]'}
`}>
{/* Header Info */}
{personalData.length > 0 && (
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] mb-2  p-4 text-center">
<h1 className="text-2xl font-bold text-[#14213d]">{personalData[0].fullname}</h1>
<p className="font-semibold text-[1.1rem] text-[#14213d]">Admission Number: {personalData[0].admission}</p>
<p className="font-semibold text-[1.1rem] text-[#14213d]">Institution: {personalData[0].institution}</p>
</div>
)}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Personal Info */}
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-4  mb-0 md:mb-4">
<h2 className="text-xl font-bold mb-2 text-[#14213d]">Personal Information</h2>
{personalData.map((item) => (
<div key={item.user_id} className="mb-2 space-y-2 text-[#14213d]">
<div><span className="font-bold">Email:</span> {item.email}</div>
<div><span className="font-bold">Sub County:</span> {item.subcounty}</div>
<div><span className="font-bold">Ward:</span> {item.ward}</div>
<div><span className="font-bold">Village:</span> {item.village}</div>
<div><span className="font-bold">Date of Birth:</span> {item.birth}</div>
<div><span className="font-bold">Gender:</span> {item.gender}</div>
<div><span className="font-bold">Institution:</span> {item.institution}</div>
<div><span className="font-bold">Year/Form:</span> {item.year}</div>
<div><span className="font-bold">Admission:</span> {item.admission}</div>
</div>
))}
</div>
{/* Amount Info */}
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-4 mb-4">
<h2 className="text-xl font-bold mb-2 text-[#14213d]">Amount Information</h2>
{amountData.map((item) => (
<div key={item.user_id} className="mb-2 space-y-3 text-[#14213d]">
<div><span className="font-bold">Payable Amount (Words):</span> {item.payable_words}</div>
<div><span className="font-bold">Payable Amount (Figures):</span> {item.payable_figures}</div>
<div><span className="font-bold">Outstanding Amount (Words):</span> {item.outstanding_words}</div>
<div><span className="font-bold">Outstanding Amount (Figures):</span> {item.outstanding_figures}</div>
<div><span className="font-bold">School Account Name:</span> {item.school_accountname}</div>
<div><span className="font-bold">School Account Number:</span> {item.school_accountnumber}</div>
<div><span className="font-bold">School Branch:</span> {item.school_branch}</div>
</div>
))}
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Family Info */}
<div className=" backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-4  mb-0 md:mb-4">
<h2 className="text-xl font-bold mb-2 text-[#14213d]">Family Information</h2>
{familyData.map((item) => (
<div key={item.user_id} className="mb-2 space-y-2 text-[#14213d]">
<div><span className="font-bold">Family Status:</span> {item.family_status}</div>
<div><span className="font-bold">Disability Issue:</span> {item.disability}</div>
<div><span className="font-bold">Parent/Guardian Name:</span> {item.parent_guardian_name}</div>
<div><span className="font-bold">Relationship:</span> {item.relationship}</div>
<div><span className="font-bold">Contact Information:</span> {item.contact_info}</div>
<div><span className="font-bold">Occupation:</span> {item.occupation}</div>
<div><span className="font-bold">Guardian Children:</span> {item.guardian_children}</div>
<div><span className="font-bold">Working Siblings:</span> {item.working_siblings}</div>
<div><span className="font-bold">Studying Siblings:</span> {item.studying_siblings}</div>
<div><span className="font-bold">Monthly Income:</span> {item.monthly_income}</div>
</div>
))}
</div>
{/* Disclosure Info */}
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-4 mb-3 md:mb-4">
<h2 className="text-xl font-bold mb-2 text-[#14213d] ">Disclosure Information</h2>
{disclosureData.map((item) => (
<div key={item.user_id} className="mb-2 text-[#14213d] space-y-3">
<div><span className="font-bold">Bursary Received:</span> {item.receiving_bursary}</div>
<div><span className="font-bold">Bursary Source:</span> {item.bursary_source}</div>
<div><span className="font-bold">Bursary Amount:</span> {item.bursary_amount}</div>
<div><span className="font-bold">Applied HELB:</span> {item.applied_helb}</div>
<div><span className="font-bold">HELB Outcome:</span> {item.helb_outcome}</div>
<div><span className="font-bold">Reason for Not Applying HELB:</span> {item.helb_noreason}</div>
</div>
))}
</div>
</div>
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-4 mb-3 md:mb-4">
<h2 className="text-xl text-[#14213d] font-bold mb-2">Uploaded Documents</h2>
{documentData.map((item) => (
<div key={item.user_id} className="mb-2 text-[#14213d] space-y-3">
<div><span className="font-bold">Document Name:</span> {item.document_name}</div>
<div><span className="font-bold">File Path:</span> {item.file_path}</div>
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
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
<button
  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out
    ${isAllDataAvailable 
      ? 'bg-emerald-600 text-white shadow-[0_5px_0_#064e3b] cursor-pointer hover:bg-emerald-700 hover:translate-y-[-2px] active:translate-y-[3px] active:shadow-[0_2px_0_#064e3b]' 
      : 'bg-gray-400 text-gray-300 cursor-not-allowed'}`}
  onClick={() => updateStatus(id, 'Approved')}
  disabled={!isAllDataAvailable}
>
  Approve Application
</button>


         <button
  className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ease-in-out
    bg-red-600 shadow-[0_5px_0_#7f1d1d] cursor-pointer 
    hover:bg-red-700 hover:translate-y-[-2px] 
    active:translate-y-[3px] active:shadow-[0_2px_0_#7f1d1d]`}
  onClick={() => updateStatus(id, 'Rejected')}
>
  Reject Application
</button>


<button
  className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ease-in-out
    bg-blue-600 shadow-[0_5px_0_#1e3a8a] cursor-pointer 
    hover:bg-blue-700 hover:translate-y-[-2px] 
    active:translate-y-[3px] active:shadow-[0_2px_0_#1e3a8a]`}
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