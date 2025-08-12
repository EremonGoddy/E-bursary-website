import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faHouse, faFileAlt, faPaperclip, faTimes, faDownload, faComments, faCog,
faSignOutAlt, faBars, faBell,
} from '@fortawesome/free-solid-svg-icons';

const FamilyDetails = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [userName, setUserName] = useState('');
const [studentDetails, setStudentDetails] = useState({});
const [documentUploaded, setDocumentUploaded] = useState(false);
const [hasNewMessage, setHasNewMessage] = useState(false);
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
    axios.post('https://e-bursary-backend.onrender.com/api/family-details', dataWithUserId)
      .then(response => {
        alert('Data inserted successfully');
        navigate('/Disclosuredetails');
      })
      .catch(error => {
        if (
          error.response &&
          (error.response.status === 409 ||
            (error.response.data &&
              /already submitted|duplicate/i.test(error.response.data.message || "")))
        ) {
          alert("You have already submitted family details.");
          navigate('/Disclosuredetails');
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

    // Check if family details already exist for this userId
    if (userId) {
      axios
        .get(`https://e-bursary-backend.onrender.com/api/family-details/user/${userId}`)
        .then(res => {
          if (res.data && res.data.user_id) {
            // Family details already exist, go to next step
            navigate('/Disclosuredetails');
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
        <div className={`flex-1 md:ml-25 transition-all mt-2 duration-300
        ${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[50px]'}
          `}>
          <ProgressStepper currentStep={2} />
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[350px] md:max-w-[600px]  mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center text-[#14213d]">Bursary Application Form</h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-[#14213d]">Family Details</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block font-medium mb-2 text-[#14213d]">Family Status</label>
                <div className="flex flex-col text-[#14213d] space-y-2">
                  <label className="flex items-center ">
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
                <label className="block font-medium text-[#14213d] mb-2">Does the student have a disability?</label>
                <div className="flex flex-col space-y-2 text-[#14213d]">
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
              <div className='text-[#14213d]'>
                <label htmlFor="parentname" className="block font-medium mb-2">Parent/Guardian Name</label>
                <input type="text" id="parentname" name="parentname" value={formData.parentname} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter parent/guardian name" />
              </div>
              <div className='text-[#14213d]'>
                <label htmlFor="relationship" className="block font-medium mb-2">Relationship</label>
                <input type="text" id="relationship" name="relationship" value={formData.relationship} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter relationship" />
              </div>
              <div className='text-[#14213d]'>
                <label htmlFor="contact" className="block font-medium mb-2">Contact Information</label>
                <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter contact information" />
              </div>
              <div className='text-[#14213d]'>
                <label htmlFor="occupation" className="block font-medium mb-2">Occupation</label>
                <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter occupation" />
              </div>
              <div className='text-[#14213d]'>
                <label htmlFor="guardian" className="block font-medium mb-2">How many children does the guardian have?</label>
                <input type="text" id="guardian" name="guardian_children" value={formData.guardian_children} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter number of children" />
              </div>
              <div className='text-[#14213d]'>
                <label htmlFor="working" className="block font-medium mb-2">How many siblings are working?</label>
                <input type="text" id="working" name="working_siblings" value={formData.working_siblings} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter number" />
              </div>
              <div className='text-[#14213d]'>
                <label htmlFor="siblings" className="block font-medium mb-2">How many siblings are studying?</label>
                <input type="text" id="siblings" name="studying_siblings" value={formData.studying_siblings} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter number" />
              </div>
              <div className='text-[#14213d]'>
                <label htmlFor="income" className="block font-medium mb-2">Monthly Income</label>
                <input type="text" id="income" name="monthly_income" value={formData.monthly_income} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter income" />
              </div>
            </form>
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-[#14213d] text-white px-10 py-2 min-w-[100px] md:min-w-[160px] rounded hover:bg-gray-700 transition duration-200"
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
