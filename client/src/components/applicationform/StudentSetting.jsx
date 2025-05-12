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
} from '@fortawesome/free-solid-svg-icons';
import "./ApplicationDetails.css";

const StudentSetting = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

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
      const verifyResponse = await axios.get('http://localhost:5000/api/verify-password', {
        headers: { Authorization: `Bearer ${token}` },
        params: { password: currentPassword },
      });

      if (verifyResponse.status === 200) {
        const response = await axios.post(
          'http://localhost:5000/api/change-password',
          { currentPassword, newPassword },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessage(response.data.message);
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
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-100">
      {/* Fixed Top Bar */}
      <div className="topbardetails bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-20">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">EBursary</h1>
          <h2 className="text-lg font-semibold">Welcome: {userName}</h2>
          <div className="flex items-center space-x-2">
            <img
              src="/images/patient.png"
              alt="User"
              className="rounded-full w-10 h-10"
            />
            <FontAwesomeIcon icon={faBell} className="text-3xl" />
          </div>
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex flex-row pt-20">
        {/* Sidebar */}
        <div className={`sidebardetails ${sidebarActive ? 'active' : ''} w-64 text-white p-4 h-full transition-transform`}>
          <div className="flex flex-col">
            <FontAwesomeIcon
              icon={faBars}
              className="text-white text-2xl mb-4 cursor-pointer"
              id="btn"
              onClick={toggleSidebar}
            />
            <ul className="space-y-14 items-center">
              <li>
                <Link to="/student" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faHouse} className="icons text-lg" />
                  <span className="links-name">Dashboard</span>
                </Link>
                <span className="tooltip">Dashboard</span>
              </li>
              <li>
                <Link to="/personaldetails" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faFileAlt} className="icons text-lg" />
                  <span className="links-name">Apply</span>
                </Link>
                <span className="tooltip">Apply</span>
              </li>
              <li>
                <Link to="/documentupload" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faPaperclip} className="icons text-lg" />
                  <span className="links-name">File attached</span>
                </Link>
                <span className="tooltip">File attached</span>
              </li>
              <li>
                <Link to="/report" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faDownload} className="icons text-lg" />
                  <span className="links-name">Download Report</span>
                </Link>
                <span className="tooltip">Download Report</span>
              </li>
              <li>
                <Link to="#" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faComments} className="icons text-lg" />
                  <span className="links-name">Messages</span>
                </Link>
                <span className="tooltip">Messages</span>
              </li>
              <li>
                <Link to="/setting" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCog} className=" icons text-lg" />
                  <span className="links-name">Settings</span>
                </Link>
                <span className="tooltip">Settings</span>
              </li>
              <li>
                <Link to="/" className="flex items-center space-x-2 text-red-500">
                  <FontAwesomeIcon icon={faSignOutAlt} className="icons text-lg" />
                  <span className="links-name">Logout</span>
                </Link>
                <span className="tooltip">Logout</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-details max-w-6xl flex-1 p-4">
          <div className="bg-white p-6 shadow rounded-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block font-medium mb-2">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="detailsbutton rounded">Update Password</button>
            </form>
            {message && (
              <p className={`mt-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSetting;