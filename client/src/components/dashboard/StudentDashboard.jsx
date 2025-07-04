import React, { useState, useEffect } from 'react';
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
  faCashRegister,
  faCheckDouble,
  faUser,
  faBars,
  faEdit,
  faBell,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import "./Dashboard.css";

const StudentDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [studentDetails, setStudentDetails] = useState({});
  const [isEditFormVisible, setEditFormVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [personalDetailsList, setPersonalDetailsList] = useState([]);
  const navigate = useNavigate();

  // Fetch all fullnames and emails from personal_details on mount
  useEffect(() => {
    axios
      .get('https://e-bursary-backend.onrender.com/students/all-names')
      .then(res => setPersonalDetailsList(res.data || []))
      .catch(() => setPersonalDetailsList([]));
  }, []);

  // Ensures the proper step navigation on sidebar 'Apply' click
  const handleApplyClick = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/personaldetails');
      return;
    }
    try {
      const res = await axios.get(`https://e-bursary-backend.onrender.com/api/personal-details/user/${userId}`);
      if (res.data && res.data.user_id) {
        // Details exist, go to Amountdetails
        navigate('/Amountdetails');
      } else {
        // No details, force personal details page
        navigate('/personaldetails');
      }
    } catch {
      navigate('/personaldetails');
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  // Fetch student info and document upload status
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const email = sessionStorage.getItem('userEmail');
    const userId = sessionStorage.getItem('userId');
    if (!token) {
      navigate('/signin');
    } else {
      setUserName(name);
      setUserEmail(email);
      setLoading(true);
      axios
        .get('https://e-bursary-backend.onrender.com/api/student', {
          headers: {
            Authorization: token,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        })
        .then((response) => {
          setStudentDetails(response.data);
          setFormData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          if (error.response && error.response.status === 401) {
            setStudentDetails({});
            setFormData({});
            navigate('/signin');
          }
          console.error('Error fetching student data:', error);
        });

      // Check if document has been uploaded for this user
      if (userId) {
        axios
          .get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`)
          .then((res) => {
            setDocumentUploaded(res.data.uploaded === true);
          })
          .catch(() => setDocumentUploaded(false));
      }
    }
  }, [navigate]);

  const handleEditClick = () => setEditFormVisible(true);
  const handleCloseForm = () => setEditFormVisible(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }
    setEditFormVisible(false);
    setLoading(true);
    axios
      .put('https://e-bursary-backend.onrender.com/api/student/update', formData, {
        headers: { Authorization: token },
      })
      .then((response) => {
        axios
          .get('https://e-bursary-backend.onrender.com/api/student', {
            headers: {
              Authorization: token,
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
          })
          .then((getResponse) => {
            setStudentDetails(getResponse.data);
            setFormData(getResponse.data);
            setLoading(false);
          })
          .catch((fetchError) => {
            setLoading(false);
            alert('Error fetching updated student data.');
            console.error('Error fetching updated student data:', fetchError);
          });
      })
      .catch((error) => {
        setLoading(false);
        alert('Error updating student data. Please try again.');
        console.error('Error updating student data:', error);
      });
  };

  // Check if user's name or email appears in the personalDetailsList (case-insensitive)
  const currentName = userName?.trim().toLowerCase();
  const currentEmail = userEmail?.trim().toLowerCase();
  const hasApplied = personalDetailsList.some(
    (item) =>
      (item.fullname && item.fullname.trim().toLowerCase() === currentName) ||
      (item.email && item.email.trim().toLowerCase() === currentEmail)
  );
  const applicationCompleted = hasApplied || documentUploaded;

  return (
    <div className="w-full min-h-screen relative">
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
                <a
                  href="#"
                  onClick={applicationCompleted ? (e) => e.preventDefault() : handleApplyClick}
                  className={`
                    flex items-center w-full space-x-2 text-white no-underline
                    transition-all duration-200
                    ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                    ${applicationCompleted ? 'pointer-events-none opacity-60 cursor-not-allowed' : ''}
                  `}
                  tabIndex={applicationCompleted ? -1 : undefined}
                  aria-disabled={applicationCompleted ? "true" : "false"}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Apply</span>
                </a>
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
        {/* Main Content */}
        {/* ...rest of your main content remains unchanged */}
      </div>
      {/* Overlay and Edit Form Modal */}
      {isEditFormVisible && (
        <>
          {/* Overlay */}
          <div className="shadow-overlay fixed inset-0 bg-black bg-opacity-40 z-40" onClick={handleCloseForm}></div>
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center mt-10 z-50">
            <div className="bg-white p-3 rounded-[0.5rem] shadow-lg w-full max-w-[310px] md:max-w-[500px] relative  pl-3 pr-3 md:pr-6 md:pl-6">
              {/* Cancel (close) icon in top right */}
              <FontAwesomeIcon
                icon={faTimes}
                className='absolute top-1 right-2 text-[#1F2937]  hover:text-gray-600 text-lg text-[1.7rem] md:text-[2.4rem] cursor-pointer'
                onClick={handleCloseForm}
              />
              <form onSubmit={handleFormSubmit}>
                <div className="mb-2 md:mb-4 mt-8 md:mt-12  flex items-center gap-2">
                  <label htmlFor="fullname" className="block font-medium text-[1.1rem] min-w-[70px] md:min-w-[90px]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.fullname || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="email" className="block font-medium text-[1.1rem] min-w-[50px] md:min-w-[90px]">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="subcounty" className="block font-medium text-[1.1rem] min-w-[50px] md:min-w-[90px]">
                    Sub County
                  </label>
                  <input
                    type="text"
                    id="subcounty"
                    name="subcounty"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.subcounty || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="ward" className="block font-medium text-[1.1rem] min-w-[50px] md:min-w-[90px]">
                    Ward
                  </label>
                  <input
                    type="text"
                    id="ward"
                    name="ward"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.ward || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="village" className="block font-medium text-[1.1rem] min-w-[50px] md:min-w-[90px]">
                    Village Unit
                  </label>
                  <input
                    type="text"
                    id="village"
                    name="village"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.village || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="birth" className="block font-medium text-[1.1rem] min-w-[70px] md:min-w-[90px]">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="birth"
                    name="birth"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.birth || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="gender" className="block font-medium text-[1.1rem] min-w-[40px] md:min-w-[90px]">
                    Sex
                  </label>
                  <input
                    type="text"
                    id="gender"
                    name="gender"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="institution" className="block font-medium text-[1.1rem] min-w-[50px] md:min-w-[90px]">
                    Name of Institution
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.institution || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="year" className="block font-medium text-[1.1rem] min-w-[50px] md:min-w-[90px]">
                    Year
                  </label>
                  <input
                    type="text"
                    id="year"
                    name="year"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.year || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2 md:mb-4 flex items-center gap-2">
                  <label htmlFor="admission" className="block font-medium text-[1.1rem] min-w-[70px] md:min-w-[90px]">
                    Admission
                  </label>
                  <input
                    type="text"
                    id="admission"
                    name="admission"
                    className="form-input flex-1 border rounded px-2 py-1 text-[1.1rem]"
                    value={formData.admission || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-end items-center mt-4">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-[1rem]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;