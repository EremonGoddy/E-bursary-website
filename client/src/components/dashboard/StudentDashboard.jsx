// StudentDashboard.js (Fixed Apply Button & Logout Button sessionStorage clearing)

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

  const handleApplyClick = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/signin');
      return;
    }

    try {
      const res = await axios.get(`https://e-bursary-backend.onrender.com/api/application-status/${userId}`, {
        headers: { Authorization: token }
      });

      const { personalCompleted, amountCompleted, familyCompleted, disclosureCompleted, documentCompleted } = res.data;

      if (!personalCompleted) navigate('/personaldetails');
      else if (!amountCompleted) navigate('/amountdetails');
      else if (!familyCompleted) navigate('/familydetails');
      else if (!disclosureCompleted) navigate('/disclosuredetails');
      else if (!documentCompleted) navigate('/documentupload');
      else navigate('/student');

    } catch (error) {
      console.error(error);
      navigate('/personaldetails');
    }
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/signin');
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');

    if (!token) {
      navigate('/signin');
    } else {
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
          setStudentDetails({});
          setFormData({});
          navigate('/signin');
        }
        console.error('Error fetching student data:', error);
      });

      if (userId) {
        axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`)
        .then((res) => setDocumentUploaded(res.data.uploaded === true))
        .catch(() => setDocumentUploaded(false));
      }
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

    axios.put('https://e-bursary-backend.onrender.com/api/student/update', formData, {
      headers: { Authorization: token },
    })
    .then(() => {
      axios.get('https://e-bursary-backend.onrender.com/api/student', {
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

  // Render JSX (omitted for brevity)

  return (
    <div>
      {/* Existing JSX goes here, using handleApplyClick for Apply button and handleLogout for Logout button */}
    </div>
  );
};

export default StudentDashboard;
