import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faFileAlt,
  faPaperclip,
  faDownload,
  faComments,
  faCog,
  faSignOutAlt,
  faBars,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

const Documentupload = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    documentName: '',
    document: null,
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const disclosureData = location.state || {};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        documentName: file.name,
        document: file,
      });
    }
  };

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('documentName', formData.documentName);
    formDataToSend.append('document', formData.document);

    axios.post('https://e-bursary-backend.onrender.com/api/upload', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        setUploadStatus('File uploaded successfully!');
        setShowSummary(true);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        setUploadStatus('File upload failed!');
        setShowSummary(false);
      });
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    if (!token) {
      navigate('/signin');
    } else {
      setUserName(name);
    }
  }, [navigate]);

  return (
    <div className="w-full min-h-screen relative bg-white-100">
      {/* Top Bar */}
      {/* ... (keep existing sidebar/topbar code) ... */}
      <div className={`flex-1 ml-10 md:ml-30 p-4 transition-all duration-300`}>
        <ProgressStepper currentStep={4} />
        <div className="bg-white rounded-lg  max-w-[300px] md:max-w-[600px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto  -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
          <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Document Upload Form</h2>
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
          {/* Show summary after successful upload */}
          {showSummary && (
            <div className="mt-6 text-left">
              <h3 className="text-lg font-semibold mb-2">Submitted Data:</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {JSON.stringify({ ...disclosureData, documentName: formData.documentName }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documentupload;