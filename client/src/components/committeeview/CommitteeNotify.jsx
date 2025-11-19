import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faUser,
  faUsers,
  faBell,
  faChartBar,
  faCog,
  faSignOutAlt,
  faCheckCircle,
  faUserEdit,
  faFileUpload,
  faTimesCircle,
  faFileAlt,
  faEye
} from '@fortawesome/free-solid-svg-icons';

const CommitteeNotify = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [sidebarActive, setSidebarActive] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

   useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch committee profile info
        const profileRes = await axios.get(
          'https://e-bursary-backend.onrender.com/api/profile-committee',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCommitteeDetails(profileRes.data || {});

        // Fetch status_message
        const statusRes = await axios.get(
          'https://e-bursary-backend.onrender.com/api/committee/status-message',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatusMessage(statusRes.data?.status_message ?? '');
      } catch (err) {
        console.error('Error fetching committee data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const navItems = [
    { icon: faHouse, label: 'Dashboard', to: '/committeedashboard' },
    { icon: faUser, label: 'Profile', to: '/committeeprofile' },
    { icon: faUsers, label: 'Student Info', to: '/userdetails' },
    { icon: faBell, label: 'Notification', to: '/committeenotify' },
    { icon: faChartBar, label: 'Reports', to: '/committeereport' },
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
              Welcome: {committeeDetails.name || sessionStorage.getItem('userName')}
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

      {/* Main layout */}
      <div className="flex flex-col md:flex-row pt-20 min-h-screen">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14 transition-all duration-100 ease-in-out overflow-visible
          ${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
          ${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[36px] md:p-2'}`}
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

   {/* Content */}
        <div className="flex-1 ml-0 md:ml-64 md:p-4 mt-0 md:mt-2 transition-all duration-100 md:pr-10 md:pl-10">
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[800px] mx-auto p-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#14213d] mb-4">Committee Status Message</h2>

            {loading ? (
              <div className="text-center text-gray-600">Loading status message...</div>
            ) : statusMessage ? (
              <div className="mb-4 p-4 bg-yellow-100 text-yellow-900 rounded-lg border-l-4 border-yellow-400">
                {statusMessage}
              </div>
            ) : (
              <div className="text-center text-gray-500">No status message available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeNotify;
