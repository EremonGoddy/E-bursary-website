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
} from '@fortawesome/free-solid-svg-icons';

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

const handleEditClick = () => setEditFormVisible(true);
const handleCloseForm = () => setEditFormVisible(false);

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
<div className="w-full min-h-screen relative">
{/* Overlay for Edit Form */}
{isEditFormVisible && (
<div
className="fixed inset-0 bg-black bg-opacity-40 z-40"
onClick={handleCloseForm}
></div>
)}

{/* Fixed Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
<div className="flex items-center space-x-6">
<h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
Welcome: {studentDetails.fullname || userName}
</h2>
<div className="flex items-center space-x-2">
<img
src="/images/patient.png"
alt="User"
className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-2 md:mr-20"
/>
<FontAwesomeIcon icon={faBell} className="text-2xl md:text-2xl" />
</div>
</div>
</div>
</div>

<div className="flex pt-20 min-h-screen">
{/* Sidebar */}
<div
className={`
fixed top-0 left-0 z-30 bg-[#1F2937] 
h-screen 
${sidebarActive ?  'w-[180px]  md:w-[210px]' 
    : 'w-[40px]  md:w-[50px]'} 
mt-10
text-white p-4 
flex flex-col
transition-all duration-300
min-h-screen
md:min-h-screen
`}
>
<FontAwesomeIcon
icon={faBars}
className={`
 text-white 
${sidebarActive ? 'transform translate-x-[130px] md:translate-x-[150px]' : ''}
text-[1.4rem] md:text-[1.7rem] -ml-2 md:-ml-1.5 mt-4 transition-all duration-300 cursor-pointer self-start
`}
onClick={toggleSidebar}
/>
<ul className="space-y-10 md:space-y-12 mt-1 md:mt-4 pl-0">
  {/* Dashboard */}
  <li className="list-none mt-[30px] text-center relative group">
    <div className="flex items-center">
      <Link to="/student" className={`
        flex items-center w-full space-x-2 text-white no-underline
        transition-all duration-200
        ${sidebarActive ? 'justify-start md:pl-[10px]' : 'justify-center'}
      `}>
        <FontAwesomeIcon icon={faHouse} className="text-[1.2rem] md:text-[1.4rem]" />
        <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Dashboard</span>
      </Link>
      <span className={`
        absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
        rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
        text-center shadow-lg transition-all duration-300 ease-in-out
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        leading-[40px] h-[40px] block
        ${sidebarActive ? 'hidden' : 'block'}
      `}>
        Dashboard
      </span>
    </div>
  </li>
  {/* Apply */}
  <li className="relative group">
    <div className="flex items-center">
      <Link to="/personaldetails" className={`
        flex items-center w-full space-x-2 text-white no-underline
        transition-all duration-200
        ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
      `}>
        <FontAwesomeIcon icon={faFileAlt} className="text-[1.2rem] md:text-[1.4rem]" />
        <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Apply</span>
      </Link>
      <span className={`
        absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
        rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
        text-center shadow-lg transition-all duration-300 ease-in-out
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        leading-[35px] h-[35px] block
        ${sidebarActive ? 'hidden' : 'block'}
      `}>
        Apply
      </span>
    </div>
  </li>
  {/* File attached */}
  <li className="relative group">
    <div className="flex items-center">
      <Link to="/documentupload" className={`
        flex items-center w-full space-x-2 text-white no-underline
        transition-all duration-200
        ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
      `}>
        <FontAwesomeIcon icon={faPaperclip} className="text-[1.2rem] md:text-[1.4rem]" />
        <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>File attached</span>
      </Link>
      <span className={`
        absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
        rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
        text-center shadow-lg transition-all duration-300 ease-in-out
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        leading-[35px] h-[35px] block
        ${sidebarActive ? 'hidden' : 'block'}
      `}>
        File attached
      </span>
    </div>
  </li>
  {/* Download Report */}
  <li className="relative group">
    <div className="flex items-center">
      <Link to="/studentreport" className={`
        flex items-center w-full space-x-2 text-white no-underline
        transition-all duration-200
        ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
      `}>
        <FontAwesomeIcon icon={faDownload} className="text-[1.2rem] md:text-[1.4rem]" />
        <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Download Report</span>
      </Link>
      <span className={`
        absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
        rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
        text-center shadow-lg transition-all duration-300 ease-in-out
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        leading-[35px] h-[35px] block
        ${sidebarActive ? 'hidden' : 'block'}
      `}>
        Download Report
      </span>
    </div>
  </li>
  {/* Messages */}
  <li className="relative group">
    <div className="flex items-center">
      <Link to="#" className={`
        flex items-center w-full space-x-2 text-white no-underline
        transition-all duration-200
        ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
      `}>
        <FontAwesomeIcon icon={faComments} className="text-[1.2rem] md:text-[1.4rem]" />
        <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Messages</span>
      </Link>
      <span className={`
        absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
        rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
        text-center shadow-lg transition-all duration-300 ease-in-out
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        leading-[35px] h-[35px] block
        ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
      `}>
        Messages
      </span>
    </div>
  </li>
  {/* Settings */}
  <li className="relative group">
    <div className="flex items-center">
      <Link to="/studentsetting" className={`
        flex items-center w-full space-x-2 text-white no-underline
        transition-all duration-200
        ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
      `}>
        <FontAwesomeIcon icon={faCog} className="text-[1.2rem] md:text-[1.4rem]" />
        <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[2px] md:ml-[10px]' : 'hidden'}`}>Settings</span>
      </Link>
      <span className={`
        absolute left-[60px] top-1/2 mt-[5px] -translate-y-1/2
        rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
        text-center shadow-lg transition-all duration-300 ease-in-out
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        leading-[35px] h-[35px] block
        ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
      `}>
        Settings
      </span>
    </div>
  </li>
  {/* Logout */}
  <li className="relative group">
    <div className="flex items-center">
      <Link to="/" className={`
        flex items-center w-full space-x-2 mt-25 md:mt-20 text-white no-underline
        transition-all duration-200
        ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
      `}>
        <FontAwesomeIcon icon={faSignOutAlt} className="text-[1.2rem] md:text-[1.4rem]" />
        <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Logout</span>
      </Link>
      <span className={`
        absolute left-[60px] top-1/2 mt-[0px] md:mt-[38px] -translate-y-1/2
        rounded-[5px] w-[122px] bg-[#1F2937] text-white font-semibold
        text-center shadow-lg transition-all duration-300 ease-in-out
        opacity-0 group-hover:opacity-100
        pointer-events-none group-hover:pointer-events-auto
        leading-[35px] h-[35px] block
        ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] hidden' : 'block'}
      `}>
        Logout
      </span>
    </div>
  </li>
