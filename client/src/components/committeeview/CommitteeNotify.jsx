import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faHouse, faUser, faUsers, faBell, faChartBar, faCog, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

const CommitteeNotify = () => {
  const [loading, setLoading] = useState(true);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchStatus = async () => {
      try {
        // Fetch committee info and status_message
        const res = await axios.get(
          'https://e-bursary-backend.onrender.com/api/committee/status-message',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatusMessage(res.data.status_message || '');
        setIsNew(res.data.is_new || false);

        // Fetch committee name and gender for top bar
        const profileRes = await axios.get(
          'https://e-bursary-backend.onrender.com/api/profile-committee',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCommitteeDetails(profileRes.data || {});

        // Optional: Mark as read after displaying
        if (res.data.is_new) {
          await axios.post(
            'https://e-bursary-backend.onrender.com/api/committee/status-message/read',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsNew(false);
        }
      } catch (err) {
        console.error('Error fetching committee status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-2.5 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#14213d]">EBursary</h1>
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-[#14213d]">
              Welcome: {committeeDetails.name || sessionStorage.getItem('userName')}
            </h2>
            <img
              src={
                committeeDetails.gender === 'Female'
                  ? '/images/woman.png'
                  : committeeDetails.gender === 'Male'
                  ? '/images/patient.png'
                  : '/images/user.png'
              }
              alt="User"
              className="rounded-full w-7 h-7 md:w-9 md:h-9"
            />
            <div className="block md:hidden">
              <FontAwesomeIcon
                icon={faBars}
                className="text-xl cursor-pointer"
                onClick={toggleSidebar}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row pt-20 min-h-screen">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14 transition-all duration-100 ease-in-out
            ${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
            ${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[36px] md:p-2'}`}
        >
          <ul className="flex flex-col h-full mt-6 space-y-10">
            {navItems.map((item, index) => (
              <li key={index}>
                {item.isLogout ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const token = sessionStorage.getItem('authToken');
                      axios.post('https://e-bursary-backend.onrender.com/api/logout', {}, {
                        headers: { Authorization: `Bearer ${token}` }
                      }).finally(() => {
                        sessionStorage.clear();
                        navigate('/');
                      });
                    }}
                    className="flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link to={item.to} className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                    {item.label === 'Notification' && isNew && (
                      <span className="ml-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="flex-1 ml-0 md:ml-64 md:p-4 mt-2">
          <div className="backdrop-blur-xl bg-white/80 border shadow-xl rounded-2xl max-w-[800px] mx-auto p-6">
            <h2 className="text-xl font-bold text-[#14213d] mb-4">Committee Status Message</h2>

            {loading ? (
              <div className="text-center text-gray-600">Loading status message...</div>
            ) : statusMessage ? (
              <div className={`mb-4 p-4 rounded-lg border-l-4 ${isNew ? 'bg-yellow-100 border-yellow-400 text-yellow-900' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
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
