import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// FontAwesome imports
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

const CommitteeProfile = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [committeeDetails, setCommitteeDetails] = useState({});
const [userName, setUserName] = useState('');
const [formData, setFormData] = useState({
fullname: '',
email: '',
phone_no: '',
national_id: '',
subcounty: '',
ward: '',
position: '',
});
const [isProfileFetched, setIsProfileFetched] = useState(false);
const [profileExists, setProfileExists] = useState(false);
const navigate = useNavigate();

const toggleSidebar = () => setSidebarActive(!sidebarActive);

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
setIsProfileFetched(true);
const data = response.data;
if (data) {
setFormData(data);
setProfileExists(true);
}
})
.catch((error) => {
console.error('Error fetching profile data:', error);
setIsProfileFetched(true);
setProfileExists(false);
});
}
}, [navigate]);

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
e.preventDefault();
const token = sessionStorage.getItem('authToken');
axios
.post('https://e-bursary-backend.onrender.com/api/profile-form', formData, {
headers: { Authorization: `Bearer ${token}` },
})
.then(() => {
alert('Profile created/updated successfully');
setProfileExists(true);
})
.catch((error) => {
console.error('Error submitting committee data:', error);
alert('Error submitting data. Please try again.');
});
};

// Fetch profile data for top bar greeting
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

{/* Main Content Area */}
<div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
${sidebarActive ? 'ml-[28px] md:ml-[190px]' : 'ml-[40px] md:ml-[30px]'}
`}>
<div className="w-[98%] max-w-[500px] mx-auto bg-white p-8 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded-md mt-0">
{isProfileFetched ? (
profileExists ? (
<div className="">
<h2 className="md:text-2xl text-[1.2rem] font-bold mb-4 text-center">Committee Profile</h2>
<div className="w-full mb-6 space-y-4">
<div className="flex ">
      <span className="text-[1rem] md:text-[1.1rem] font-semibold w-23 md:w-30">Full name:</span>
      <span className="text-[1rem] md:text-[1.1rem] ">{formData.fullname}</span>
    </div>
    <div className="flex">
      <span className="text-[1rem] md:text-[1.1rem]  font-semibold w-23 md:w-30">Email:</span>
      <span className="text-[1rem] md:text-[1.1rem] ">{formData.email}</span>
    </div>
    <div className="flex">
      <span className=" text-[1rem] md:text-[1.1rem]  font-semibold w-23 md:w-30">Phone No:</span>
      <span className="text-[1rem] md:text-[1.1rem] ">{formData.phone_no}</span>
    </div>
    <div className="flex">
      <span className="text-[1rem] md:text-[1.1rem] font-semibold w-23 md:w-30">National ID:</span>
      <span className="text-[1rem] md:text-[1.1rem] ">{formData.national_id}</span>
    </div>
    <div className="flex">
      <span className=" text-[1rem] md:text-[1.1rem] font-semibold w-23 md:w-30">Sub County:</span>
      <span className="text-[1rem] md:text-[1.1rem] ">{formData.subcounty}</span>
    </div>
    <div className="flex">
      <span className="text-[1rem] md:text-[1.1rem] font-semibold w-23 md:w-30">Ward:</span>
      <span className="text-[1rem] md:text-[1.1rem] ">{formData.ward}</span>
    </div>
    <div className="flex">
      <span className="text-[1rem] md:text-[1.1rem] font-semibold w-23 md:w-30">Position:</span>
      <span className="text-[1rem] md:text-[1.1rem] ">{formData.position}</span>
    </div>
  </div>
  <p className="text-center text-green-600 font-semibold">
    Your profile has been successfully updated. You can edit it anytime.
  </p>
</div>
) : (
<div className="profile-box">
<h2 className=" text-[1.2rem] md:text-2xl font-bold mb-4 text-center">Create Profile</h2>
<form onSubmit={handleSubmit}>
<div className="mb-3 flex items-center">
<label className="block font-medium mb-1 w-40 md:w-32 mr-1 md:mr-2">Full name:</label>
<input
type="text"
name="fullname"
className="form-input w-full border rounded px-3 py-1.5 md:py-2"
value={formData.fullname}
placeholder="Enter Fullname"
onChange={handleChange}
required
/>
</div>
<div className="mb-3 flex items-center">
<label className="block font-medium mb-1 w-40 md:w-32 mr-1 md:mr-2">Email:</label>
<input
type="email"
name="email"
className="form-input w-full border rounded px-3 py-1.5 md:py-2"
value={formData.email}
placeholder="Enter Email"
onChange={handleChange}
required
/>
</div>
<div className="mb-3 flex items-center">
<label className="block font-medium mb-1 w-40 md:w-32 mr-1 md:mr-2">Phone No:</label>
<input
type="text"
name="phone_no"
className="form-input w-full border rounded px-3 py-1.5 md:py-2"
value={formData.phone_no}
placeholder="Enter Phone No"
onChange={handleChange}
required
/>
</div>
<div className="mb-3 flex items-center">
<label className="block font-medium mb-1 w-40 md:w-32 mr-1 md:mr-2">National ID:</label>
<input
type="text"
name="national_id"
className="form-input w-full border rounded px-3 py-1.5 md:py-2"
value={formData.national_id}
placeholder="Enter National ID"
onChange={handleChange}
required
/>
</div>
<div className="mb-3 flex items-center">
<label className="block font-medium mb-1 w-40 md:w-32 mr-1 md:mr-2">Sub County:</label>
<input
type="text"
name="subcounty"
className="form-input w-full border rounded  px-3 py-1.5 md:py-2"
value={formData.subcounty}
placeholder="Enter Sub-county"
onChange={handleChange}
required
/>
</div>
<div className="mb-3 flex items-center">
<label className="block font-medium mb-1 w-40 md:w-32 mr-1 md:mr-2">Ward:</label>
<input
type="text"
name="ward"
className="form-input w-full border rounded   px-3 py-1.5 md:py-2"
value={formData.ward}
placeholder="Enter Ward"
onChange={handleChange}
required
/>
</div>
<div className="mb-3 flex items-center">
<label className="block font-medium mb-1 w-40 md:w-32 mr-1 md:mr-2">Position:</label>
<input
type="text"
name="position"
className="form-input w-full border rounded  px-3 py-1.5 md:py-2"
value={formData.position}
placeholder="Enter Position"
onChange={handleChange}
required
/>
</div>
<div className="text-center">
<button type="submit" className="w-full bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700 font-semibold">Submit</button>
</div>
</form>
</div>
)
) : (
<p className="text-center">Loading...</p>
)}
</div>
</div>
</div>
</div>
);
};

export default CommitteeProfile;