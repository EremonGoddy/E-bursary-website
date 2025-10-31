// src/components/CommitteeProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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
faEdit,
} from '@fortawesome/free-solid-svg-icons';
import "./Overlay.css";

const CommitteeProfile = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [committeeDetails, setCommitteeDetails] = useState({});
const [userName, setUserName] = useState('');
const [isEditFormVisible, setEditFormVisible] = useState(false);

const [formData, setFormData] = useState({
fullname: '',
email: '',
phone_no: '',
national_id: '',
gender: '',
subcounty: '',
ward: '',
position: '',
});

const [isProfileFetched, setIsProfileFetched] = useState(false);
const [profileExists, setProfileExists] = useState(false);

const navigate = useNavigate();
const toggleSidebar = () => setSidebarActive(!sidebarActive);

// Dropdown options
const subcountyWards = {
"Turkana Central": ["Kanamkemer", "Kerio Delta", "Kang’atotha", "Kalokol", "Lodwar Township"],
"Turkana East": ["Lokori/Kochodin", "Katilia", "Kapedo/Napeitom"],
"Turkana South": ["Kaputir", "Katilu", "Lobokat", "Lokichar", "Kalapata"],
"Loima": ["Lokiriama/Lorengipi", "Lobei/Kotaruk", "Loima", "Turkwel"],
"Turkana North": ["Kaeris", "Kaaleng/Kaikor", "Lake Zone", "Kibish", "Nakalale", "Lapur"],
"Turkana West": ["Letea", "Kalobeyei", "Kakuma", "Lopur", "Songot"],
};

const subcounties = Object.keys(subcountyWards);
const positions = ["Chairperson", "Secretary", "Treasurer", "Member"];

useEffect(() => {
const token = sessionStorage.getItem('authToken');
const name = sessionStorage.getItem('userName');

if (!token) {
navigate('/signin');
} else {
setUserName(name || '');
axios
.get('https://e-bursary-backend.onrender.com/api/profile-committee', {
headers: { Authorization: `Bearer ${token}` },
})
.then((response) => {
setIsProfileFetched(true);
const data = response.data;
if (data) {
setFormData(prev => ({
...prev,
...data
}));
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
headers: {
Authorization: `Bearer ${token}`,
},
})
.then(() => {
alert('Profile created/updated successfully');
setProfileExists(true);
setEditFormVisible(false);
})
.catch((error) => {
console.error('Error submitting committee data:', error);
alert('Error submitting data. Please try again.');
});
};

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
setCommitteeDetails(response.data || {});
})
.catch((error) => {
console.error('Error fetching profile data:', error);
});
}
}, [navigate]);

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
.catch(() => { })
.finally(() => {
sessionStorage.clear();
navigate('/');
});
}}
className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}
>
<FontAwesomeIcon icon={item.icon} className="text-xl" />
<span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>
{item.label}
</span>
</a>
) : (
<Link
to={item.to}
className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}
>
<FontAwesomeIcon icon={item.icon} className="text-xl" />
<span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>
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
<div className={`flex-1 ml-0 md:ml-64 md:p-4 -mt-6 md:-mt-6 ${sidebarActive ? 'ml-[2px] md:ml-[190px]' : 'ml-[0px] md:ml-[30px]'}`}>
<div className="md:w-[98%] w-full backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[500px] mx-auto p-3 md:p-6">
{isProfileFetched ? (
  profileExists ? (
    isEditFormVisible ? (
      // ---------- EDIT FORM ----------
      <form onSubmit={handleSubmit}>
        <h2 className="text-[#14213d] text-2xl font-bold text-center mb-5">
          Edit Profile
        </h2>

        {/* Full Name */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-[#14213d] font-semibold w-[110px]">
            Full Name:
          </label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-[#14213d] font-semibold w-[110px]">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
            required
          />
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-[#14213d] font-semibold w-[110px]">Phone No:</label>
          <input
            type="text"
            name="phone_no"
            value={formData.phone_no}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
            required
          />
        </div>

        {/* Gender */}
        <div className="flex items-center mb-5">
          <label className="text-[#14213d] font-semibold w-[110px]">Gender:</label>
          <div className="flex gap-6">
            {['Male', 'Female'].map((g) => (
              <label className="flex items-center gap-2" key={g}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleChange}
                  className="accent-[#14213d]"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Subcounty Dropdown */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-[#14213d] font-semibold w-[110px]">Subcounty:</label>
          <select
            name="subcounty"
            value={formData.subcounty}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
            required
          >
            <option value="">Select Subcounty</option>
            {subcounties.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Ward Dropdown */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-[#14213d] font-semibold w-[110px]">Ward:</label>
          <select
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
            required
          >
            <option value="">Select Ward</option>
            {(subcountyWards[formData.subcounty] || []).map((ward, i) => (
              <option key={i} value={ward}>{ward}</option>
            ))}
          </select>
        </div>

        {/* Position Dropdown */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-[#14213d] font-semibold w-[110px]">Position:</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
            required
          >
            <option value="">Select Position</option>
            {positions.map((pos, i) => (
              <option key={i} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <button
          type="submit"
          className="text-white w-full py-2 rounded-lg bg-[#14213d] cursor-pointer hover:bg-gray-700"
        >
          Update Profile
        </button>
        <button
          type="button"
          onClick={() => setEditFormVisible(false)}
          className="w-full mt-2 text-[#14213d] cursor-pointer font-semibold border border-[#14213d] py-2 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
      </form>
    ) : (
      // ---------- PROFILE VIEW ----------
      <div className="relative py-2">
        <FontAwesomeIcon icon={faUser} className="text-[#14213d] text-2xl inline-block align-middle mr-2" />
        <h2 className="text-xl font-bold inline-block align-middle text-[#14213d]">Profile</h2>

        <button
          onClick={() => setEditFormVisible(true)}
          className="absolute right-0 top-2 bg-blue-500 cursor-pointer text-white px-1 py-1 md:px-3 md:py-1 font-bold rounded hover:bg-blue-600 flex items-center"
        >
          <FontAwesomeIcon icon={faEdit} className="mr-1 font-bold" /> Edit Profile
        </button>

        <hr className="my-4" />

        <div className="space-y-5 text-[#14213d]">
          {Object.entries(formData).map(([key, value]) => (
            <div className="flex items-start gap-3 md:gap-24" key={key}>
              <span className="w-32 font-bold capitalize">{key.replace('_', ' ')}:</span>
              <span className="flex-1">{String(value ?? '')}</span>
            </div>
          ))}
        </div>
      </div>
    )
  ) : (
    // ---------- CREATE PROFILE ----------
    <form onSubmit={handleSubmit}>
      {/* keep your existing create profile form here */}
    </form>
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
