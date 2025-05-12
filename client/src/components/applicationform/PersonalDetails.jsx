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

const PersonalDetails = () => {
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

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/personal-details', formData)
      .then(response => {
        alert('Data inserted successfully');
        const userId = response.data.userId;
        sessionStorage.setItem('userId', userId);
        navigate('/Amountdetails');
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
          <h2 className="text-xl font-semibold mb-6">Student Details</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullname" className="block font-medium mb-2">Full Name</label>
              <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter Full Name" />
            </div>
            <div>
              <label htmlFor="email" className="block font-medium mb-2">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter Email" />
            </div>
            <div>
              <label htmlFor="subcounty" className="block font-medium mb-2">Sub County</label>
              <input type="text" id="subcounty" name="subcounty" value={formData.subcounty} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter Sub County" />
            </div>
            <div>
              <label htmlFor="ward" className="block font-medium mb-2">Ward</label>
              <input type="text" id="ward" name="ward" value={formData.ward} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter Ward" />
            </div>
            <div>
              <label htmlFor="village" className="block font-medium mb-2">Village Unit</label>
              <input type="text" id="village" name="village" value={formData.village} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter your village" />
            </div>
            <div>
              <label htmlFor="birth" className="block font-medium mb-2">Date of Birth</label>
              <input type="date" id="birth" name="birth" value={formData.birth} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-2">Gender</label>
              <div className="flex items-center space-x-4">
                <div>
                  <input type="radio" name="gender" id="male" value="Male" onChange={handleChange} className="mr-2" />
                  <label htmlFor="male">Male</label>
                </div>
                <div>
                  <input type="radio" name="gender" id="female" value="Female" onChange={handleChange} className="mr-2" />
                  <label htmlFor="female">Female</label>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="institution" className="block font-medium mb-2">Name of Institution</label>
              <input type="text" id="institution" name="institution" value={formData.institution} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter Institution" />
            </div>
            <div>
              <label htmlFor="year" className="block font-medium mb-2">Year</label>
              <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter Year of Education" />
            </div>
            <div>
              <label htmlFor="admission" className="block font-medium mb-2">Admission</label>
              <input type="text" id="admission" name="admission" value={formData.admission} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter Admission" />
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

export default PersonalDetails;