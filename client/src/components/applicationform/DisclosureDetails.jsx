import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faHouse,
faFileAlt,
faPaperclip,
faDownload,
faComments,
faCog,
faSignOutAlt,
faBars,
faBell,
} from '@fortawesome/free-solid-svg-icons';

const DisclosureDetails = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [userName, setUserName] = useState('');
const [formData, setFormData] = useState({
bursary: '',
bursarysource: '',
bursaryamount: '',
helb: '',
granted: '',
noreason: '',
});

const navigate = useNavigate();

const handleChange = (e) => {
const { name, value, type } = e.target;
setFormData({
...formData,
[name]: value
});
};

const toggleSidebar = () => setSidebarActive(!sidebarActive);

const handleSubmit = (e) => {
e.preventDefault();
const userId = sessionStorage.getItem('userId');
if (!userId) {
alert('User ID not found. Please complete personal details first.');
return;
}
const dataWithUserId = { ...formData, userId };
axios.post('https://e-bursary-backend.onrender.com/api/disclosure-details', dataWithUserId)
.then(response => {
alert('Data inserted successfully');
navigate('/studentdashboard');
})
.catch(error => {
console.error('There was an error inserting the data!', error);
});
};

useEffect(() => {
const token = sessionStorage.getItem('authToken');
const name = sessionStorage.getItem('userName');
if (!token) {
navigate('/signin');
} else {
setUserName(name);
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
Welcome: {userName}
</h2>
<div className="flex items-center space-x-2">
<img
src="/images/patient.png"
alt="User"
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
<Link to="/student" className={`
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
{/* Apply */}
<li className="relative group">
<div className="flex items-center">
<Link to="/personaldetails" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Apply</span>
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
Apply
</span>
</div>
</li>
{/* File attached */}
<li className="relative group">
<div className="flex items-center">
<Link to="/documentupload" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faPaperclip} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>File attached</span>
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
File attached
</span>
</div>
</li>
{/* Download Report */}
<li className="relative group">
<div className="flex items-center">
<Link to="/studentreport" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faDownload} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Report</span>
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
Report
</span>
</div>
</li>
{/* Messages */}
<li className="relative group">
<div className="flex items-center">
<Link to="#" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faComments} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Messages</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[35px] h-[35px] block
${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
`}>
Messages
</span>
</div>
</li>
{/* Settings */}
<li className="relative group">
<div className="flex items-center">
<Link to="/studentsetting" className={`
flex items-center w-full space-x-2 text-white no-underline
transition-all duration-200
${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
`}>
<FontAwesomeIcon icon={faCog} className="text-[1.2rem] md:text-[1.4rem]" />
<span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[2px] md:ml-[10px]' : 'hidden'}`}>Settings</span>
</Link>
<span className={`
absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
text-center shadow-lg transition-all duration-300 ease-in-out
opacity-0 group-hover:opacity-100
pointer-events-none group-hover:pointer-events-auto
leading-[35px] h-[35px] block
${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
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

{/* Main Content Area */}
<div className={`flex-1 ml-10 md:ml-25 p-4 transition-all duration-300`}>
<div className="bg-white rounded-lg  max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto  -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
<h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
<h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Other Disclosure</h2>
<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
<div>
<label className="block font-medium mb-2">Are you currently receiving any other bursaries or scholarships?</label>
<div className="flex flex-col space-y-2">
<label className="flex items-center">
<input type="radio" name="bursary" value="yes" checked={formData.bursary === "yes"} onChange={handleChange} className="mr-2" />
Yes
</label>
<label className="flex items-center">
<input type="radio" name="bursary" value="no" checked={formData.bursary === "no"} onChange={handleChange} className="mr-2" />
No
</label>
</div>
</div>
<div>
<label htmlFor="bursarysource" className="block font-medium mb-2">If yes, state the source:</label>
<input type="text" id="bursarysource" name="bursarysource" value={formData.bursarysource} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter the source" />
</div>
<div>
<label htmlFor="bursaryamount" className="block font-medium mb-2">State the amount in Ksh:</label>
<input type="text" id="bursaryamount" name="bursaryamount" value={formData.bursaryamount} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter amount in Ksh" />
</div>
<div>
<label className="block font-medium mb-2">Have you applied for financial support from HELB?</label>
<div className="flex flex-col space-y-2">
<label className="flex items-center">
<input type="radio" name="helb" value="Yes" checked={formData.helb === "Yes"} onChange={handleChange} className="mr-2" />
Yes
</label>
<label className="flex items-center">
<input type="radio" name="helb" value="No" checked={formData.helb === "No"} onChange={handleChange} className="mr-2" />
No
</label>
</div>
</div>
<div>
<label htmlFor="granted" className="block font-medium mb-2">If yes, state the outcome and reasons for grant:</label>
<textarea id="granted" name="granted" value={formData.granted} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter reasons"></textarea>
</div>
<div>
<label htmlFor="noreason" className="block font-medium mb-2">If no, state the reasons:</label>
<textarea id="noreason" name="noreason" value={formData.noreason} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter reasons"></textarea>
</div>
</form>
<div className="flex justify-end mt-8">
<button
type="submit"
onClick={handleSubmit}
className="bg-blue-600 text-white px-10 py-2 min-w-[100px] md:min-w-[160px] rounded hover:bg-blue-700 transition duration-200"
>
Next
</button>
</div>
</div>
</div>
</div>
</div>
);
};

export default DisclosureDetails;