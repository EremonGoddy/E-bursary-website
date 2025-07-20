import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faFileAlt, faPaperclip, faDownload,faTimes, faComments, faCog,
  faSignOutAlt, faBars, faBell,
} from '@fortawesome/free-solid-svg-icons';

const AmountDetails = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
const [documentUploaded, setDocumentUploaded] = useState(false);
const [hasNewMessage, setHasNewMessage] = useState(false);
const [formData, setFormData] = useState({
    payablewords: '',
    payablefigures: '',
    outstandingwords: '',
    outstandingfigures: '',
    accountname: '',
    accountnumber: '',
    branch: '',
  });
  const [loading, setLoading] = useState(true);

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
    axios.post('https://e-bursary-backend.onrender.com/api/amount-details', dataWithUserId)
      .then(response => {
        alert('Data inserted successfully');
        navigate('/Familydetails');
      })
      .catch(error => {
        if (
          error.response &&
          (error.response.status === 409 ||
            (error.response.data &&
              /already submitted|duplicate/i.test(error.response.data.message || "")))
        ) {
          alert("You have already submitted amount details.");
          navigate('/Familydetails');
        } else {
          alert('There was an error inserting the data!');
        }
        console.error('There was an error inserting the data!', error);
      });
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

        useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
  
    if (!token) {
      navigate('/signin');
      return;
    }
  
    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, {
        headers: { Authorization: token }
      })
      .then(response => {
        const message = response.data.status_message;
        if (message && message.toLowerCase().includes("new")) {
          setHasNewMessage(true);
        } else {
          setHasNewMessage(false);
        }
      })
      .catch(err => {
        console.error('Error checking status message:', err);
      });
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');
    if (!token) {
      navigate('/signin');
      return;
    }
    setUserName(name);

    // Check if amount details already exist for this userId
    if (userId) {
      axios
        .get(`https://e-bursary-backend.onrender.com/api/amount-details/user/${userId}`)
        .then(res => {
          if (res.data) {
            // Amount details already exist, go to next step
            navigate('/Familydetails');
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return null; // Prevent flash before redirect or loading complete

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
    <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
         <div className="flex justify-between items-center">
         
 
           <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
           <div className="flex items-center space-x-1">
             <h2 className="mr-1 md:mr-5 text-[1rem] md:text-[1.2rem] font-bold text-[#14213d]">
               Welcome: {userName}
             </h2>
             <div className="flex items-center space-x-2">
  <img
   src={
     studentDetails.gender === 'Female'
       ? '/images/woman.png'
       : studentDetails.gender === 'Male'
       ? '/images/patient.png'
       : '/images/user.png'
   }
   alt="User"
   className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-1 md:mr-0"
 />
 
 
 
  </div>
 {/* Sidebar toggle only visible on small screens */}
 {/* Toggle Button for opening sidebar on mobile */}
 <div className="block md:hidden">
   <FontAwesomeIcon
     icon={faBars}
     className="text-[1.7rem] cursor-pointer text-[#14213d]"
     onClick={toggleSidebar}
   />
 </div>
 
 </div>
 </div>
 </div>

      <div className="flex pt-20 min-h-screen">
        {/* Sidebar */}
<div
  className={`
    fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-15
    transition-all duration-100 ease-in-out
    overflow-visible
    ${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
    ${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[50px] md:p-2'}
  `}
>
  {/* Toggle Button for Desktop View */}
  <div className="hidden md:flex justify-end mb-4">
    <FontAwesomeIcon
      icon={sidebarActive ? faTimes : faBars}
      className={`text-white cursor-pointer text-[1.5rem] ${
        sidebarActive ? 'ml-auto' : 'mr-2'
      }`}
      onClick={toggleSidebar}
    />
  </div>

  {/* Navigation Menu */}
  <ul className="flex flex-col h-full mt-6 space-y-14">
    {[
      {
        icon: faHouse,
        label: 'Dashboard',
        to: '/student'
      },
      {
        icon: faFileAlt,
        label: 'Apply',
        isButton: true,
        onClick: () => navigate('/personaldetails'),
        disabled: documentUploaded
      },
      {
        icon: faDownload,
        label: 'Report',
        to: '/studentreport'
      },
      {
        icon: faBell,
        label: 'Notification',
        to: '/messages'
      },
      {
        icon: faCog,
        label: 'Settings',
        to: '/studentsetting'
      },
      {
        icon: faSignOutAlt,
        label: 'Logout',
        isLogout: true
      }
    ].map((item, index) => (
      <li
        className={`group relative ${item.isLogout ? 'mt-30 md:mt-55' : ''}`}
        key={index}
      >
        {/* Logout Action */}
        {item.isLogout ? (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const token = sessionStorage.getItem('authToken');
              axios
                .post(
                  'https://e-bursary-backend.onrender.com/api/logout',
                  {},
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                )
                .catch(() => {})
                .finally(() => {
                  sessionStorage.clear();
                  setDocumentUploaded(false);
                  navigate('/');
                });
            }}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              sidebarActive ? 'justify-start' : 'justify-center'
            }`}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className="text-[1.2rem] md:text-[1.4rem]"
            />
            <span
              className={`${
                sidebarActive
                  ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold'
                  : 'hidden'
              }`}
            >
              {item.label}
            </span>
          </a>
        ) : item.isButton ? (
          <a
            href="#"
            onClick={item.disabled ? undefined : item.onClick}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              sidebarActive ? 'justify-start' : 'justify-center'
            } ${
              item.disabled
                ? 'pointer-events-none opacity-60 cursor-not-allowed'
                : ''
            }`}
            aria-disabled={item.disabled ? 'true' : 'false'}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className="text-[1.2rem] md:text-[1.4rem]"
            />
            <span
              className={`${
                sidebarActive
                  ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold'
                  : 'hidden'
              }`}
            >
              {item.label}
            </span>
          </a>
        ) : (
          <Link
            to={item.to}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              sidebarActive ? 'justify-start' : 'justify-center'
            }`}
          >
            <div className="relative">
              <FontAwesomeIcon
                icon={item.icon}
                className="text-[1.2rem] md:text-[1.4rem]"
              />
              {item.label === 'Notification' && hasNewMessage && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
            <span
              className={`${
                sidebarActive
                  ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold'
                  : 'hidden'
              }`}
            >
              {item.label}
            </span>
          </Link>
        )}

        {!sidebarActive && (
          <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[1.1rem] w-[120px] flex items-center justify-center z-50">
            {item.label}
          </span>
        )}
      </li>
    ))}
  </ul>
</div>


        {/* Main Content Area */}
        <div className={`flex-1 md:ml-25 transition-all duration-300
            ${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[50px]'}
          `}>
          <ProgressStepper currentStep={1} />
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[350px] md:max-w-[600px]  mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Amounts Applied</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label htmlFor="payablewords" className="block font-medium mb-2">Total amounts payable in words</label>
                <input
                  type="text"
                  id="payablewords"
                  name="payablewords"
                  value={formData.payablewords}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter amount payable"
                  required
                />
              </div>
              <div>
                <label htmlFor="payablefigures" className="block font-medium mb-2">Total amounts payable in figures</label>
                <input
                  type="number"
                  id="payablefigures"
                  name="payablefigures"
                  value={formData.payablefigures}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter amount payable"
                  required
                />
              </div>
              <div>
                <label htmlFor="outstandingwords" className="block font-medium mb-2">Outstanding balance in words</label>
                <input
                  type="text"
                  id="outstandingwords"
                  name="outstandingwords"
                  value={formData.outstandingwords}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter outstanding balance"
                  required
                />
              </div>
              <div>
                <label htmlFor="outstandingfigures" className="block font-medium mb-2">Outstanding balance in figures</label>
                <input
                  type="number"
                  id="outstandingfigures"
                  name="outstandingfigures"
                  value={formData.outstandingfigures}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter outstanding balance"
                  required
                />
              </div>
              <div>
                <label htmlFor="accountname" className="block font-medium mb-2">School account name</label>
                <input
                  type="text"
                  id="accountname"
                  name="accountname"
                  value={formData.accountname}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter school account name"
                  required
                />
              </div>
              <div>
                <label htmlFor="accountnumber" className="block font-medium mb-2">School account number</label>
                <input
                  type="number"
                  id="accountnumber"
                  name="accountnumber"
                  value={formData.accountnumber}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter school account number"
                  required
                />
              </div>
              <div>
                <label htmlFor="branch" className="block font-medium mb-2">Branch</label>
                <input
                  type="text"
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter the branch"
                  required
                />
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

export default AmountDetails;
