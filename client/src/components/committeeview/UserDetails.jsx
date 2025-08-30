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
} from '@fortawesome/free-solid-svg-icons';

const UserDetails = () => {
  const [data, setData] = useState([]);
  const [sidebarActive, setSidebarActive] = useState(false);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const loadData = async () => {
    try {
      const response = await axios.get('https://e-bursary-backend.onrender.com/api/personalInformation');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching personal information:', error);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    if (!token) {
      navigate('/signin');
    } else {
      setUserName(name);
      loadData();
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

      loadData();  // Refresh data to show "Approved by" text immediately
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
        <div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10 ${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[60px]'}`}>
          <div className="bg-white w-full max-w-[300px] sm:max-w-[500px] md:max-w-none mx-auto p-2 sm:p-4 md:p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded-md mt-3 md:mt-0">
            <h2 className="text-center text-lg md:text-2xl font-bold mb-3 md:mb-4">Personal Information</h2>
            <div className="overflow-x-auto">
              <table className="min-w-[400px] md:min-w-full w-full border-collapse border border-gray-300 text-sm md:text-base">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2">Full Name</th>
                    <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2">Email</th>
                    <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2">Institution</th>
                    <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2">Admission</th>
                    <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2">Sub County</th>
                    <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2">Reviewed By</th>
                    <th className="border border-gray-300 px-2 py-1 md:px-4 md:py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1">{item.fullname}</td>
                      <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1">{item.email}</td>
                      <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1">{item.institution}</td>
                      <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1">{item.admission}</td>
                      <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1">{item.subcounty}</td>
                      <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1">{item.approved_by_committee || 'Not Reviewed'}</td>
                                     <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1">
                  {(item.approved_by_committee && item.approved_by_committee !== userName) ? (
                    <span className="text-gray-500 text-[0.85rem] italic">
                      Approved by {item.approved_by_committee}
                    </span>
                  ) : (
                    <Link
                      to={`/PersonalInformation/${item.user_id}`}
                      onClick={() => handleApproveStudent(item.user_id)}
                      className="text-blue-500 font-bold text-[0.95rem] hover:text-blue-700"
                    >
                      User Details
                    </Link>
                  )}
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

export default UserDetails;