</ul>
</div>

{/* Main Content */}
        <div className="flex-1 ml-0 md:ml-64 p-4 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isStudentRegistered ? (
              <>
                {/* Bursary Funds & Status */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white p-4 shadow rounded flex flex-col items-center mb-2">
                    <h2 className="text-lg font-bold mb-1">Bursary funds allocated:</h2>
                    <p className="mb-2">{studentDetails.bursary}</p>
                    <FontAwesomeIcon icon={faCashRegister} className="text-green-500 text-2xl" />
                  </div>
                  <div className="bg-white p-4 shadow rounded flex flex-col items-center">
                    <h2 className="text-lg font-bold mb-1">Status of the application:</h2>
                    <p className="mb-2">{studentDetails.status}</p>
                    <FontAwesomeIcon icon={faCheckDouble} className="text-blue-500 text-2xl" />
                  </div>
                </div>
                {/* User Profile */}
                <div className="bg-white p-6 shadow rounded flex flex-col items-center">
                  <h2 className="text-xl font-bold mb-2">User Profile</h2>
                  <hr className="my-4 w-full" />
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
                  <hr className="my-4 w-full" />
                  <p>
                    <strong>Student No:</strong> {studentDetails.admission}
                  </p>
                  <p>
                    <strong>School:</strong> {studentDetails.institution}
                  </p>
                </div>
                {/* Personal Information */}
                <div className="bg-white p-6 shadow rounded">
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faUser} className="text-gray-500 text-2xl mr-2" />
                    <h2 className="text-xl font-bold">Personal Information</h2>
                  </div>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 mb-4 rounded hover:bg-blue-600"
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
<div
className={`
 bg-white p-6 shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] rounded-md  col-span-1
transition-all duration-300
w-[300px]   // <-- Add this for a fixed width of 700px
md:w-[500px]
mx-auto     // <-- Center it horizontally
mt-10
md:mt-60
${sidebarActive
? 'ml-[180px] md:ml-[450px]'  // 100px on mobile, 450px on md+
: 'ml-[35px] md:ml-[300px]'   // 20px on mobile, 300px on md+
}
`}

  
>
<h2 className="text-[1rem] md:text-[1.3rem] font-bold text-center">Dashboard is empty</h2>
<p className="block text-[1rem] md:text-[1.1rem]" >Please click on the 'Apply' icon in the sidebar to complete your information.</p>
</div>
)}
</div>
{/* Edit Form Modal */}
          {isEditFormVisible && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-3">
                    <label htmlFor="fullname" className="block font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullname"
                      name="fullname"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.fullname || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="block font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subcounty" className="block font-medium mb-1">
                      Sub County
                    </label>
                    <input
                      type="text"
                      id="subcounty"
                      name="subcounty"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.subcounty || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ward" className="block font-medium mb-1">
                      Ward
                    </label>
                    <input
                      type="text"
                      id="ward"
                      name="ward"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.ward || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="village" className="block font-medium mb-1">
                      Village Unit
                    </label>
                    <input
                      type="text"
                      id="village"
                      name="village"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.village || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="birth" className="block font-medium mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="birth"
                      name="birth"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.birth || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="gender" className="block font-medium mb-1">
                      Sex
                    </label>
                    <input
                      type="text"
                      id="gender"
                      name="gender"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="institution" className="block font-medium mb-1">
                      Name of Institution
                    </label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.institution || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="year" className="block font-medium mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      id="year"
                      name="year"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.year || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="admission" className="block font-medium mb-1">
                      Admission
                    </label>
                    <input
                      type="text"
                      id="admission"
                      name="admission"
                      className="form-input w-full border rounded px-3 py-2"
                      value={formData.admission || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={handleCloseForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;