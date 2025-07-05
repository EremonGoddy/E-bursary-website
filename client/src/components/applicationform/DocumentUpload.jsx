import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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
  const [documentList, setDocumentList] = useState([]);
  const navigate = useNavigate();

  const userId = sessionStorage.getItem('userId');

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

      if (response.data && response.data.toLowerCase().includes('success')) {
        setUploadStatus('File uploaded successfully!');
        setFormData({ documentName: '', document: null });
        fetchDocuments();
        setTimeout(() => navigate('/studentdashboard'), 1000);
      } else {
        setUploadStatus('File upload failed!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('File upload failed!');
    }
  };

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

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');

    if (!token) {
      navigate('/signin');
      return;
    }

    setUserName(name);
    fetchDocuments();
  }, [navigate]);

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
        <div className={`fixed top-0 left-0 z-30 bg-[#1F2937] h-screen ${sidebarActive ? 'w-[180px] md:w-[210px]' : 'w-[40px] md:w-[50px]'} mt-10 text-white p-4 flex flex-col transition-all duration-300`}>
          <FontAwesomeIcon icon={faBars} className={`text-white ${sidebarActive ? 'translate-x-[130px] md:translate-x-[150px]' : ''} text-[1.4rem] md:text-[1.7rem] -ml-2 md:-ml-1.5 mt-4 cursor-pointer`} onClick={toggleSidebar} />
          <ul className="space-y-10 md:space-y-12 mt-1 md:mt-4 pl-0">
            <li><Link to="/student" className={`flex items-center ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'} text-white`}><FontAwesomeIcon icon={faHouse} /><span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Dashboard</span></Link></li>
            <li><Link to="/personaldetails" className={`flex items-center ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'} text-white`}><FontAwesomeIcon icon={faFileAlt} /><span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Apply</span></Link></li>
            <li><Link to="/studentreport" className={`flex items-center ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'} text-white`}><FontAwesomeIcon icon={faDownload} /><span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Report</span></Link></li>
            <li><Link to="#" className={`flex items-center ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'} text-white`}><FontAwesomeIcon icon={faComments} /><span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Messages</span></Link></li>
            <li><Link to="/studentsetting" className={`flex items-center ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'} text-white`}><FontAwesomeIcon icon={faCog} /><span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Settings</span></Link></li>
            <li><Link to="/" className={`flex items-center ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'} text-white`}><FontAwesomeIcon icon={faSignOutAlt} /><span className={`${sidebarActive ? 'inline ml-[10px]' : 'hidden'}`}>Logout</span></Link></li>
          </ul>
        </div>

        <div className="flex-1 ml-10 md:ml-30 p-4">
          <ProgressStepper currentStep={4} />
          <div className="bg-white rounded-lg max-w-[300px] md:max-w-[600px] shadow-lg mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">Bursary Application Form</h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-gray-700">Document Upload</h2>

            {documentList.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-center text-blue-700">Your Uploaded Documents</h3>
                <ul className="space-y-2">
                  {documentList.map(doc => (
                    <li key={doc.id} className="border rounded p-2 flex justify-between items-center">
                      <span><FontAwesomeIcon icon={faPaperclip} className="mr-2 text-blue-500" />{doc.document_name}</span>
                      <a href={`https://e-bursary-backend.onrender.com/${doc.file_path.replace(/^\.\/uploads\//, 'uploads/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline text-sm">View</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div>
                <label className="block font-medium mb-2">Document Name</label>
                <input type="text" value={formData.documentName} readOnly className="form-input w-full border rounded px-3 py-2 bg-gray-100" placeholder="No file chosen" />
              </div>
              <div>
                <label className="block font-medium mb-2">Upload Document</label>
                <input type="file" onChange={handleFileChange} required className="form-input w-full border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex justify-end mt-8">
                <button type="submit" className="bg-blue-600 text-white px-10 py-2 rounded hover:bg-blue-700">Submit</button>
              </div>
            </form>

            {uploadStatus && <div className="mt-4 text-center text-[1rem] font-bold {uploadStatus.includes('success') ? 'text-green-600' : 'text-red-600'}">{uploadStatus}</div>}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentupload;
