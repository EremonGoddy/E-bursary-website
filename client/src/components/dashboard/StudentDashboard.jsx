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
} from '@fortawesome/free-solid-svg-icons';
import "./Dashboard.css";

const StudentDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [studentDetails, setStudentDetails] = useState({});
  const [isEditFormVisible, setEditFormVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Function to toggle sidebar active state
  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');

    if (!token) {
      navigate('/signin');
    } else {
      setUserName(name);

      axios
        .get('http://localhost:5000/api/student', {
          headers: { Authorization: token },
        })
        .then((response) => {
          setStudentDetails(response.data);
          setFormData(response.data);
        })
        .catch((error) => console.error('Error fetching student data:', error));
    }
  }, [navigate]);

  const handleEditClick = () => {
    setEditFormVisible(true);
  };

  const handleCloseForm = () => {
    setEditFormVisible(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    axios
      .put('http://localhost:5000/api/student/update', formData, {
        headers: { Authorization: token },
      })
      .then((response) => {
        setStudentDetails(response.data);
        setEditFormVisible(false);
      })
      .catch((error) => console.error('Error updating student data:', error));
  };

  const isStudentRegistered = Object.keys(studentDetails).length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Fixed Top Bar */}
      <div className="topbar bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-20">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">EBursary</h1>
          <h2 className="text-lg font-semibold">Welcome: {userName}</h2>
          <div className=" image flex space-x-2">
            <img
              src="/images/patient.png"
              alt="User"
              className="rounded-full w-10 h-10"
            />
            <FontAwesomeIcon icon={faComments} className=" message text-3xl" />
          </div>
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex flex-row pt-20">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarActive ? 'active' : ''} w-64 text-white p-4 h-full transition-transform`}>
          <div className="d-flex flex-column">
            <FontAwesomeIcon
              icon={faBars}
              className="bi bi-list text-white text-2xl mb-4 cursor-pointer"
              id="btn"
              onClick={toggleSidebar}
            />
            <ul className="space-y-14  items-center">
              <li>
                <Link to="/student" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faHouse} className="icon text-lg" />
                  <span className="links-name">Dashboard</span>
                </Link>
                <span className="tooltip">Dashboard</span>
              </li>
              <li>
                <Link to="/personaldetails" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faFileAlt} className="icon text-lg" />
                  <span className="links-name">Apply</span>
                </Link>
                <span className="tooltip">Apply</span>
              </li>
              <li>
                <Link to="/documentupload" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faPaperclip} className="icon text-lg" />
                  <span className="links-name">File attached</span>
                </Link>
                <span className="tooltip">File attached</span>
              </li>
              <li>
                <Link to="/studentreport" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faDownload} className="icon text-lg" />
                  <span className="links-name">Download Report</span>
                </Link>
                <span className="tooltip">Download Report</span>
              </li>
              <li>
                <Link to="#" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faComments} className="icon text-lg" />
                  <span className="links-name">Messages</span>
                </Link>
                <span className="tooltip">Messages</span>
              </li>
              <li>
                <Link to="/studentsetting" className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faCog} className="icon text-lg" />
                  <span className="links-name">Settings</span>
                </Link>
                <span className="tooltip">Settings</span>
              </li>
              <li>
                <Link to="/" className="flex items-center space-x-2 text-red-500">
                  <FontAwesomeIcon icon={faSignOutAlt} className="icon text-lg" />
                  <span className="links-name">Logout</span>
                </Link>
                <span className="tooltip">Logout</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isStudentRegistered ? (
              <>
                {/* Bursary Funds & Status */}
                <div className="bg-white p-6 shadow rounded-md">
                  <h2 className="text-xl font-bold">Bursary funds allocated:</h2>
                  <p>{studentDetails.bursary}</p>
                  <FontAwesomeIcon icon={faCashRegister} className="text-green-500" />
                  <h2 className="text-xl font-bold mt-6">Status of the application:</h2>
                  <p>{studentDetails.status}</p>
                  <FontAwesomeIcon icon={faCheckDouble} className="text-blue-500" />
                </div>

                {/* User Profile */}
                <div className="bg-white p-6 shadow rounded-md">
                  <h2 className="text-xl font-bold">User Profile</h2>
                  <hr className="my-4" />
                  <div className="text-center">
                    <img
                      className="rounded-full w-24 h-24 mx-auto"
                      src="/images/patient.png"
                      alt="Profile"
                    />
                    <h5 className="text-lg font-semibold mt-4">
                      {studentDetails.fullname}
                    </h5>
                    <p className="text-gray-500">Student</p>
                  </div>
                  <hr className="my-4" />
                  <p>
                    <strong>Student No:</strong> {studentDetails.admission}
                  </p>
                  <p>
                    <strong>School:</strong> {studentDetails.institution}
                  </p>
                </div>

                {/* Personal Information */}
                <div className="bg-white p-6 shadow rounded-md">
                  <h2 className="text-xl font-bold">Personal Information</h2>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
                    onClick={handleEditClick}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Update Profile
                  </button>
                  <hr className="my-4" />
                  <table className="table-auto w-full text-left">
                    <tbody>
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
              <div className="  bg-white p-6 shadow rounded-md text-center">
                <h2 className="text-xl font-bold">Dashboard is empty</h2>
                <p>Please click on the 'Apply' icon in the sidebar to complete your information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;