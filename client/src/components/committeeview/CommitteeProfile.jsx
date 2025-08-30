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

const CommitteeProfile = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [userName, setUserName] = useState('');
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
  const [editing, setEditing] = useState(false);

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
        setEditing(false);
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

        <div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:-mt-8 ${sidebarActive ? 'ml-[28px] md:ml-[190px]' : 'ml-[40px] md:ml-[30px]'}`}>
          <div className="w-[98%] max-w-[500px] mx-auto bg-white p-6 shadow rounded-md">
            {isProfileFetched ? (
              profileExists && !editing ? (
                <div>
                  <h2 className="md:text-2xl text-[1.2rem] font-bold mb-2 text-center">Committee Profile</h2>
                  <div className="space-y-4">
                    {Object.entries(formData).map(([key, value]) => (
                      <div className="flex" key={key}>
                        <span className="font-semibold w-30 capitalize">{key.replace('_', ' ')}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setEditing(true)} className="mt-4 w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-700 font-semibold">
                    <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-[1.2rem] md:text-2xl font-bold mb-2 text-center">{profileExists ? 'Edit Profile' : 'Create Profile'}</h2>
                  <div>
                    <label htmlFor="fullname" className="block text-[#14213d] font-medium mb-0">Full Name</label>
                    <input
                      type="text"
                      id="fullname"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                      placeholder="Enter Full Name"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="email" className="block text-[#14213d] font-medium mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                      placeholder="Enter Email"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="phone_no" className="block text-[#14213d] font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      id="phone_no"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                      placeholder="Enter Phone Number"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="national_id" className="block text-[#14213d] font-medium mb-1">National ID</label>
                    <input
                      type="text"
                      id="national_id"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleChange}
                      className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                      placeholder="Enter National ID"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="subcounty" className="block text-[#14213d] font-medium mb-1">Subcounty</label>
                    <input
                      type="text"
                      id="subcounty"
                      name="subcounty"
                      value={formData.subcounty}
                      onChange={handleChange}
                      className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                      placeholder="Enter Subcounty"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="ward" className="block text-[#14213d] font-medium mb-1">Ward</label>
                    <input
                      type="text"
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                      placeholder="Enter Ward"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="position" className="block text-[#14213d] font-medium mb-1">Position</label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                      placeholder="Enter Position"
                      required
                    />
                  </div>
                  <button type="submit" className="mt-5 w-full bg-[#14213d] cursor-pointer hover:bg-gray-600 text-white rounded py-2 hover:bg-blue-700 font-semibold">
                    {profileExists ? 'Update Profile' : 'Submit'}
                  </button>
                </form>
              )
            ) : (
              <p className="text-center">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeProfile;