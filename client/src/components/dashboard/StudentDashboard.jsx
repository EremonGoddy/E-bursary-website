import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faFileAlt,
  faDownload,
  faComments,
  faCog,
  faSignOutAlt,
  faBars,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

const StudentDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [studentDetails, setStudentDetails] = useState({});
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const navigate = useNavigate();

  const handleApplyClick = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/personaldetails');
      return;
    }

    try {
      const responses = await Promise.all([
        axios.get(`https://e-bursary-backend.onrender.com/api/personal-details/user/${userId}`),
        axios.get(`https://e-bursary-backend.onrender.com/api/family-details/user/${userId}`),
        axios.get(`https://e-bursary-backend.onrender.com/api/amount-details/user/${userId}`),
        axios.get(`https://e-bursary-backend.onrender.com/api/disclosure-details/user/${userId}`),
        axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`)
      ]);

      const allCompleted = responses.every(res => res.data && Object.keys(res.data).length > 0);

      if (allCompleted) {
        alert("You have completed the application. No further action needed.");
      } else {
        navigate('/personaldetails');
      }
    } catch (err) {
      navigate('/personaldetails');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/signin');
  };

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

    axios.get('https://e-bursary-backend.onrender.com/api/student', {
      headers: { Authorization: token }
    })
      .then(response => {
        setStudentDetails(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate('/signin');
      });

    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`)
        .then(res => setDocumentUploaded(res.data.uploaded === true))
        .catch(() => setDocumentUploaded(false));
    }
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <div className="bg-white p-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">EBursary</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome: {userName}</span>
          <FontAwesomeIcon icon={faBell} />
        </div>
      </div>

      <div className="flex">
        <div className={`bg-gray-800 text-white min-h-screen p-4 ${sidebarActive ? 'w-48' : 'w-12'} transition-all`}>
          <FontAwesomeIcon icon={faBars} onClick={toggleSidebar} className="cursor-pointer mb-8" />
          <ul className="space-y-6">
            <li>
              <Link to="/student">
                <FontAwesomeIcon icon={faHouse} /> {sidebarActive && 'Dashboard'}
              </Link>
            </li>
            <li>
              <a href="#" onClick={handleApplyClick}>
                <FontAwesomeIcon icon={faFileAlt} /> {sidebarActive && 'Apply'}
              </a>
            </li>
            <li>
              <Link to="/studentreport">
                <FontAwesomeIcon icon={faDownload} /> {sidebarActive && 'Report'}
              </Link>
            </li>
            <li>
              <Link to="#">
                <FontAwesomeIcon icon={faComments} /> {sidebarActive && 'Messages'}
              </Link>
            </li>
            <li>
              <Link to="/studentsetting">
                <FontAwesomeIcon icon={faCog} /> {sidebarActive && 'Settings'}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="w-full text-left">
                <FontAwesomeIcon icon={faSignOutAlt} /> {sidebarActive && 'Logout'}
              </button>
            </li>
          </ul>
        </div>

        <div className="flex-1 p-6">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">Bursary Allocated:</h2>
                <p>{studentDetails.bursary ? `${studentDetails.bursary} shillings` : '0.00 shillings'}</p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">Status:</h2>
                <p>{studentDetails.status || 'No Status Available'}</p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-bold">Profile:</h2>
                <p><strong>Full Name:</strong> {studentDetails.fullname}</p>
                <p><strong>Email:</strong> {studentDetails.email}</p>
                <p><strong>School:</strong> {studentDetails.institution}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
