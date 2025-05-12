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

const FamilyDetails = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    family_status: '',
    disability: '',
    parentname: '',
    relationship: '',
    contact: '',
    occupation: '',
    guardian_children: '',
    working_siblings: '',
    studying_siblings: '',
    monthly_income: ''
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
    axios.post('http://localhost:5000/api/family-details', dataWithUserId)
      .then(response => {
        alert('Data inserted successfully');
        navigate('/Disclosuredetails');
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
          <h2 className="text-xl font-semibold mb-6">Family Details</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Family Status</label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="family_status" value="Both parents alive" onChange={handleChange} className="mr-2" />
                  Both parents alive
                </label>
                <label className="flex items-center">
                  <input type="radio" name="family_status" value="Single parent" onChange={handleChange} className="mr-2" />
                  Single parent
                </label>
                <label className="flex items-center">
                  <input type="radio" name="family_status" value="Orphan" onChange={handleChange} className="mr-2" />
                  Orphan
                </label>
                <label className="flex items-center">
                  <input type="radio" name="family_status" value="One parent deceased" onChange={handleChange} className="mr-2" />
                  One parent deceased
                </label>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Does the student have a disability?</label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="disability" value="Yes" onChange={handleChange} className="mr-2" />
                  Yes
                </label>
                <label className="flex items-center">
                  <input type="radio" name="disability" value="No" onChange={handleChange} className="mr-2" />
                  No
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="parentname" className="block font-medium mb-2">Parent/Guardian Name</label>
              <input type="text" id="parentname" name="parentname" value={formData.parentname} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter parent/guardian name" />
            </div>
            <div>
              <label htmlFor="relationship" className="block font-medium mb-2">Relationship</label>
              <input type="text" id="relationship" name="relationship" value={formData.relationship} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter relationship" />
            </div>
            <div>
              <label htmlFor="contact" className="block font-medium mb-2">Contact Information</label>
              <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter contact information" />
            </div>
            <div>
              <label htmlFor="occupation" className="block font-medium mb-2">Occupation</label>
              <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter occupation" />
            </div>
            <div>
              <label htmlFor="guardian" className="block font-medium mb-2">How many children does the guardian have?</label>
              <input type="text" id="guardian" name="guardian_children" value={formData.guardian_children} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter number of children" />
            </div>
            <div>
              <label htmlFor="working" className="block font-medium mb-2">How many siblings are working?</label>
              <input type="text" id="working" name="working_siblings" value={formData.working_siblings} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter number" />
            </div>
            <div>
              <label htmlFor="siblings" className="block font-medium mb-2">How many siblings are studying?</label>
              <input type="text" id="siblings" name="studying_siblings" value={formData.studying_siblings} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter number" />
            </div>
            <div>
              <label htmlFor="income" className="block font-medium mb-2">Monthly Income</label>
              <input type="text" id="income" name="monthly_income" value={formData.monthly_income} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter income" />
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

export default FamilyDetails;