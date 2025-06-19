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
  const [studentDetails, setStudentDetails] = useState({});
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
  const [allNames, setAllNames] = useState([]);

  const navigate = useNavigate();

  // Toggle sidebar
  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMsg(""); // clear previous error as user types
  };

  // Fetch all student names on mount for duplicate check
  useEffect(() => {
    axios
      .get('https://e-bursary-backend.onrender.com/api/students/all-names') // You must create this endpoint in your backend!
      .then((res) => {
        setAllNames((res.data || []).map(stu => stu.fullname?.trim().toLowerCase()));
      })
      .catch(() => setAllNames([]));
  }, []);

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(""); // clear error before submitting

    // Check for a duplicate full name (case-insensitive, trimmed)
    const enteredName = (formData.fullname || "").trim().toLowerCase();
    if (allNames.includes(enteredName)) {
      setErrorMsg("This full name is already registered.");
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
        // Check if backend returns a 409 for duplicate or use error message from backend
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

  // On mount, get token and student details
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    if (!token) {
      navigate('/signin');
    } else {
      setUserName(name);

      axios.get('https://e-bursary-backend.onrender.com/api/student', {
        headers: { Authorization: token },
      })
        .then((response) => {
          setStudentDetails(response.data);
        })
        .catch(error => console.error('Error fetching student data:', error));
    }
  }, [navigate]);

  return (
    <div className="w-full min-h-screen relative bg-white-100">
      {/* ... Top bar and sidebar as before ... */}

      {/* Main Content Area */}
      <div className={`flex-1 ml-10 md:ml-25 transition-all duration-300`}>
        <ProgressStepper currentStep={0} />
        <div className="bg-white rounded-lg max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
          <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Student Details</h2>
          {errorMsg && (
            <div className="mb-4 text-center text-red-600 font-semibold">{errorMsg}</div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* ... all your input fields as before ... */}
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
  );
};

export default PersonalDetails;