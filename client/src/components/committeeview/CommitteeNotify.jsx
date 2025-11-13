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
  const [sidebarActive, setSidebarActive] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  // Fetch committee profile info for top bar display
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
    }

    axios
      .get('https://e-bursary-backend.onrender.com/api/profile-committee', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setCommitteeDetails(res.data || {});
      })
      .catch((err) => console.error('Error fetching profile data:', err));
  }, [navigate]);

  // Fetch notifications specific to committee
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    axios
      .get('https://e-bursary-backend.onrender.com/api/notifications/committee', {
        headers: { Authorization: token }
      })
      .then((res) => {
        setNotifications(res.data.notifications || []);
        setLoading(false);

        // Badge alert for new notifications
        const hasUnread = res.data.notifications?.some((n) => !n.is_read);
        setHasNewNotification(hasUnread);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handler for marking notification as read
  const markNotificationRead = async (id) => {
    const token = sessionStorage.getItem('authToken');
    if (!token || !id) return;

    await axios.put(
      `https://e-bursary-backend.onrender.com/api/notifications/committee/${id}/read`,
      {},
      { headers: { Authorization: token } }
    );

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    setHasNewNotification(notifications.some((n) => n.id !== id && !n.is_read));
  };

  // Render icon and color based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />;
      case 'document_edited':
        return <FontAwesomeIcon icon={faUserEdit} className="text-yellow-600 text-xl" />;
      case 'document_uploaded':
        return <FontAwesomeIcon icon={faFileUpload} className="text-blue-600 text-xl" />;
      case 'document_incomplete':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />;
      default:
        return <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-xl" />;
    }
  };

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
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      sidebarActive ? 'justify-start' : 'justify-center'
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>
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
        <div className={`flex-1 ml-0 md:ml-64 md:p-4 mt-0 md:mt-2 transition-all duration-100 md:pr-10 md:pl-10 ${
            sidebarActive ? 'ml-[10px] md:ml-[190px]' : 'ml-[0px] md:ml-[10px]'
          }`}
        >
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[800px] mx-auto p-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#14213d] mb-4">Recent Student Notifications</h2>

            {loading ? (
              <div className="text-center text-gray-600">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-gray-500">No notifications at this time.</div>
            ) : (
              <ul className="space-y-6">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`flex items-center p-4 rounded-lg shadow-md bg-white border-l-4 transition ${
                      notification.is_read ? 'border-gray-300 bg-gray-50' : 'border-blue-400 bg-white'
                    }`}
                  >
                    {/* Icon */}
                    {getNotificationIcon(notification.type)}

                    {/* Content */}
                    <div className="flex-grow ml-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold ${
                            notification.is_read ? 'text-gray-500' : 'text-[#14213d]'
                          }`}
                        >
                          {notification.title ||
                            (notification.type === 'document_completed'
                              ? 'Document Completed'
                              : notification.type === 'document_edited'
                                ? 'Document Edited'
                                : notification.type === 'document_uploaded'
                                  ? 'New Document Uploaded'
                                  : notification.type === 'document_incomplete'
                                    ? 'Incomplete Document Alert'
                                    : 'New Notification')}
                        </span>
                        {!notification.is_read && (
                          <span className="text-xs text-blue-500 font-semibold px-2 py-0.5 bg-blue-100 rounded">
                            New
                          </span>
                        )}
                      </div>

                      <div className="text-gray-700 mt-1 text-sm break-words">
                        {notification.message || notification.description}
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        {notification.student_name} &middot;&nbsp;
                        {new Date(notification.created_at).toLocaleString()}
                      </div>

                      {!notification.is_read && (
                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="mt-3 px-2 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-800 transition"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>

                    {/* Link to student record */}
                    {notification.student_id && (
                      <Link
                        to={`/PersonalInformation/${notification.student_id}`}
                        className="ml-6 text-blue-600 font-bold hover:underline flex items-center space-x-1"
                      >
                        <FontAwesomeIcon icon={faEye} /> <span>View Student</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeNotify;
