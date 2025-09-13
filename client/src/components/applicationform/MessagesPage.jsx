import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faFileAlt,
  faTimes,
  faDownload,
  faCog,
  faBell,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

const StatusMessagePage = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  // ✅ Fetch student info & document upload status
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');

    if (!token) {
      navigate('/signin');
      return;
    }

    setUserName(name);
    setLoading(true);

    axios.get('https://e-bursary-backend.onrender.com/api/student', {
      headers: { Authorization: token }
    })
    .then((response) => {
      setStudentDetails(response.data);
      setLoading(false);
    })
    .catch(() => setLoading(false));

    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, {
        headers: { Authorization: token }
      })
      .then((res) => {
        const isUploaded = res.data && res.data.uploaded === true;
        setDocumentUploaded(isUploaded);
      })
      .catch(() => setDocumentUploaded(false));
    }
  }, [navigate]);

  // ✅ Check if there's a new status message
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token) {
      navigate('/signin');
      return;
    }

    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, {
        headers: { Authorization: token }
      })
      .then(response => {
        setStatusMessage(response.data.status_message);
        setHasNewMessage(response.data.is_new); // 👈 use backend is_new
        setLoading(false);
      })
      .catch(() => {
        setStatusMessage('No status message available.');
        setLoading(false);
      });
    }
  }, [navigate]);

  // ✅ Mark message as read when page is opened
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (userId && token) {
      axios.put(
        `https://e-bursary-backend.onrender.com/api/status-message/user/${userId}/read`,
        {},
        { headers: { Authorization: token } }
      )
      .then(() => setHasNewMessage(false)) // clear red dot
      .catch(err => console.error('Error marking message as read:', err));
    }
  }, []);

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#14213d]">EBursary</h1>
          <div className="flex items-center space-x-1">
            <h2 className="mr-5 text-[1rem] md:text-[1.2rem] font-bold text-[#14213d]">
              Welcome: {userName}
            </h2>
            <img
              src={
                studentDetails.gender === 'Female'
                  ? '/images/woman.png'
                  : studentDetails.gender === 'Male'
                  ? '/images/patient.png'
                  : '/images/user.png'
              }
              alt="User"
              className="rounded-full w-9 h-9"
            />
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
          <div className="hidden md:flex justify-end mb-4">
            <FontAwesomeIcon
              icon={sidebarActive ? faTimes : faBars}
              className="text-white cursor-pointer text-[1.5rem]"
              onClick={toggleSidebar}
            />
          </div>

          <ul className="flex flex-col h-full mt-6 space-y-10">
            {[
              { icon: faHouse, label: 'Dashboard', to: '/studentdashboard' },
              { icon: faFileAlt, label: 'Apply', isButton: true, onClick: () => navigate('/personaldetails'), disabled: documentUploaded },
              { icon: faDownload, label: 'Report', to: '/studentreport' },
              { icon: faBell, label: 'Notification', to: '/messages' },
              { icon: faCog, label: 'Settings', to: '/studentsetting' },
              { icon: faSignOutAlt, label: 'Logout', isLogout: true }
            ].map((item, index) => (
              <li key={index} className="group relative">
                {item.isButton ? (
                  <a
                    href="#"
                    onClick={item.disabled ? undefined : item.onClick}
                    className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'} ${item.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
                    {sidebarActive && <span className="ml-2 text-[1rem] md:text-[1.1rem] font-semibold">{item.label}</span>}
                  </a>
                ) : item.isLogout ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const token = sessionStorage.getItem('authToken');
                      axios.post('https://e-bursary-backend.onrender.com/api/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
                      .finally(() => {
                        sessionStorage.clear();
                        setDocumentUploaded(false);
                        navigate('/');
                      });
                    }}
                    className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
                    {sidebarActive && <span className="ml-2 font-semibold">{item.label}</span>}
                  </a>
                ) : (
                  <Link to={item.to} className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}>
                    <div className="relative">
                      <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
                      {item.label === 'Notification' && hasNewMessage && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    {sidebarActive && <span className="ml-2 font-semibold">{item.label}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className={`flex-1 md:ml-25 transition-all mt-2 duration-300 ${sidebarActive ? 'ml-[200px]' : 'ml-[50px]'}`}>
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl max-w-[600px] mx-auto p-8">
            {loading ? (
              <p className="text-lg text-gray-500 animate-pulse">Loading...</p>
            ) : (
              <div className="bg-white p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Application Status Message</h2>
                <p className={`text-lg font-semibold ${
                  (statusMessage || '').toLowerCase().includes('approved') ? 'text-green-600' :
                  (statusMessage || '').toLowerCase().includes('rejected') ? 'text-red-600' :
                  'text-gray-800'
                }`}>
                  {statusMessage || 'No status message available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusMessagePage;
