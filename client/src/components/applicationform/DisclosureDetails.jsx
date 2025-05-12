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
} from '@fortawesome/free-solid-svg-icons';
import "./ApplicationDetails.css";

const DisclosureDetails = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    bursary: '',
    bursarysource: '',
    bursaryamount: '',
    helb: '',
    granted: '',
    noreason: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please complete personal details first.');
      return;
    }
    const dataWithUserId = { ...formData, userId };
    axios.post('http://localhost:5000/api/disclosure-details', dataWithUserId)
      .then(response => {
        alert('Data inserted successfully');
        navigate('/studentdashboard');
      })
      .catch(error => {
        console.error('There was an error inserting the data!', error);
      });
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
            <FontAwesomeIcon icon={faComments} className="text-3xl" />
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
          <h1 className="text-2xl font-bold mb-4">Bursary Application Form</h1>
          <h2 className="text-xl font-semibold mb-6">Other Disclosure</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Are you currently receiving any other bursaries or scholarships?</label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="bursary" value="yes" onChange={handleChange} className="mr-2" />
                  Yes
                </label>
                <label className="flex items-center">
                  <input type="radio" name="bursary" value="no" onChange={handleChange} className="mr-2" />
                  No
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="bursarysource" className="block font-medium mb-2">If yes, state the source:</label>
              <input type="text" id="bursarysource" name="bursarysource" value={formData.bursarysource} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter the source" />
            </div>
            <div>
              <label htmlFor="bursaryamount" className="block font-medium mb-2">State the amount in Ksh:</label>
              <input type="text" id="bursaryamount" name="bursaryamount" value={formData.bursaryamount} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter amount in Ksh" />
            </div>
            <div>
              <label className="block font-medium mb-2">Have you applied for financial support from HELB?</label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="helb" value="Yes" onChange={handleChange} className="mr-2" />
                  Yes
                </label>
                <label className="flex items-center">
                  <input type="radio" name="helb" value="No" onChange={handleChange} className="mr-2" />
                  No
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="granted" className="block font-medium mb-2">If yes, state the outcome and reasons for grant:</label>
              <textarea id="granted" name="granted" value={formData.granted} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter reasons"></textarea>
            </div>
            <div>
              <label htmlFor="noreason" className="block font-medium mb-2">If no, state the reasons:</label>
              <textarea id="noreason" name="noreason" value={formData.noreason} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter reasons"></textarea>
            </div>
            <div className="col-span-1 md:col-span-2">
              <button type="submit" className="detailsbutton rounded">Next</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisclosureDetails;