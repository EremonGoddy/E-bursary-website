import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faFileAlt,
  faDownload,
  faComments,
  faCog,
  faSignOutAlt,
  faCheckCircle,
  faHourglassHalf,
  faTimesCircle,
  faEye,
  faUser,
  faBars,
  faEdit,
  faBell,
  faTimes,
  faMoneyBillWave,
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


    const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { icon: faCheckCircle, color: 'text-green-500' };
      case 'pending':
        return { icon: faHourglassHalf, color: 'text-yellow-500' };
      case 'rejected':
        return { icon: faTimesCircle, color: 'text-red-500' };
      case 'under review':
        return { icon: faEye, color: 'text-blue-500' };
      default:
        return { icon: faFileAlt, color: 'text-gray-400' };
    }
  }

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



  {/* Navigation */}
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
        onClick: handleApplyClick,
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
        {/* Render as Link, Button, or Logout Anchor */}
        {item.isLogout ? (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const token = sessionStorage.getItem('authToken');
              axios
                .post('https://e-bursary-backend.onrender.com/api/logout ', {}, {
                  headers: { Authorization: `Bearer ${token}` }
                })
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
            <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
            <span
              className={`${
                sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
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
            } ${item.disabled ? 'pointer-events-none opacity-60 cursor-not-allowed' : ''}`}
            aria-disabled={item.disabled ? 'true' : 'false'}
          >
            <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
            <span
              className={`${
                sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
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
            <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
            <span
              className={`${
                sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
              }`}
            >
              {item.label}
            </span>
          </Link>
        )}

        {/* Tooltip shown only in desktop when sidebar is inactive */}
        {!sidebarActive && (
     <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[1.1 rem] w-[120px] flex items-center justify-center z-50">
  {item.label}
</span>


        )}
      </li>
    ))}
  </ul>
</div>

        {/* Main Content */}
        <div
  className={`flex-1 transition-all duration-300 -mt-6 md:mt-0 pt-4 px-4 md:px-10 
    ${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[20px]'}
  `}
>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-1 md:col-span-3 flex justify-center items-center min-h-[300px]">
                <span className="text-gray-500 text-lg animate-pulse">Loading...</span>
              </div>
            ) : Object.keys(studentDetails).length > 0 ? (
              <>
                {/* Bursary Funds & Status */}
                <div className="flex flex-col gap-1 md:gap-4">
                  <div className=" p-4  flex flex-col items-center mb-2  backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
                    <h2 className="text-[1.2rem] md:text-[1.2rem] font-bold mb-1 text-[#14213d]">Bursary funds allocated:</h2>
                    <p className="mb-2 text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold">
                      {studentDetails.bursary
                          ? `${Number(studentDetails.bursary).toLocaleString()} Ksh`
                        : "0.00 Ksh"}
                    </p>
                 <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500 text-4xl" />
                  </div>
                  <div className=" p-4  flex flex-col items-center mb-2  backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
                    <h2 className="text-[1.2rem] md:text-[1.2rem]  font-bold mb-1">Status of the application:</h2>
                    <p className="mb-2 text-[#14213d] text-[1rem] md:text-[1.1rem] font-semibold">{studentDetails.status}</p>
                   <FontAwesomeIcon
    icon={getStatusIcon(studentDetails.status).icon}
    className={`${getStatusIcon(studentDetails.status).color} text-4xl`}
  />
                  </div>
                </div>
                {/* User Profile */}
                <div className=" p-6 flex -mt-2 md:mt-0 flex-col items-center  backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <h2 className="text-xl font-bold mb-2 text-[1.2rem] md:text-[1.35rem] text-[#14213d]">User Profile</h2>
                  <hr className="my-4 w-full " />
                  <div className="text-center leading-8">

                     <img
  src={
    studentDetails.gender === 'Female'
      ? '/images/woman.png'
      : studentDetails.gender === 'Male'
      ? '/images/patient.png'
      : '/images/user.png'
  }
  alt="Profile"
  className="rounded-full w-24 h-24 mx-auto"
/>
                    
                    <h5 className="font-bold mt-4 text-[1rem] text-[#14213d] md:text-[1.1rem]">
                      {studentDetails.fullname}
                    </h5>
                    <p className="font-semibold text-[1rem] md:text-[1.1rem] text-[#14213d]">Student</p>
                  </div>
                  <hr className="my-4 w-full " />
                  <p className='leading-8 text-[1rem] text-[#14213d] md:text-[1.1rem]'>
                    <strong>Student No:</strong> {studentDetails.admission}
                  </p>
                  <p className='leading-8 text-[1rem] md:text-[1.1rem] text-[#14213d]'>
                    <strong>School:</strong> {studentDetails.institution}
                  </p>
                </div>
                {/* Personal Information */}
                <div className=" p-6  backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faUser} className="text-[#14213d] text-2xl md:text-2xl mr-2" />
                    <h2 className="text-xl font-bold mr-4  text-[1.2rem] md:text-[1.3rem] text-[#14213d]">Personal Information</h2>
                    <button
                      className="bg-blue-500 text-white px-3  md:px-2 md:py-1 text-[1rem] md:text-[1.1rem] font-bold rounded hover:bg-blue-600 ml-auto flex items-center"
                      onClick={handleEditClick}
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-[1rem] md:text-[1.2rem]" /> Update Profile
                    </button>
                  </div>
                  <hr className="my-4" />
                  <table className="table-auto w-full text-left">
                    <tbody className="leading-8 text-[1rem] md:text-[1.1rem] text-[#14213d]">
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
                   p-6 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]
                  
                  w-[330px]
                  md:w-[500px]
                  mx-auto
                  mt-30
                  md:mt-60
                  ${sidebarActive
                    ? 'ml-[3px] md:ml-[480px]'
                    : 'ml-[3px] md:ml-[600px]'
                  }
                `}
              >
<div className="text-center space-y-2">
  <h2 className="text-xl md:text-2xl font-bold text-[#14213d]">
    {userName}, your Dashboard is currently empty
  </h2>
  <p className="text-base md:text-lg text-[#14213d]">
    Please click on the <span className="font-semibold text-[#14213d]">'Apply'<FontAwesomeIcon icon={faFileAlt} className="text-[#14213d]" />
</span> icon in the sidebar to complete your information.
  </p>
</div>

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
    <div className="bg-white p-3 rounded-[0.5rem] shadow-lg w-full max-w-[330px] md:max-w-[500px] relative pl-3 pr-3 md:pr-6 md:pl-6">
  {/* Cancel (close) icon in top right */}
  <div className="mb-7 md:mt-6 ">
  <FontAwesomeIcon
    icon={faTimes}
    className="absolute w-8 h-8 top-1  -right-1 md:right-2 text-[#14213d] hover:text-[#14213d] hover:bg-gray-200 p-1 rounded-full text-[1.6rem] md:text-[2rem] cursor-pointer transition duration-200 ease-in-out active:scale-90"
    onClick={handleCloseForm}
  />
</div>

  <form onSubmit={handleFormSubmit}>
    {[
      { id: 'fullname', label: 'Full Name', type: 'text' },
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'subcounty', label: 'Sub County', type: 'text' },
      { id: 'ward', label: 'Ward', type: 'text' },
      { id: 'village', label: 'Village Unit', type: 'text' },
      { id: 'birth', label: 'Date of Birth', type: 'date' },
      { id: 'gender', label: 'Sex', type: 'text' },
      { id: 'institution', label: 'Name of Institution', type: 'text' },
      { id: 'year', label: 'Year', type: 'text' },
      { id: 'admission', label: 'Admission', type: 'text' },
    ].map(({ id, label, type }) => (
      <div key={id} className="mb-3 flex items-center  text-[#14213d]">
  <label
    htmlFor={id}
    className="block font-medium text-[1rem] md:text-[1.05rem] w-[110px]" // Fixed width
  >
    {label}:
  </label>
  <input
    type={type}
    id={id}
    name={id}
    value={formData[id] || ''}
    onChange={handleInputChange}
    className="flex-1 max-w-[320px] text-[1rem] md:text-[1.05rem] border border-gray-300 rounded-md px-3 md:px-3 md:py-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#14213d] focus:border-transparent transition duration-200"
  />
</div>

    ))}

    <div className="flex justify-end items-center mt-6">
      <button
        type="submit"
        className="px-3 py-1 md:px-4 md:py-2 bg-[#14213d] text-white font-medium rounded-md hover:bg-gray-800 transition"
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