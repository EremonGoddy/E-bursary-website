import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faFileAlt,
  faPaperclip,
  faDownload,
  faComments,
  faCog,
  faSignOutAlt,
  faBars,
  faBell,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';

const StudentSetting = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Password field visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1: Add state to store student profile
  const [studentProfile, setStudentProfile] = useState({});

  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  // Toggle functions for each field
  const toggleCurrentVisibility = () => setShowCurrent((s) => !s);
  const toggleNewVisibility = () => setShowNew((s) => !s);
  const toggleConfirmVisibility = () => setShowConfirm((s) => !s);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('All password fields are required');
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New password and confirmation do not match');
      setIsError(true);
      return;
    }

    const token = sessionStorage.getItem('authToken');
    if (!token) {
      setMessage('No authentication token found');
      setIsError(true);
      return;
    }

    try {
      const verifyResponse = await axios.get('https://e-bursary-backend.onrender.com/api/verify-password', {
        headers: { Authorization: `Bearer ${token}` },
        params: { password: currentPassword },
      });

      if (verifyResponse.status === 200) {
        const response = await axios.post(
          'https://e-bursary-backend.onrender.com/api/change-password',
          { currentPassword, newPassword },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessage(response.data.message || 'Password updated successfully');
        setIsError(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const errorMessage = error.response?.data || 'Error updating password';
      setMessage(errorMessage);
      setIsError(true);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    if (!token) {
      navigate('/signin');
    } else {
      setUserName(name);
      // Step 2: Fetch student profile for Apply button logic
      axios
        .get('https://e-bursary-backend.onrender.com/api/student', {
          headers: { Authorization: token },
        })
        .then((response) => {
          setStudentProfile(response.data);
        })
        .catch(() => {
          setStudentProfile({});
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
              Welcome: {userName}
            </h2>
            <div className="flex items-center space-x-2">
              <img
                src="/images/patient.png"
                alt="User"
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
                <Link to="/student" className={`
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
            {/* Apply */}
            <li className="relative group">
              <div className="flex items-center">
                {(Object.keys(studentProfile).length > 0) ? (
                  // Disabled Apply button (user already applied)
                  <span
                    className={`
                      flex items-center w-full space-x-2 text-gray-400 no-underline
                      transition-all duration-200 cursor-not-allowed
                      ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                    `}
                    title="You have already applied"
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                    <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Apply</span>
                  </span>
                ) : (
                  // Active Apply link
                  <Link to="/personaldetails" className={`
                    flex items-center w-full space-x-2 text-white no-underline
                    transition-all duration-200
                    ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                  `}>
                    <FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                    <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Apply</span>
                  </Link>
                )}
                <span className={`
                  absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
                  rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
                  text-center shadow-lg transition-all duration-300 ease-in-out
                  opacity-0 group-hover:opacity-100
                  pointer-events-none group-hover:pointer-events-auto
                  leading-[35px] h-[35px] block
                  ${sidebarActive ? 'hidden' : 'block'}
                `}>
                  Apply
                </span>
              </div>
            </li>
            {/* Download Report */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/studentreport" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faDownload} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Report</span>
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
                  Report
                </span>
              </div>
            </li>
            {/* Messages */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="#" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faComments} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Messages</span>
                </Link>
                <span className={`
                  absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
                  rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
                  text-center shadow-lg transition-all duration-300 ease-in-out
                  opacity-0 group-hover:opacity-100
                  pointer-events-none group-hover:pointer-events-auto
                  leading-[35px] h-[35px] block
                  ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
                `}>
                  Messages
                </span>
              </div>
            </li>
            {/* Settings */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/studentsetting" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faCog} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[2px] md:ml-[10px]' : 'hidden'}`}>Settings</span>
                </Link>
                <span className={`
                  absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
                  rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
                  text-center shadow-lg transition-all duration-300 ease-in-out
                  opacity-0 group-hover:opacity-100
                  pointer-events-none group-hover:pointer-events-auto
                  leading-[35px] h-[35px] block
                  ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
                `}>
                  Settings
                </span>
              </div>
            </li>
            {/* Logout */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/" className={`
                  flex items-center w-full space-x-2 mt-25 md:mt-20 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Logout</span>
                </Link>
                <span className={`
                  absolute left-[60px] top-1/2 mt-[0px] md:mt-[38px] -translate-y-1/2
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
        <div className={`flex-1 ml-10 md:ml-30 p-4 transition-all duration-300`}>
          <div className="bg-white rounded-lg  max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto  -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4 relative">
              <div className="relative">
                <label htmlFor="currentPassword" className="block font-medium mb-2">
                  Current Password
                </label>
                <input
                  type={showCurrent ? "text" : "password"}
                  id="currentPassword"
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 pr-12"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <span
                  className="text-[1.3rem] md:text-[1.5rem] mt-8 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-gray-500"
                  onClick={toggleCurrentVisibility}
                  style={{
                    display: 'inline-flex',
                    width: 'auto',
                    padding: '0.5rem',
                  }}
                >
                  <FontAwesomeIcon icon={showCurrent ? faEye : faEyeSlash} />
                </span>
              </div>
              <div className="relative">
                <label htmlFor="newPassword" className="block font-medium mb-2">
                  New Password
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  id="newPassword"
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 pr-12"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <span
                  className="text-[1.3rem] md:text-[1.5rem] mt-8 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-gray-500"
                  onClick={toggleNewVisibility}
                  style={{
                    display: 'inline-flex',
                    width: 'auto',
                    padding: '0.5rem',
                  }}
                >
                  <FontAwesomeIcon icon={showNew ? faEye : faEyeSlash} />
                </span>
              </div>
              <div className="relative">
                <label htmlFor="confirmPassword" className="block font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 pr-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                <span
                  className="text-[1.3rem] md:text-[1.5rem] mt-8 absolute inset-y-0 right-3 inline-flex items-center cursor-pointer text-gray-500"
                  onClick={toggleConfirmVisibility}
                  style={{
                    display: 'inline-flex',
                    width: 'auto',
                    padding: '0.5rem',
                  }}
                >
                  <FontAwesomeIcon icon={showConfirm ? faEye : faEyeSlash} />
                </span>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  Update Password
                </button>
              </div>
            </form>
            {message && (
              <p className={`mt-4 text-center text-[1rem] font-bold md:text-[1.1rem] ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSetting;