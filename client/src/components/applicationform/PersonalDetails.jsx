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
import './ApplicationDetails.css';

const Personaldetails = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    subcounty: '',
    ward: '',
    village: '',
    birth: '',
    gender: '',
    institution: '',
    year: '',
    admission: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Function to toggle sidebar active state
  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send form data to the backend
    axios.post('http://localhost:5000/api/personal-details', formData)
      .then((response) => {
        alert('Data inserted successfully');
        const userId = response.data.userId;
        sessionStorage.setItem('userId', userId); // Store userId in sessionStorage
        navigate('/Amountdetails');
      })
      .catch((error) => {
        console.error('There was an error inserting the data!', error);
      });
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');

    if (!token) {
      navigate('/signin'); // Redirect if not authenticated
    } else {
      setUserName(name);
    }
  }, [navigate]);

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      {/* Fixed Top Bar */}
      <div className="topbar bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-20">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">EBursary</h1>
          <h2 className="text-lg font-semibold">Welcome: {userName}</h2>
          <div className="image flex space-x-2">
            <img
              src="/images/patient.png"
              alt="User"
              className="rounded-full"
            />
            <FontAwesomeIcon icon={faBell} className="notify text-xl" />
          </div>
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex flex-row pt-20">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarActive ? 'active' : ''} `}>
          <div className="d-flex flex-column">
            <FontAwesomeIcon
              icon={faBars}
              className="text-white text-xl mb-4 cursor-pointer"
              id="btn"
              onClick={toggleSidebar}
            />
            <ul className="space-y-14 items-center">
              <li>
                <Link to="/student" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faHouse} className="icon text-lg" />
                  <span className="links-name">Dashboard</span>
                </Link>
                <span className="tooltip">Dashboard</span>
              </li>
              <li>
                <Link to="/personaldetails" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faFileAlt} className="icon text-lg" />
                  <span className="links-name">Apply</span>
                </Link>
                <span className="tooltip">Apply</span>
              </li>
              <li>
                <Link to="/documentupload" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faPaperclip} className="icon text-lg" />
                  <span className="links-name">File attached</span>
                </Link>
                <span className="tooltip">File attached</span>
              </li>
              <li>
                <Link to="/report" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faDownload} className="icon text-lg" />
                  <span className="links-name">Download Report</span>
                </Link>
                <span className="tooltip">Download Report</span>
              </li>
              <li>
                <Link to="#" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faComments} className="icon text-lg" />
                  <span className="links-name">Messages</span>
                </Link>
                <span className="tooltip">Messages</span>
              </li>
              <li>
                <Link to="/setting" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCog} className="icon text-lg" />
                  <span className="links-name">Settings</span>
                </Link>
                <span className="tooltip">Settings</span>
              </li>
              <li>
                <Link to="/" className="flex items-center space-x-2 text-red-500">
                  <FontAwesomeIcon icon={faSignOutAlt} className="icon text-lg" />
                  <span className="links-name">Logout</span>
                </Link>
                <span className="tooltip">Logout</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-details flex-1 p-7">
          <h1 className="text-2xl font-bold mb-4">Bursary Application Form</h1>
           <h2 className="text-2xl font-bold mb-4">Student Details</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="fullname" className="text-sm font-bold mb-1">Full Name</label>
              <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter Full Name" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="email" className="text-sm font-bold mb-1">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter Email" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="subcounty" className="text-sm font-bold mb-1">Sub county</label>
              <input type="text" id="subcounty" name="subcounty" value={formData.subcounty} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter Sub county" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="ward" className="text-sm font-bold mb-1">Ward</label>
              <input type="text" id="ward" name="ward" value={formData.ward} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter Ward" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="village" className="text-sm font-bold mb-1">Village unit</label>
              <input type="text" id="village" name="village" value={formData.village} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter your village" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="birth" className="text-sm font-bold mb-1">Date of birth</label>
              <input type="date" id="birth" name="birth" value={formData.birth} onChange={handleChange} className="border rounded p-2 w-full" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label className="text-sm font-bold mb-1">Gender</label>
              <div className="flex items-center space-x-4">
                <label>
                  <input type="radio" name="gender" value="Male" onChange={handleChange} /> Male
                </label>
                <label>
                  <input type="radio" name="gender" value="Female" onChange={handleChange} /> Female
                </label>
              </div>
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="institution" className="text-sm font-bold mb-1">Institution</label>
              <input type="text" id="institution" name="institution" value={formData.institution} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter Institution" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="year" className="text-sm font-bold mb-1">Year</label>
              <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter Year" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
              <label htmlFor="admission" className="text-sm font-bold mb-1">Admission</label>
              <input type="text" id="admission" name="admission" value={formData.admission} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Enter Admission" />
            </div>
            <div className="col-span-2">
              <button type="submit" className="buttondetails">Next</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Personaldetails;

