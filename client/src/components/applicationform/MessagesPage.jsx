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

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

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

    // Fetch student details
    axios.get('https://e-bursary-backend.onrender.com/api/student', {
      headers: { Authorization: token }
    })
    .then(res => {
      setStudentDetails(res.data);
      setLoading(false);
    })
    .catch(() => setLoading(false));

    // Check document upload status
    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, {
        headers: { Authorization: token }
      })
      .then(res => setDocumentUploaded(res.data?.uploaded || false))
      .catch(() => setDocumentUploaded(false));
    }
  }, [navigate]);

  // ✅ Fetch status message & "is_new" flag
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token) return;

    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, {
        headers: { Authorization: token }
      })
      .then(response => {
        const { status_message, is_new } = response.data;
        setStatusMessage(status_message);
        setHasNewMessage(is_new);
        sessionStorage.setItem("hasNewMessage", is_new ? "true" : "false");
        setLoading(false);
      })
      .catch(() => {
        setStatusMessage('No status message available.');
        setHasNewMessage(false);
        setLoading(false);
      });
    }
  }, [navigate]);

  // ✅ Mark message as read when page loads
useEffect(() => {
  const token = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('userId');
  if (!token || !userId) return;

  axios.put(
    `https://e-bursary-backend.onrender.com/api/status-message/user/${userId}/read`,
    {},
    { headers: { Authorization: token } }
  )
  .then(() => {
    setHasNewMessage(false);  // frontend update
    sessionStorage.setItem("hasNewMessage", "false"); // persist
  })
  .catch(err => console.error("Error marking message as read:", err));
}, []);

// Ensures the proper step navigation on sidebar 'Apply' click
  const handleApplyClick = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/personaldetails');
      return;
    }
    try {
      const res = await axios.get(`https://e-bursary-backend.onrender.com/api/personal-details/user/${userId}`);
      if (res.data && res.data.user_id) {
        // Details exist, go to Amountdetails
        navigate('/Amountdetails');
      } else {
        // No details, force personal details page
        navigate('/personaldetails');
      }
    } catch {
      navigate('/personaldetails');
    }
  };

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
    icon={sidebarActive ? faTimes : faBars}
    className={`text-white cursor-pointer text-[1.5rem] ${
      sidebarActive ? 'ml-auto' : 'mr-2'
    }`}
    onClick={toggleSidebar}
  />
</div>



  {/* Navigation */}
<ul className="flex flex-col h-full mt-6 space-y-10">
  {[
    {
      icon: faHouse,
      label: 'Dashboard',
      to: '/studentdashboard'
    },
    {
      icon: faFileAlt,
      label: 'Apply',
      isButton: true,
      onClick: handleApplyClick,
      disabled: documentUploaded
    },
    {
      icon: faDownload,
      label: 'Report',
      to: '/studentreport'
    },
    {
      icon: faBell,
      label: 'Notification',
      to: '/messages'
    },
    {
      icon: faCog,
      label: 'Settings',
      to: '/studentsetting'
    },
    {
      icon: faSignOutAlt,
      label: 'Logout',
      isLogout: true
    }
  ].map((item, index) => (
    <li className={`group relative ${item.isLogout ? 'mt-30 md:mt-55' : ''}`} key={index}>
      
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
                setDocumentUploaded(false);
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
      ) : item.isButton ? (
        <a
          href="#"
          onClick={item.disabled ? undefined : item.onClick}
          className={`flex items-center space-x-2 transition-all duration-200 ${
            sidebarActive ? 'justify-start' : 'justify-center'
          } ${item.disabled ? 'pointer-events-none opacity-60 cursor-not-allowed' : ''}`}
          aria-disabled={item.disabled ? 'true' : 'false'}
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
          <div className="relative">
            <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
            {item.label === 'Notification' && hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
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
