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

const AmountDetails = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    payablewords: '',
    payablefigures: '',
    outstandingwords: '',
    outstandingfigures: '',
    accountname: '',
    accountnumber: '',
    branch: '',
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
    axios.post('http://localhost:5000/api/amount-details', dataWithUserId)
      .then(response => {
        alert('Data inserted successfully');
        navigate('/Familydetails');
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
            <FontAwesomeIcon icon={faBell} className="message text-3xl" />
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
          <h2 className="text-xl font-semibold mb-6">Amounts Applied</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="payablewords" className="block font-medium mb-2">Total amounts payable in words</label>
              <input type="text" id="payablewords" name="payablewords" value={formData.payablewords} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter amount payable" />
            </div>
            <div>
              <label htmlFor="payablefigures" className="block font-medium mb-2">Total amounts payable in figures</label>
              <input type="number" id="payablefigures" name="payablefigures" value={formData.payablefigures} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter amount payable" />
            </div>
            <div>
              <label htmlFor="outstandingwords" className="block font-medium mb-2">Outstanding balance in words</label>
              <input type="text" id="outstandingwords" name="outstandingwords" value={formData.outstandingwords} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter outstanding balance" />
            </div>
            <div>
              <label htmlFor="outstandingfigures" className="block font-medium mb-2">Outstanding balance in figures</label>
              <input type="number" id="outstandingfigures" name="outstandingfigures" value={formData.outstandingfigures} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter outstanding balance" />
            </div>
            <div>
              <label htmlFor="accountname" className="block font-medium mb-2">School account name</label>
              <input type="text" id="accountname" name="accountname" value={formData.accountname} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter school account name" />
            </div>
            <div>
              <label htmlFor="accountnumber" className="block font-medium mb-2">School account number</label>
              <input type="number" id="accountnumber" name="accountnumber" value={formData.accountnumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter school account number" />
            </div>
            <div>
              <label htmlFor="branch" className="block font-medium mb-2">Branch</label>
              <input type="text" id="branch" name="branch" value={formData.branch} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" placeholder="Enter the branch" />
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

export default AmountDetails;