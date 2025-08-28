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

  // Sidebar navigation items
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
    <div className="w-full min-h-screen relative">
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
            {/* Sidebar toggle only visible on small screens */}
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

      <div className="flex pt-20 min-h-screen">
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
          {/* Toggle Button for Desktop View */}
          <div className="hidden md:flex justify-end mb-4">
            <FontAwesomeIcon
              icon={faBars}
              className={`text-white cursor-pointer text-[1.5rem] ${sidebarActive ? 'ml-auto' : 'mr-2'}`}
              onClick={toggleSidebar}
            />
          </div>

          {/* Navigation */}
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
        <div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
          ${sidebarActive ? 'ml-[0px] md:ml-[190px]' : 'ml-[5px] md:ml-[30px]'}
        `}>
          {/* Bursary Fund Details & Statistics */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Bursary Fund Details */}
  <div className="w-full mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
    transition-all duration-300 transform hover:scale-[1.01] p-3">
    <h2 className="text-center text-1xl md:text-2xl font-bold mb-4">Bursary Fund Details</h2>
    <div className="flex flex-col md:flex-row justify-around gap-4">
      <div className="text-center bg-blue-50 border border-blue-200 text-blue-700 shadow-md rounded-2xl p-3 font-semibold w-full">
        <p>Total Funds Available:</p>
        <strong className="text-blue-700 text-3xl">{bursaryAmount}</strong>
      </div>
      <div className="text-center bg-green-50 border border-green-200 text-green-700 shadow-md rounded-2xl p-3 font-semibold w-full">
        <p>Amount Allocated to Students:</p>
        <strong className="text-green-700 text-3xl">{allocatedAmount}</strong>
      </div>
      <div className="text-center bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-md rounded-2xl p-3 font-semibold w-full">
        <p>Remaining Funds:</p>
        <strong className="text-yellow-400 text-3xl">{remainingAmount}</strong>
      </div>
    </div>
  </div>

  {/* Quick Statistics */}
  {/* Quick Statistics */}
<div className="w-full mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl 
  transition-all duration-300 transform hover:scale-[1.01] p-3">
  <h2 className="text-center text-1xl md:text-2xl font-bold mb-4">Quick Statistics</h2>
  
  <div className="flex flex-col md:flex-row justify-around gap-2">
    <div className="text-center bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-md rounded-2xl p-3 font-semibold w-full">
      <p>Pending</p>
      <strong className="text-yellow-500 text-2xl md:text-3xl">{pendingApplications}</strong>
    </div>
    <div className="text-center bg-gray-50 border border-gray-200 text-gray-600 shadow-md rounded-2xl p-3 font-semibold w-full">
      <p>Incomplete</p>
      <strong className="text-gray-500 text-2xl md:text-3xl">{incompleteApplications}</strong>
    </div>
    <div className="text-center bg-indigo-50 border border-indigo-200 text-blue-700 shadow-md rounded-2xl p-3 font-semibold w-full">
      <p>Total Student</p>
      <strong className="text-blue-500 text-2xl md:text-3xl">{totalApplications}</strong>
    </div>
    <div className="text-center bg-green-50 border border-green-200 text-green-700 shadow-md rounded-2xl p-3 font-semibold w-full">
      <p>Approved</p>
      <strong className="text-green-500 text-2xl md:text-3xl">{approvedApplications}</strong>
    </div>
    <div className="text-center bg-red-50 border border-red-200 text-red-700 shadow-md rounded-2xl p-3 font-semibold w-full">
      <p>Rejected</p>
      <strong className="text-red-500 text-2xl md:text-3xl">{rejectedApplications}</strong>
    </div>
  </div>
</div>
</div>

          {/* Personal Information Table */}
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] w-full max-w-[370px] sm:max-w-[500px] md:max-w-none mx-auto p-2 sm:p-4 md:p-2 ">
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
                      <td className="border border-gray-300 px-2 py-1 md:px-4 md:py-1 text-center">
                        {(item.approved_by_committee && item.approved_by_committee !== userName) ? (
                          <span className="text-gray-500 text-[0.85rem] italic">
                            Approved by {item.approved_by_committee}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;