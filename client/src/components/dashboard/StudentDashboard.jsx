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
  const [loading, setLoading] = useState(true);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const navigate = useNavigate();

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
  const userId = sessionStorage.getItem('userId');

  if (!token) {
    navigate('/signin');
    return;
  }

  setUserName(name);
  setLoading(true);

  // ✅ Fetch student details only if token is present
  axios.get('https://e-bursary-backend.onrender.com/api/student', {
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
      navigate('/signin');
    }
  });

  // ✅ Only call document status API if both token and userId exist
  if (userId) {
    axios
      .get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, {
        headers: { Authorization: token }  // Optional but recommended for security
      })
      .then((res) => {
        const isUploaded = res.data && res.data.uploaded === true;
        setDocumentUploaded(isUploaded);
        
      })
      .catch(() => setDocumentUploaded(false));
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

  const applicationCompleted = documentUploaded;

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
  onClick={documentUploaded ? undefined : handleApplyClick}   // Disable click handler safely
  className={`flex items-center w-full ${documentUploaded ? 'pointer-events-none opacity-60 cursor-not-allowed' : ''}`}
  aria-disabled={documentUploaded ? "true" : "false"}
>
  <FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>
    Apply
  </span>
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
                <Link to="/messages" className={`
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
               <Link
  to="#"
  onClick={async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    try {
      if (token) {
        await axios.post('https://e-bursary-backend.onrender.com/api/logout', {}, {
          headers: {
           Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error("Logout logging failed:", err);
      // Proceed to logout anyway
    } finally {
      sessionStorage.clear();
      setDocumentUploaded(false);
      navigate('/');
    }
  }}
  className={`
    flex items-center w-full space-x-2 mt-25 md:mt-20 text-white no-underline
    transition-all duration-200
    ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
  `}
>
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
        <div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10
          ${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}
        `}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-1 md:col-span-3 flex justify-center items-center min-h-[300px]">
                <span className="text-gray-500 text-lg animate-pulse">Loading...</span>
              </div>
            ) : Object.keys(studentDetails).length > 0 ? (
              <>
                {/* Bursary Funds & Status */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded flex flex-col items-center mb-2">
                    <h2 className="text-[1.2rem] md:text-[1.2rem] font-bold mb-1">Bursary funds allocated:</h2>
                    <p className="mb-2">
                      {studentDetails.bursary
                        ? `${parseFloat(studentDetails.bursary).toFixed(2)} shillings`
                        : "0.00 shillings"}
                    </p>
                    <FontAwesomeIcon icon={faCashRegister} className="text-green-500 text-3xl" />
                  </div>
                  <div className="bg-white p-4 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded flex flex-col items-center">
                    <h2 className="text-[1.2rem] md:text-[1.2rem]  font-bold mb-1">Status of the application:</h2>
                    <p className="mb-2">{studentDetails.status}</p>
                    <FontAwesomeIcon icon={faCheckDouble} className="text-blue-500 text-3xl" />
                  </div>
                </div>
                {/* User Profile */}
                <div className="bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]  rounded flex flex-col items-center">
                  <h2 className="text-xl font-bold mb-2 text-[1.2rem] md:text-[1.35rem]">User Profile</h2>
                  <hr className="my-4 w-full" />
                  <div className="text-center leading-8">
                    <img
                      className="rounded-full w-24 h-24 mx-auto"
                      src="/images/patient.png"
                      alt="Profile"
                    />
                    <h5 className="font-semibold mt-4 text-[1rem] md:text-[1.1rem]">
                      {studentDetails.fullname}
                    </h5>
                    <p className="text-gray-500 text-[1rem] md:text-[1.1rem]">Student</p>
                  </div>
                  <hr className="my-4 w-full " />
                  <p className='leading-8 text-[1rem] md:text-[1.1rem]'>
                    <strong>Student No:</strong> {studentDetails.admission}
                  </p>
                  <p className='leading-8 text-[1rem] md:text-[1.1rem]'>
                    <strong>School:</strong> {studentDetails.institution}
                  </p>
                </div>
                {/* Personal Information */}
                <div className="bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded">
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faUser} className="text-gray-500 text-2xl md:text-2xl mr-2" />
                    <h2 className="text-xl font-bold mr-4  text-[1.2rem] md:text-[1.3rem]">Personal Information</h2>
                    <button
                      className="bg-blue-500 text-white px-3  md:px-2 md:py-1 text-[1rem] md:text-[1.1rem] font-bold rounded hover:bg-blue-600 ml-auto flex items-center"
                      onClick={handleEditClick}
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-[1rem] md:text-[1.2rem]" /> Update Profile
                    </button>
                  </div>
                  <hr className="my-4" />
                  <table className="table-auto w-full text-left">
                    <tbody className="leading-8 text-[1rem] md:text-[1.1rem]">
                      <tr>
                        <th className="pr-4">Full name:</th>
                        <td>{studentDetails.fullname}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Email:</th>
                        <td>{studentDetails.email}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Sub County:</th>
                        <td>{studentDetails.subcounty}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Ward:</th>
                        <td>{studentDetails.ward}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Village unit:</th>
                        <td>{studentDetails.village}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Date of birth:</th>
                        <td>{studentDetails.birth}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Sex:</th>
                        <td>{studentDetails.gender}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Name of institution:</th>
                        <td>{studentDetails.institution}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Year:</th>
                        <td>{studentDetails.year}</td>
                      </tr>
                      <tr>
                        <th className="pr-4">Admission:</th>
                        <td>{studentDetails.admission}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div
                className={`
                  bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded-md  flex flex-col gap-4
                  transition-all duration-300
                  w-[280px]
                  md:w-[500px]
                  mx-auto
                  mt-10
                  md:mt-60
                  ${sidebarActive
                    ? '-ml-[40px] md:ml-[480px]'
                    : 'ml-[8px] md:ml-[450px]'
                  }
                `}
              >
                <h2 className="text-[1.3rem] md:text-[1.3rem] font-bold text-center">Dashboard is empty</h2>
                <p className="block text-[1rem] md:text-[1.1rem]" >Please click on the 'Apply' icon in the sidebar to complete your information.</p>
              </div>
            )}
          </div>
        </div>
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