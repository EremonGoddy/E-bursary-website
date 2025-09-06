import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faUser,
  faUsers,
  faCog,
  faBell,
  faChartBar,
  faSignOutAlt,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import "./Overlay.css";

const CommitteeProfile = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [userName, setUserName] = useState('');
  const [isEditFormVisible, setEditFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone_no: '',
    national_id: '',
    subcounty: '',
    ward: '',
    position: '',
  });
  const [isProfileFetched, setIsProfileFetched] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');

    if (!token) {
      navigate('/signin');
    } else {
      setUserName(name);
      axios
        .get('https://e-bursary-backend.onrender.com/api/profile-committee', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsProfileFetched(true);
          const data = response.data;
          if (data) {
            setFormData(data);
            setProfileExists(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching profile data:', error);
          setIsProfileFetched(true);
          setProfileExists(false);
        });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    axios
      .post('https://e-bursary-backend.onrender.com/api/profile-form', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Profile created/updated successfully');
        setProfileExists(true);
        setEditFormVisible(false);
      })
      .catch((error) => {
        console.error('Error submitting committee data:', error);
        alert('Error submitting data. Please try again.');
      });
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
    } else {
      axios
        .get('https://e-bursary-backend.onrender.com/api/profile-committee', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setCommitteeDetails(response.data);
        })
        .catch((error) => {
          console.error('Error fetching profile data:', error);
        });
    }
  }, [navigate]);

  const navItems = [
    { icon: faHouse, label: 'Dashboard', to: '/committeedashboard' },
    { icon: faUser, label: 'Profile', to: '/committeeprofile' },
    { icon: faUsers, label: 'Student Info', to: '/userdetails' },
    { icon: faBell, label: 'Analysis', to: '/committeereport' },
    { icon: faChartBar, label: 'Notification', to: '/committeereport' },
    { icon: faCog, label: 'Settings', to: '/committeesetting' },
    { icon: faSignOutAlt, label: 'Logout', isLogout: true }
  ];

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-2.5 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
          <div className="flex items-center space-x-1">
            <h2 className="mr-1 md:mr-5 text-[1rem] md:text-[1.2rem] font-bold text-[#14213d]">
              Welcome: {committeeDetails.name || userName}
            </h2>
            <div className="flex items-center space-x-2">
              <img
                src={
                  committeeDetails.gender === 'Female'
                    ? '/images/woman.png'
                    : committeeDetails.gender === 'Male'
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

      <div className="flex flex-col md:flex-row pt-20 min-h-screen">
        {/* Sidebar */}
        <div
          className={`
            fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14
            transition-all duration-100 ease-in-out
            overflow-visible
            ${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
            ${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[45px] md:p-2'}
          `}
        >
          <div className="hidden md:flex justify-end mb-4">
            <FontAwesomeIcon
              icon={faBars}
              className={`text-white cursor-pointer text-[1.5rem] ${sidebarActive ? 'ml-auto' : 'mr-2'}`}
              onClick={toggleSidebar}
            />
          </div>
          <ul className="flex flex-col h-full mt-6 space-y-10">
            {navItems.map((item, index) => (
              <li className={`group relative ${item.isLogout ? 'mt-30 md:mt-45' : ''}`} key={index}>
                {item.isLogout ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const token = sessionStorage.getItem('authToken');
                      axios
                        .post('https://e-bursary-backend.onrender.com/api/logout', {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                        .catch(() => {})
                        .finally(() => {
                          sessionStorage.clear();
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
                {!sidebarActive && (
                  <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-[1.1rem] w-[120px] flex items-center justify-center z-50">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:-mt-10 ${sidebarActive ? 'ml-[28px] md:ml-[190px]' : 'ml-[40px] md:ml-[30px]'}`}>
          <div className="w-[98%] backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[500px] mx-auto pt-1 pr-6 pl-6 pb-4">
            {isProfileFetched ? (
              profileExists ? (
                <div>
                    <FontAwesomeIcon icon={faUser} className="text-[#14213d] text-2xl mt-4 md:text-2xl mr-2" />
                  <h2 className="text-xl font-bold ml-7 -mt-7  text-[1.2rem] md:text-[1.3rem] text-[#14213d]">Committee Profile</h2>
                   <button
                    onClick={() => setEditFormVisible(true)}
                    className="bg-blue-500 text-white px-3 cursor-pointer md:px-1 md:py-1 text-[1rem] md:text-[1.1rem] font-bold -mt-7 rounded hover:bg-blue-600 ml-auto flex items-center"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-[1rem] md:text-[1.1rem]" /> Edit Profile
                  </button>
                   <hr className="my-4" />
                  <div className="space-y-5 text-[1rem] md:text-[1.1rem] text-[#14213d]">
                    {Object.entries(formData).map(([key, value]) => (
                      <div className="flex gap-10" key={key}>
                        <span className="  font-semibold w-30 capitalize">{key.replace('_', ' ')}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-[#14213d] text-2xl md:text-3xl font-bold text-center mb-1">Create Profile</h2>
                  {['fullname','email','phone_no','national_id','subcounty','ward','position'].map((field) => (
                    <div className="mb-2" key={field}>
                      <label className="block text-[#14213d] font-semibold mb-1 capitalize">{field.replace('_', ' ')}</label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#14213d]">
                        <input
                          type={field === 'email' ? 'email' : 'text'}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          placeholder={`Enter ${field.replace('_',' ')}`}
                          className="w-full py-2 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="text-white w-full py-2 cursor-pointer rounded-lg bg-[#14213d] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fca311]"
                  >
                    Create Profile
                  </button>
                </form>
              )
            ) : (
              <p className="text-center">Loading...</p>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Overlay Edit Form with CSS animation */}
      {isEditFormVisible && (
        <div className={`shadow-overlay ${isEditFormVisible ? 'fade-in' : 'fade-out'} flex justify-center items-center`}>
<div className="bg-white p-3 rounded-[0.5rem] shadow-lg w-full max-w-[330px] md:max-w-[500px] relative pl-3 pr-3 md:pr-6 md:pl-6">
  <button
    onClick={() => setEditFormVisible(false)}
    className="absolute top-1 right-1 md:right-2 w-8 h-8 flex items-center justify-center 
             text-[#14213d] font-bold hover:text-[#14213d] hover:bg-gray-200 
             rounded-full text-xl md:text-[1.7rem] cursor-pointer 
             transition duration-200 ease-in-out active:scale-90"
  >
    ✕
  </button>
  <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
  <form onSubmit={handleSubmit} className="space-y-3">
    {['fullname','email','phone_no','national_id','subcounty','ward','position'].map((field) => (
      <div key={field} className="flex items-center gap-3">
        <label 
          htmlFor={field} 
          className="block font-medium text-[1rem] md:text-[1.05rem] w-[110px] text-[#14213d]"
        >
          {field.replace('_',' ')}:
        </label>
        <input
          id={field}
          type={field === 'email' ? 'email' : 'text'}
          name={field}
          value={formData[field]}
          onChange={handleChange}
          placeholder={field.replace('_',' ')}
          className="flex-1 max-w-[320px] text-[1rem] md:text-[1.05rem] border border-gray-300 rounded-md px-3 md:px-3 md:py-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#14213d] focus:border-transparent transition duration-200"
          required
        />
      </div>
    ))}
    <button
      type="submit"
      className="px-3 py-1 md:px-4 md:py-2 bg-[#14213d] text-white font-medium rounded-md hover:bg-gray-800 transition"
    >
      Update Profile
    </button>
  </form>
</div>

        </div>
      )}
    </div>
  );
};

export default CommitteeProfile;
