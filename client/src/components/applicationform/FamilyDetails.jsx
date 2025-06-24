import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faFileAlt, faPaperclip, faDownload, faComments, faCog,
  faSignOutAlt, faBars, faBell,
} from '@fortawesome/free-solid-svg-icons';

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
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  // On mount, check if user has already filled family details (session/localstorage + DB check)
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');
    if (!token) {
      navigate('/signin');
      return;
    }
    setUserName(name);

    // If already submitted family details, redirect to Disclosuredetails
    if (localStorage.getItem('familyDetailsCompleted') === 'true') {
      navigate('/Disclosuredetails');
      return;
    }

    // Always check DB for this user
    axios
      .get(`https://e-bursary-backend.onrender.com/api/familyInformation/${userId}`)
      .then((response) => {
        // If data found, set flag and redirect
        localStorage.setItem('familyDetailsCompleted', 'true');
        navigate('/Disclosuredetails');
      })
      .catch((error) => {
        if (error.response && (error.response.status === 404 || error.response.status === 400)) {
          setLoading(false); // Not found, allow to fill form
        } else {
          setErrorMsg("Could not confirm your progress. Please sign in again.");
          navigate('/signin');
        }
      });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMsg("");
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
    axios.post('https://e-bursary-backend.onrender.com/api/family-details', dataWithUserId)
      .then(response => {
        alert('Data inserted successfully');
        localStorage.setItem('familyDetailsCompleted', 'true');
        navigate('/Disclosuredetails');
      })
      .catch(error => {
        setErrorMsg("There was an error inserting the data!");
        console.error('There was an error inserting the data!', error);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

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
                <Link to="/personaldetails" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Apply</span>
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
                  Apply
                </span>
              </div>
            </li>
            {/* Other menu items... */}
            {/* ... (rest of your sidebar) */}
          </ul>
        </div>
        {/* Main Content Area */}
        <div className={`flex-1 ml-10 md:ml-25 p-4 transition-all duration-300`}>
          <ProgressStepper currentStep={2} />
          <div className="bg-white rounded-lg  max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto  -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Family Details</h2>
            {errorMsg && (
              <div className="mb-4 text-center text-red-600 font-semibold">{errorMsg}</div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block font-medium mb-2">Family Status</label>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="family_status" value="Both parents alive" checked={formData.family_status === "Both parents alive"} onChange={handleChange} className="mr-2" />
                    Both parents alive
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="family_status" value="Single parent" checked={formData.family_status === "Single parent"} onChange={handleChange} className="mr-2" />
                    Single parent
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="family_status" value="Orphan" checked={formData.family_status === "Orphan"} onChange={handleChange} className="mr-2" />
                    Orphan
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="family_status" value="One parent deceased" checked={formData.family_status === "One parent deceased"} onChange={handleChange} className="mr-2" />
                    One parent deceased
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2">Does the student have a disability?</label>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="disability" value="Yes" checked={formData.disability === "Yes"} onChange={handleChange} className="mr-2" />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="disability" value="No" checked={formData.disability === "No"} onChange={handleChange} className="mr-2" />
                    No
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="parentname" className="block font-medium mb-2">Parent/Guardian Name</label>
                <input type="text" id="parentname" name="parentname" value={formData.parentname} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter parent/guardian name" />
              </div>
              <div>
                <label htmlFor="relationship" className="block font-medium mb-2">Relationship</label>
                <input type="text" id="relationship" name="relationship" value={formData.relationship} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter relationship" />
              </div>
              <div>
                <label htmlFor="contact" className="block font-medium mb-2">Contact Information</label>
                <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter contact information" />
              </div>
              <div>
                <label htmlFor="occupation" className="block font-medium mb-2">Occupation</label>
                <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter occupation" />
              </div>
              <div>
                <label htmlFor="guardian" className="block font-medium mb-2">How many children does the guardian have?</label>
                <input type="text" id="guardian" name="guardian_children" value={formData.guardian_children} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter number of children" />
              </div>
              <div>
                <label htmlFor="working" className="block font-medium mb-2">How many siblings are working?</label>
                <input type="text" id="working" name="working_siblings" value={formData.working_siblings} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter number" />
              </div>
              <div>
                <label htmlFor="siblings" className="block font-medium mb-2">How many siblings are studying?</label>
                <input type="text" id="siblings" name="studying_siblings" value={formData.studying_siblings} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter number" />
              </div>
              <div>
                <label htmlFor="income" className="block font-medium mb-2">Monthly Income</label>
                <input type="text" id="income" name="monthly_income" value={formData.monthly_income} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter income" />
              </div>
            </form>
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-10 py-2 min-w-[100px] md:min-w-[160px] rounded hover:bg-blue-700 transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDetails;