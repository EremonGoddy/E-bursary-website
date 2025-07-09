import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faUser,
  faFileAlt,
  faChartBar,
  faCog,
  faSignOutAlt,
  faBell,
  faUsers,
  faEdit
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

  return (
    <div className="w-full min-h-screen relative bg-white-100">
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
          <div className="flex items-center space-x-6">
            <h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
              Welcome:{userName}
            </h2>
            <div className="flex items-center space-x-2">
              <img
                src="/images/patient.png"
                alt="Committee"
                className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-2 md:mr-20"
              />
              <FontAwesomeIcon icon={faBell} className="text-2xl md:text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-20 min-h-screen">
        <div className={`fixed top-0 left-0 z-30 bg-[#1F2937] h-screen ${sidebarActive ? 'w-[180px] md:w-[210px]' : 'w-[40px] md:w-[50px]'} mt-10 text-white p-4 flex flex-col transition-all duration-300 min-h-screen`}>
          <FontAwesomeIcon
            icon={faBars}
            className={`text-white ${sidebarActive ? 'transform translate-x-[130px] md:translate-x-[150px]' : ''} text-[1.4rem] md:text-[1.7rem] -ml-2 md:-ml-1.5 mt-4 transition-all duration-300 cursor-pointer self-start`}
            onClick={toggleSidebar}
          />
          <ul className="space-y-10 md:space-y-12 mt-1 md:mt-4 pl-0">
            <li className="list-none mt-[30px] text-center relative group">
              <Link to="/committeedashboard" className={`flex items-center w-full space-x-2 text-white no-underline ${sidebarActive ? 'justify-start md:pl-[10px]' : 'justify-center'}`}>
                <FontAwesomeIcon icon={faHouse} className="text-[1.2rem] md:text-[1.4rem]" />
                <span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Dashboard</span>
              </Link>
            </li>
            <li className="relative group">
              <Link to="/committeeprofile" className={`flex items-center w-full space-x-2 text-white no-underline ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}`}>
                <FontAwesomeIcon icon={faUser} className="text-[1.2rem] md:text-[1.4rem]" />
                <span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Profile</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className={`flex-1 ml-0 md:ml-64 p-4 -mt-6 md:mt-2 ${sidebarActive ? 'ml-[28px] md:ml-[190px]' : 'ml-[40px] md:ml-[30px]'}`}>
          <div className="w-[98%] max-w-[500px] mx-auto bg-white p-8 shadow rounded-md mt-0">
            {isProfileFetched ? (
              profileExists && !editing ? (
                <div>
                  <h2 className="md:text-2xl text-[1.2rem] font-bold mb-4 text-center">Committee Profile</h2>
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
                  <h2 className="text-[1.2rem] md:text-2xl font-bold mb-4 text-center">{profileExists ? 'Edit Profile' : 'Create Profile'}</h2>
                  {Object.keys(formData).map((field) => (
                    <div className="mb-3 flex items-center" key={field}>
                      <label className="w-30 mr-2 capitalize">{field.replace('_', ' ')}:</label>
                      <input
                        type="text"
                        name={field}
                        className="form-input w-full border rounded px-3 py-1"
                        value={formData[field]}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  ))}
                  <button type="submit" className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-700 font-semibold">
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
