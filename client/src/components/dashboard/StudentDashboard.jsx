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
  const [hasNewMessage, setHasNewMessage] = useState(false);
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
  };

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
        navigate('/Amountdetails');
      } else {
        navigate('/personaldetails');
      }
    } catch {
      navigate('/personaldetails');
    }
  };

  // ✅ Only check if there is a new message
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
    const storedMessageFlag = sessionStorage.getItem('hasNewMessage');

    if (!token) {
      navigate('/signin');
      return;
    }

    // If user already read messages in MessagesPage
    if (storedMessageFlag === "false") {
      setHasNewMessage(false);
      return;
    }

    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, {
        headers: { Authorization: token }
      })
      .then(response => {
        const message = response.data.status_message;
        if (message && message.trim() !== "") {
          setHasNewMessage(true);
          sessionStorage.setItem("hasNewMessage", "true");
        } else {
          setHasNewMessage(false);
        }
      })
      .catch(err => {
        console.error('Error checking status message:', err);
      });
    }
  }, [navigate]);

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

    if (userId) {
      axios
        .get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, {
          headers: { Authorization: token }
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
      .then(() => {
        axios
          .get('https://e-bursary-backend.onrender.com/api/student', {
            headers: { Authorization: token },
          })
          .then((getResponse) => {
            setStudentDetails(getResponse.data);
            setFormData(getResponse.data);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
            alert('Error fetching updated student data.');
          });
      })
      .catch(() => {
        setLoading(false);
        alert('Error updating student data. Please try again.');
      });
  };

  const applicationCompleted = documentUploaded;

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-2.5 z-50 md:pl-20 md:pr-20">
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
            fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14
            transition-all duration-100 ease-in-out
            ${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
            ${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[45px] md:p-2'}
          `}
        >
          <div className="hidden md:flex justify-end mb-4">
            <FontAwesomeIcon
              icon={sidebarActive ? faTimes : faBars}
              className="text-white cursor-pointer text-[1.5rem]"
              onClick={toggleSidebar}
            />
          </div>

          <ul className="flex flex-col h-full mt-6 space-y-10">
            {[
              { icon: faHouse, label: 'Dashboard', to: '/studentdashboard' },
              { icon: faFileAlt, label: 'Apply', isButton: true, onClick: handleApplyClick, disabled: documentUploaded },
              { icon: faDownload, label: 'Report', to: '/studentreport' },
              { icon: faBell, label: 'Notification', to: '/messages' },
              { icon: faCog, label: 'Settings', to: '/studentsetting' },
              { icon: faSignOutAlt, label: 'Logout', isLogout: true },
            ].map((item, index) => (
              <li key={index} className="group relative">
                {item.isLogout ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const token = sessionStorage.getItem('authToken');
                      axios.post('https://e-bursary-backend.onrender.com/api/logout', {}, {
                        headers: { Authorization: `Bearer ${token}` }
                      }).finally(() => {
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
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>{item.label}</span>
                  </a>
                ) : item.isButton ? (
                  <a
                    href="#"
                    onClick={item.disabled ? undefined : item.onClick}
                    className={`flex items-center space-x-2 ${
                      sidebarActive ? 'justify-start' : 'justify-center'
                    } ${item.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>{item.label}</span>
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className={`flex items-center space-x-2 ${
                      sidebarActive ? 'justify-start' : 'justify-center'
                    }`}
                  >
                    <div className="relative">
                      <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
                      {item.label === 'Notification' && hasNewMessage && (
                        <span className="absolute -top-2 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full"></span>
                      )}
                    </div>
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>{item.label}</span>
                  </Link>
                )}
                {!sidebarActive && (
                  <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-sm">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 -mt-6 md:mt-0 pt-4 ${sidebarActive ? 'ml-[0px] md:ml-[210px]' : 'ml-0 md:ml-[50px]'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-1 md:col-span-3 flex justify-center items-center min-h-[300px]">
                <span className="text-gray-500 text-lg animate-pulse">Loading...</span>
              </div>
            ) : Object.keys(studentDetails).length > 0 ? (
              <>
                {/* Bursary Funds & Status */}
                <div className="flex flex-col gap-4">
                  <div className="p-4 flex flex-col items-center bg-white/80 border shadow-xl rounded-2xl">
                    <h2 className="font-bold mb-1">Bursary funds allocated:</h2>
                    <p>{studentDetails.bursary ? `${Number(studentDetails.bursary).toLocaleString()} Ksh` : "0.00 Ksh"}</p>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500 text-4xl" />
                  </div>
                  <div className="p-4 flex flex-col items-center bg-white/80 border shadow-xl rounded-2xl">
                    <h2 className="font-bold mb-1">Status of the application:</h2>
                    <p>{studentDetails.status}</p>
                    <FontAwesomeIcon
                      icon={getStatusIcon(studentDetails.status).icon}
                      className={`${getStatusIcon(studentDetails.status).color} text-4xl`}
                    />
                  </div>
                </div>

                {/* User Profile */}
                <div className="p-6 flex flex-col items-center bg-white/80 border shadow-xl rounded-2xl">
                  <h2 className="font-bold mb-2">User Profile</h2>
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
                  <h5 className="font-bold mt-4">{studentDetails.fullname}</h5>
                  <p>Student</p>
                  <p><strong>Student No:</strong> {studentDetails.admission}</p>
                  <p><strong>School:</strong> {studentDetails.institution}</p>
                </div>

                {/* Personal Information */}
                <div className="p-6 bg-white/80 border shadow-xl rounded-2xl">
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    <h2 className="font-bold mr-4">Personal Information</h2>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-auto"
                      onClick={handleEditClick}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Update Profile
                    </button>
                  </div>
                  <table className="table-auto w-full text-left">
                    <tbody>
                      <tr><th className="pr-4">Full name:</th><td>{studentDetails.fullname}</td></tr>
                      <tr><th className="pr-4">Email:</th><td>{studentDetails.email}</td></tr>
                      <tr><th className="pr-4">Sub County:</th><td>{studentDetails.subcounty}</td></tr>
                      <tr><th className="pr-4">Ward:</th><td>{studentDetails.ward}</td></tr>
                      <tr><th className="pr-4">Village:</th><td>{studentDetails.village}</td></tr>
                      <tr><th className="pr-4">Date of birth:</th><td>{studentDetails.birth}</td></tr>
                      <tr><th className="pr-4">Sex:</th><td>{studentDetails.gender}</td></tr>
                      <tr><th className="pr-4">Institution:</th><td>{studentDetails.institution}</td></tr>
                      <tr><th className="pr-4">Year:</th><td>{studentDetails.year}</td></tr>
                      <tr><th className="pr-4">Admission:</th><td>{studentDetails.admission}</td></tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-6 bg-white/80 border shadow-xl rounded-2xl text-center">
                <h2>{userName}, your Dashboard is currently empty</h2>
                <p>Please click on the <strong>Apply</strong> icon to complete your information.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditFormVisible && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={handleCloseForm}></div>
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
              <FontAwesomeIcon
                icon={faTimes}
                className="absolute top-2 right-2 cursor-pointer"
                onClick={handleCloseForm}
              />
              <form onSubmit={handleFormSubmit}>
                {[
                  { id: 'fullname', label: 'Full Name', type: 'text' },
                  { id: 'email', label: 'Email', type: 'email' },
                  { id: 'subcounty', label: 'Sub County', type: 'text' },
                  { id: 'ward', label: 'Ward', type: 'text' },
                  { id: 'village', label: 'Village Unit', type: 'text' },
                  { id: 'birth', label: 'Date of Birth', type: 'date' },
                  { id: 'gender', label: 'Sex', type: 'text' },
                  { id: 'institution', label: 'Institution', type: 'text' },
                  { id: 'year', label: 'Year', type: 'text' },
                  { id: 'admission', label: 'Admission', type: 'text' },
                ].map(({ id, label, type }) => (
                  <div key={id} className="mb-3 flex items-center">
                    <label htmlFor={id} className="w-32">{label}:</label>
                    <input
                      type={type}
                      id={id}
                      name={id}
                      value={formData[id] || ''}
                      onChange={handleInputChange}
                      className="flex-1 border px-2 py-1 rounded"
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button type="submit" className="bg-[#14213d] text-white px-4 py-2 rounded">Save</button>
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
