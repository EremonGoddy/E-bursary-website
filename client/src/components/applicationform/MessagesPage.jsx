import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faFileAlt,
  faDownload,
  faComments,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';


const StatusMessagePage = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');

    if (!token) {
      navigate('/signin');
      return;
    }

    setUserName(name);

    if (userId) {
      axios
        .get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, {
          headers: { Authorization: token }
        })
        .then(response => {
          setStatusMessage(response.data.status_message);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching status message:', error);
          setStatusMessage('No status message available.');
          setLoading(false);
        });
    }
  }, [navigate]);

  return (
    <div className="w-full min-h-screen relative">
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
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 bg-[#1F2937] h-screen ${sidebarActive ? 'w-[180px] md:w-[210px]' : 'w-[40px] md:w-[50px]'} mt-10 text-white p-4 flex flex-col transition-all duration-300 min-h-screen md:min-h-screen`}
      >
        <FontAwesomeIcon
          icon={faBars}
          className={`text-white ${sidebarActive ? 'transform translate-x-[130px] md:translate-x-[150px]' : ''} text-[1.4rem] md:text-[1.7rem] -ml-2 md:-ml-1.5 mt-4 transition-all duration-300 cursor-pointer self-start`}
          onClick={toggleSidebar}
        />
        <ul className="space-y-10 md:space-y-12 mt-1 md:mt-4 pl-0">
          <li className="list-none mt-[30px] text-center relative group">
            <div className="flex items-center">
              <a href="/student" className={`flex items-center w-full space-x-2 text-white no-underline transition-all duration-200 ${sidebarActive ? 'justify-start md:pl-[10px]' : 'justify-center'}`}>
                <FontAwesomeIcon icon={faHouse} className="text-[1.2rem] md:text-[1.4rem]" />
                <span className={`${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Dashboard</span>
              </a>
            </div>
          </li>
          <li className="relative group">
            <div className="flex items-center">
              <a href="/studentreport" className={`flex items-center w-full ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}`}>
                <FontAwesomeIcon icon={faDownload} className="text-[1.2rem] md:text-[1.4rem]" />
                <span className={`${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Report</span>
              </a>
            </div>
          </li>
          <li className="relative group">
            <div className="flex items-center">
              <a href="/messages" className={`flex items-center w-full ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}`}>
                <FontAwesomeIcon icon={faComments} className="text-[1.2rem] md:text-[1.4rem]" />
                <span className={`${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Messages</span>
              </a>
            </div>
          </li>
          <li className="relative group">
            <div className="flex items-center">
              <a href="/studentsetting" className={`flex items-center w-full ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}`}>
                <FontAwesomeIcon icon={faCog} className="text-[1.2rem] md:text-[1.4rem]" />
                <span className={`${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Settings</span>
              </a>
            </div>
          </li>
          <li className="relative group">
            <div className="flex items-center">
              <a href="/" onClick={() => { sessionStorage.clear(); navigate('/'); }} className={`flex items-center w-full space-x-2 mt-25 md:mt-20 text-white no-underline transition-all duration-200 ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}`}>
                <FontAwesomeIcon icon={faSignOutAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                <span className={`${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Logout</span>
              </a>
            </div>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10 ${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          {loading ? (
            <p className="text-lg text-gray-500 animate-pulse">Loading...</p>
          ) : (
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Application Status Message</h2>
              <p className="text-lg text-gray-800">
                {statusMessage ? statusMessage : 'No status message available.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusMessagePage;
