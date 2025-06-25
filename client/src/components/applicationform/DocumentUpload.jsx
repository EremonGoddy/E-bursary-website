import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faFileAlt, faPaperclip, faDownload, faComments, faCog,
  faSignOutAlt, faBars, faBell,
} from '@fortawesome/free-solid-svg-icons';

const Documentupload = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    documentName: '',
    document: null,
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const [existingDocument, setExistingDocument] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Add userId from session
  const userId = sessionStorage.getItem('userId');

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      documentName: file ? file.name : '',
      document: file || null,
    });
    setUploadStatus('');
  };

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  // Handle file upload submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus('');
    if (!formData.document || !formData.documentName) {
      setUploadStatus('Please select a document to upload.');
      return;
    }
    if (!userId) {
      setUploadStatus('User not found. Please login again.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('documentName', formData.documentName);
    formDataToSend.append('document', formData.document);
    formDataToSend.append('userId', userId);

    try {
      const response = await axios.post(
        'https://e-bursary-backend.onrender.com/api/upload',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (
        typeof response.data === 'string' &&
        response.data.toLowerCase().includes('success')
      ) {
        setUploadStatus('File uploaded successfully!');
        setFormData({ documentName: '', document: null });
        // Refresh list after upload
        fetchDocuments();
        // Optionally redirect after a delay
        setTimeout(() => navigate('/studentdashboard'), 800);
      } else {
        setUploadStatus('File upload failed!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('File upload failed!');
    }
  };

  // Fetch all uploaded documents for this user
  const fetchDocuments = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`https://e-bursary-backend.onrender.com/api/upload/list/${userId}`);
      if (Array.isArray(res.data)) {
        setDocumentList(res.data);
      } else {
        setDocumentList([]);
      }
    } catch (err) {
      setDocumentList([]);
    }
  };

  // On mount: check login, fetch user and documents, or redirect if already uploaded (single upload scenario)
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');
    if (!token) {
      navigate('/signin');
      return;
    }
    setUserName(name);

    // Check if document already uploaded (single-upload scenario)
    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`)
        .then(res => {
          // If a document is already uploaded, redirect or show existing
          if (res.data && res.data.user_id) {
            setExistingDocument(res.data);
            // Optionally, to allow multiple uploads, fetch all documents instead of redirecting
            fetchDocuments();
            // Uncomment if you want to redirect on first upload
            // navigate('/studentdashboard');
          }
        })
        .catch(err => {
          // If 404, user can upload; if other error, handle as needed
          if (err.response && err.response.status !== 404) {
            setUploadStatus('Error checking upload status!');
          }
        });
      // Always fetch all documents for the user (for list view)
      fetchDocuments();
    }
    // eslint-disable-next-line
  }, [navigate]);

  // Delete document handler (optional, if you want users to remove their uploads)
  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`https://e-bursary-backend.onrender.com/api/upload/${docId}`);
      setUploadStatus('Document deleted!');
      fetchDocuments();
    } catch (err) {
      setUploadStatus('Error deleting document.');
    }
  };

  return (
    <div className="w-full min-h-screen relative bg-white-100">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
          <div className="flex items-center space-x-6">
            <h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
              Welcome: {userName}
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
            ${sidebarActive ? 'w-[180px] md:w-[210px]' : 'w-[40px] md:w-[50px]'} 
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
            {/* Download Report */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/studentreport" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faDownload} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Report</span>
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
                  Report
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
                        
        <div className={`flex-1 ml-10 md:ml-30 p-4 transition-all duration-300`}>
          <ProgressStepper currentStep={4} />
          <div className="bg-white rounded-lg max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Document Upload Form</h2>

            {/* Display all uploaded documents */}
            {documentList.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-center text-blue-700">Your Uploaded Documents</h3>
                <ul className="space-y-2">
                  {documentList.map(doc => (
                    <li key={doc.id || doc.file_path} className="border rounded p-2 flex justify-between items-center">
                      <span>
                        <FontAwesomeIcon icon={faPaperclip} className="mr-2 text-blue-500" />
                        {doc.document_name}
                      </span>
                      <span className="flex items-center gap-3">
                        <a
                          href={`https://e-bursary-backend.onrender.com/${doc.file_path.replace(/^(\.\/)?uploads\//, 'uploads/')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline text-sm"
                        >
                          View
                        </a>
                        {/* Optional: delete button */}
                        {/* <button
                          className="text-red-600 text-xs underline"
                          onClick={() => handleDelete(doc.id)}
                        >
                          Delete
                        </button> */}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="documentName" className="block font-medium mb-2">Document Name</label>
                <input
                  type="text"
                  value={formData.documentName}
                  readOnly
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 bg-gray-100"
                  placeholder="No file chosen"
                />
              </div>
              <div>
                <label htmlFor="document" className="block font-medium mb-2">Upload Document</label>
                <input
                  type="file"
                  id="document"
                  name="document"
                  onChange={handleFileChange}
                  required
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-10 py-2 min-w-[100px] md:min-w-[160px] rounded hover:bg-blue-700 transition duration-200"
                >
                  Submit
                </button>
              </div>
            </form>
            {uploadStatus && (
              <div className="mt-4 text-center">
                <p className={`font-bold text-[1rem] md:text-[1.1rem] ${uploadStatus.includes('success') ? "text-green-600" : "text-red-600"}`}>
                  {uploadStatus}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentupload;