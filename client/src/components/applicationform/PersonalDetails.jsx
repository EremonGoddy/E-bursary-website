import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faFileAlt, faPaperclip, faDownload, faComments, faCog,
  faSignOutAlt, faBars, faBell,
} from '@fortawesome/free-solid-svg-icons';

const PersonalDetails = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    subcounty: '',
    ward: '',
    village: '',
    birth: '',
    gender: '',
    institution: '',
    year: '',
    admission: ''
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  useEffect(() => {
    axios
      .get('https://e-bursary-backend.onrender.com/api/students/all-names')
      .then((res) => {
        setAllStudents(
          (res.data || []).map(stu => ({
            fullname: stu.fullname?.trim().toLowerCase(),
            email: stu.email?.trim().toLowerCase()
          }))
        );
      })
      .catch(() => setAllStudents([]));
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

    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/personal-details/user/${userId}`)
        .then(res => {
          if (res.data && res.data.user_id) {
            navigate('/Amountdetails');
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          if (error.response && error.response.status === 404) {
            setLoading(false);
          } else {
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/application-status/${userId}`)
        .then(res => {
          const { personal_details, amount_details, family_details, disclosure_details } = res.data;
          if (personal_details && amount_details && family_details && disclosure_details) {
            navigate('/documentupload');
          } else if (personal_details && amount_details && family_details) {
            navigate('/disclosuredetails');
          } else if (personal_details && amount_details) {
            navigate('/familydetails');
          } else if (personal_details) {
            navigate('/amountdetails');
          }
        })
        .catch(err => {
          console.error('Error fetching application progress', err);
        });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const enteredName = (formData.fullname || "").trim().toLowerCase();
    const enteredEmail = (formData.email || "").trim().toLowerCase();
    const duplicate = allStudents.find(
      stu => stu.fullname === enteredName || stu.email === enteredEmail
    );
    if (duplicate) {
      setErrorMsg("This email or full name is already registered.");
      return;
    }

    axios.post('https://e-bursary-backend.onrender.com/api/personal-details', formData)
      .then(response => {
        alert('Data inserted successfully');
        const userId = response.data.userId;
        sessionStorage.setItem('userId', userId);
        navigate('/Amountdetails');
      })
      .catch(error => {
        if (
          error.response &&
          (error.response.status === 409 ||
            (error.response.data &&
              /already registered|duplicate/i.test(error.response.data.message || "")))
        ) {
          setErrorMsg("This email or full name is already registered.");
        } else {
          setErrorMsg("There was an error inserting the data!");
        }
        console.error('There was an error inserting the data!', error);
      });
  };

  if (loading) return null;

  return (
    <div className="w-full min-h-screen relative bg-white-100">
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
          <div className="flex items-center space-x-6">
            <h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
              Welcome: {userName}
            </h2>
            <div className="flex items-center space-x-2">
              <img src="/images/patient.png" alt="User" className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-2 md:mr-20" />
              <FontAwesomeIcon icon={faBell} className="text-2xl md:text-2xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex pt-20 min-h-screen">
        <div className={`fixed top-0 left-0 z-30 bg-[#1F2937] h-screen ${sidebarActive ? 'w-[180px] md:w-[210px]' : 'w-[40px] md:w-[50px]'} mt-10 text-white p-4 flex flex-col transition-all duration-300 min-h-screen md:min-h-screen`}>
          <FontAwesomeIcon icon={faBars} className={`text-white ${sidebarActive ? 'transform translate-x-[130px] md:translate-x-[150px]' : ''} text-[1.4rem] md:text-[1.7rem] -ml-2 md:-ml-1.5 mt-4 transition-all duration-300 cursor-pointer self-start`} onClick={toggleSidebar} />
          <ul className="space-y-10 md:space-y-12 mt-1 md:mt-4 pl-0">
            <li className="list-none mt-[30px] text-center relative group">
              <div className="flex items-center">
                <Link to="/student" className={`flex items-center w-full space-x-2 text-white no-underline transition-all duration-200 ${sidebarActive ? 'justify-start md:pl-[10px]' : 'justify-center'}`}>
                  <FontAwesomeIcon icon={faHouse} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Dashboard</span>
                </Link>
                <span className={`absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2 rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold text-center shadow-lg transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto leading-[40px] h-[40px] block ${sidebarActive ? 'hidden' : 'block'}`}>Dashboard</span>
              </div>
            </li>
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/personaldetails" className={`flex items-center w-full space-x-2 text-white no-underline transition-all duration-200 ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}`}>
                  <FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Apply</span>
                </Link>
                <span className={`absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2 rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold text-center shadow-lg transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto leading-[35px] h-[35px] block ${sidebarActive ? 'hidden' : 'block'}`}>Apply</span>
              </div>
            </li>
          </ul>
        </div>
        <div className={`flex-1 ml-10 md:ml-25 transition-all duration-300`}>
          <ProgressStepper currentStep={0} />
          <div className="bg-white rounded-lg max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Student Details</h2>
            {errorMsg && (
              <div className="mb-4 text-center text-red-600 font-semibold">{errorMsg}</div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label htmlFor="fullname" className="block font-medium mb-1">Full Name</label>
                <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter Full Name" required />
              </div>
              <div>
                <label htmlFor="email" className="block font-medium mb-1">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter Email" required />
              </div>
              <div>
                <label htmlFor="subcounty" className="block font-medium mb-1">Sub County</label>
                <input type="text" id="subcounty" name="subcounty" value={formData.subcounty} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter Sub County" required />
              </div>
              <div>
                <label htmlFor="ward" className="block font-medium mb-1">Ward</label>
                <input type="text" id="ward" name="ward" value={formData.ward} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter Ward" required />
              </div>
              <div>
                <label htmlFor="village" className="block font-medium mb-1">Village Unit</label>
                <input type="text" id="village" name="village" value={formData.village} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter your village" required />
              </div>
              <div>
                <label htmlFor="birth" className="block font-medium mb-1">Date of Birth</label>
                <input type="date" id="birth" name="birth" value={formData.birth} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block font-medium mb-1">Gender</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} className="form-radio text-blue-600" required />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} className="form-radio text-blue-600" required />
                    <span className="ml-2">Female</span>
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="institution" className="block font-medium mb-1">Name of Institution</label>
                <input type="text" id="institution" name="institution" value={formData.institution} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter institution" required />
              </div>
              <div>
                <label htmlFor="year" className="block font-medium mb-1">Year</label>
                <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter year of education" required />
              </div>
              <div>
                <label htmlFor="admission" className="block font-medium mb-1">Admission</label>
                <input type="text" id="admission" name="admission" value={formData.admission} onChange={handleChange} className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500" placeholder="Enter Admission" required />
              </div>
            </form>
            <div className="flex justify-end mt-8">
              <button type="submit" onClick={handleSubmit} className="bg-blue-600 text-white px-10 py-2 min-w-[100px] md:min-w-[160px] rounded hover:bg-blue-700 transition duration-200">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
