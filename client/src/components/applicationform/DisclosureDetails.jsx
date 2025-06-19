import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please complete personal details first.');
      return;
    }
    const dataWithUserId = { ...formData, userId };
    axios.post('https://e-bursary-backend.onrender.com/api/disclosure-details', dataWithUserId)
      .then(response => {
        alert('Data inserted successfully');
        // navigate to document upload and pass disclosure data via state
        navigate('/documentupload', { state: formData });
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
    <div className="w-full min-h-screen relative bg-white-100">
      {/* Top Bar */}
      {/* ... (keep existing sidebar/topbar code) ... */}
      <div className={`flex-1 ml-10 md:ml-25 p-4 transition-all duration-300`}>
        <ProgressStepper currentStep={3} />
        <div className="bg-white rounded-lg  max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto  -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
          <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Other Disclosure</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* ... your form fields ... */}
            {/* Example: */}
            <div>
              <label className="block font-medium mb-2">Are you currently receiving any other bursaries or scholarships?</label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="bursary" value="yes" checked={formData.bursary === "yes"} onChange={handleChange} className="mr-2" />
                  Yes
                </label>
                <label className="flex items-center">
                  <input type="radio" name="bursary" value="no" checked={formData.bursary === "no"} onChange={handleChange} className="mr-2" />
                  No
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="bursarysource" className="block font-medium mb-2">If yes, state the source:</label>
              <input type="text" id="bursarysource" name="bursarysource" value={formData.bursarysource} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter the source" />
            </div>
            <div>
              <label htmlFor="bursaryamount" className="block font-medium mb-2">State the amount in Ksh:</label>
              <input type="text" id="bursaryamount" name="bursaryamount" value={formData.bursaryamount} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter amount in Ksh" />
            </div>
            <div>
              <label className="block font-medium mb-2">Have you applied for financial support from HELB?</label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="helb" value="Yes" checked={formData.helb === "Yes"} onChange={handleChange} className="mr-2" />
                  Yes
                </label>
                <label className="flex items-center">
                  <input type="radio" name="helb" value="No" checked={formData.helb === "No"} onChange={handleChange} className="mr-2" />
                  No
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="granted" className="block font-medium mb-2">If yes, state the outcome and reasons for grant:</label>
              <textarea id="granted" name="granted" value={formData.granted} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter reasons"></textarea>
            </div>
            <div>
              <label htmlFor="noreason" className="block font-medium mb-2">If no, state the reasons:</label>
              <textarea id="noreason" name="noreason" value={formData.noreason} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter reasons"></textarea>
            </div>
            <div className="flex justify-end mt-8 md:col-span-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-10 py-2 min-w-[100px] md:min-w-[160px] rounded hover:bg-blue-700 transition duration-200"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DisclosureDetails;