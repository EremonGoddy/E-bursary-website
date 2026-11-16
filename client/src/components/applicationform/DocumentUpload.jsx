import React, { useEffect, useState } from 'react';
import ProgressStepper from './ProgressStepper';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faFileAlt,
  faTimes,
  faPaperclip,
  faDownload,
  faCog,
  faSignOutAlt,
  faBars,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'https://e-bursary-backend.onrender.com';

const Documentupload = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [documents, setDocuments] = useState({
    admissionLetter: null,
    feesStructure: null,
    guardianIdCopy: null,
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const [documentList, setDocumentList] = useState([]);

  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  const toggleSidebar = () => {
    setSidebarActive((active) => !active);
  };

  const handleFileChange = (event, field) => {
    const file = event.target.files?.[0] || null;

    setDocuments((previous) => ({
      ...previous,
      [field]: file,
    }));

    setUploadStatus('');
  };

  const fetchDocuments = async () => {
    if (!userId) {
      setDocumentList([]);
      setDocumentUploaded(false);
      return;
    }

    try {
      // This endpoint exists in the backend code you shared.
      const response = await axios.get(
        `${API_URL}/api/get-document/${userId}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      setDocumentList(data);

      const hasUploadedDocument = data.some(
        (record) =>
          record.admission_letter ||
          record.fees_structure ||
          record.parent_guardian_id
      );

      setDocumentUploaded(Boolean(hasUploadedDocument));
    } catch (error) {
      console.error(
        'Error fetching uploaded documents:',
        error.response?.status,
        error.response?.data || error.message
      );
      setDocumentList([]);
      setDocumentUploaded(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadStatus('');

    // Capture the form before awaiting the request.
    const form = event.currentTarget;

    if (!userId) {
      setUploadStatus('User not found. Please login again.');
      return;
    }

    if (
      !documents.admissionLetter ||
      !documents.feesStructure ||
      !documents.guardianIdCopy
    ) {
      setUploadStatus('Please upload all three required documents.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('userId', userId);
    formDataToSend.append('admissionLetter', documents.admissionLetter);
    formDataToSend.append('feesStructure', documents.feesStructure);
    formDataToSend.append('guardianIdCopy', documents.guardianIdCopy);

    try {
      // Let the browser/Axios set the multipart boundary automatically.
      const response = await axios.post(
        `${API_URL}/api/upload`,
        formDataToSend
      );

      const successMessage =
        typeof response.data === 'string'
          ? response.data
          : response.data?.message;

      if (
        response.status < 200 ||
        response.status >= 300 ||
        !successMessage?.toLowerCase().includes('success')
      ) {
        throw new Error(
          successMessage || 'The server did not confirm the upload.'
        );
      }

      setUploadStatus('Files uploaded successfully!');
      setDocuments({
        admissionLetter: null,
        feesStructure: null,
        guardianIdCopy: null,
      });
      form.reset();

      await fetchDocuments();
      setTimeout(() => navigate('/studentdashboard'), 800);
    } catch (error) {
      console.error(
        'Error uploading files:',
        error.response?.status,
        error.response?.data || error.message
      );

      const responseData = error.response?.data;
      const errorMessage =
        typeof responseData === 'string'
          ? responseData
          : responseData?.error || responseData?.message;

      setUploadStatus(errorMessage || error.message || 'File upload failed!');
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const currentUserId = sessionStorage.getItem('userId');

    if (!token) {
      navigate('/signin');
      return;
    }

    setUserName(name || '');

    axios
      .get(`${API_URL}/api/student`, {
        headers: {
          Authorization: token,
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })
      .then((response) => {
        setStudentDetails(response.data || {});
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          navigate('/signin');
        } else {
          console.error('Error fetching student details:', error);
        }
      });

    if (currentUserId) {
      axios
        .get(`${API_URL}/api/status-message/user/${currentUserId}`, {
          headers: { Authorization: token },
        })
        .then((response) => {
          const message = response.data?.status_message;
          setHasNewMessage(
            Boolean(message && message.toLowerCase().includes('new'))
          );
        })
        .catch((error) => {
          if (error.response?.status !== 404) {
            console.error('Error checking status message:', error);
          }
        });

      fetchDocuments();
    }
  }, [navigate]);

  const uploadedDocuments = documentList.flatMap((record) => [
    {
      label: 'Admission Letter',
      path: record.admission_letter,
    },
    {
      label: 'Fees Structure',
      path: record.fees_structure,
    },
    {
      label: 'Parent/Guardian ID Copy',
      path: record.parent_guardian_id,
    },
  ]).filter((document) => document.path);

  const getDocumentUrl = (filePath) => {
    if (/^https?:\/\//i.test(filePath)) {
      return filePath;
    }

    // The backend stores production uploads under /tmp/uploads.
    // The static route exposes that directory at /uploads.
    const filename = filePath
      .replace(/\\/g, '/')
      .split('/')
      .pop();

    return `${API_URL}/uploads/${encodeURIComponent(filename)}`;
  };

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">
            EBursary
          </h1>

          <div className="flex items-center space-x-1">
            <h2 className="mr-1 md:mr-5 text-sm md:text-lg font-bold text-[#14213d]">
              Welcome: {userName}
            </h2>

            <div className="flex items-center space-x-2">
              <img
                src={
                  studentDetails.gender === 'Female'
                    ? '/images/woman.png'
                    : studentDetails.gender === 'Male'
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
                className="text-xl cursor-pointer text-[#14213d]"
                onClick={toggleSidebar}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-20 min-h-screen">
        <div
          className={`
            fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14
            transition-all duration-100 ease-in-out
            overflow-visible
            ${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
            ${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[36px] md:p-2'}
          `}
        >
          <div className="hidden md:flex justify-end mb-4">
            <FontAwesomeIcon
              icon={sidebarActive ? faTimes : faBars}
              className={`text-white cursor-pointer text-xl ${
                sidebarActive ? 'ml-auto' : 'mr-1'
              }`}
              onClick={toggleSidebar}
            />
          </div>

          <ul className="flex flex-col h-full mt-6 space-y-10">
            {[
              {
                icon: faHouse,
                label: 'Dashboard',
                to: '/studentdashboard',
              },
              {
                icon: faFileAlt,
                label: 'Apply',
                isButton: true,
                onClick: () => navigate('/personaldetails'),
                disabled: documentUploaded,
              },
              {
                icon: faDownload,
                label: 'Report',
                to: '/studentreport',
              },
              {
                icon: faBell,
                label: 'Notification',
                to: '/messages',
              },
              {
                icon: faCog,
                label: 'Settings',
                to: '/studentsetting',
              },
              {
                icon: faSignOutAlt,
                label: 'Logout',
                isLogout: true,
              },
            ].map((item, index) => (
              <li
                className={`group relative ${item.isLogout ? 'mt-30 md:mt-55' : ''}`}
                key={index}
              >
                {item.isLogout ? (
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      const token = sessionStorage.getItem('authToken');

                      axios
                        .post(
                          `${API_URL}/api/logout`,
                          {},
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        )
                        .catch(() => {})
                        .finally(() => {
                          sessionStorage.clear();
                          setDocumentUploaded(false);
                          navigate('/');
                        });
                    }}
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      sidebarActive ? 'justify-start' : 'justify-center'
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span
                      className={`${
                        sidebarActive
                          ? 'inline-block ml-2 font-semibold'
                          : 'hidden'
                      }`}
                    >
                      {item.label}
                    </span>
                  </a>
                ) : item.isButton ? (
                  <a
                    href="#"
                    onClick={item.disabled ? undefined : item.onClick}
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      sidebarActive ? 'justify-start' : 'justify-center'
                    } ${
                      item.disabled
                        ? 'pointer-events-none opacity-60 cursor-not-allowed'
                        : ''
                    }`}
                    aria-disabled={item.disabled ? 'true' : 'false'}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span
                      className={`${
                        sidebarActive
                          ? 'inline-block ml-2 font-semibold'
                          : 'hidden'
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
                    <div className="relative">
                      <FontAwesomeIcon icon={item.icon} className="text-xl" />
                      {item.label === 'Notification' && hasNewMessage && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>

                    <span
                      className={`${
                        sidebarActive
                          ? 'inline-block ml-2 font-semibold'
                          : 'hidden'
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

        <div
          className={`flex-1 md:ml-25 transition-all duration-300 ${
            sidebarActive
              ? 'ml-[0px] md:ml-[200px]'
              : 'ml-0 md:ml-[50px]'
          }`}
        >
          <ProgressStepper currentStep={4} />

          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[350px] md:max-w-[600px] mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center text-[#14213d]">
              Bursary Application Form
            </h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-[#14213d]">
              Document Upload Form
            </h2>

            {uploadedDocuments.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-center text-blue-700">
                  Your Uploaded Documents
                </h3>

                <ul className="space-y-2">
                  {uploadedDocuments.map((document) => (
                    <li
                      key={document.label}
                      className="border rounded p-2 flex justify-between items-center"
                    >
                      <span>
                        <FontAwesomeIcon
                          icon={faPaperclip}
                          className="mr-2 text-blue-500"
                        />
                        {document.label}
                      </span>

                      <a
                        href={getDocumentUrl(document.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="admissionLetter"
                  className="block font-medium text-[#14213d] mb-2"
                >
                  Admission Letter
                </label>
                <input
                  type="file"
                  id="admissionLetter"
                  name="admissionLetter"
                  onChange={(event) =>
                    handleFileChange(event, 'admissionLetter')
                  }
                  required
                  className="form-input w-full border border-gray-300 rounded px-2 py-1 focus:border-[#14213d] file:mr-4 file:py-2 file:px-4 file:border-0 file:font-semibold file:bg-blue-50 file:cursor-pointer file:text-[#14213d] hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="feesStructure"
                  className="block font-medium text-[#14213d] mb-2"
                >
                  Fees Structure
                </label>
                <input
                  type="file"
                  id="feesStructure"
                  name="feesStructure"
                  onChange={(event) =>
                    handleFileChange(event, 'feesStructure')
                  }
                  required
                  className="form-input w-full border border-gray-300 rounded px-2 py-1 focus:border-[#14213d] file:mr-4 file:py-2 file:px-4 file:border-0 file:font-semibold file:bg-blue-50 file:cursor-pointer file:text-[#14213d] hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="guardianIdCopy"
                  className="block font-medium text-[#14213d] mb-2"
                >
                  Parent/Guardian ID Copy
                </label>
                <input
                  type="file"
                  id="guardianIdCopy"
                  name="guardianIdCopy"
                  onChange={(event) =>
                    handleFileChange(event, 'guardianIdCopy')
                  }
                  required
                  className="form-input w-full border border-gray-300 rounded px-2 py-1 focus:border-[#14213d] file:mr-4 file:py-2 file:px-4 file:border-0 file:font-semibold file:bg-blue-50 file:cursor-pointer file:text-[#14213d] hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="bg-[#14213d] text-white px-10 py-2 font-bold cursor-pointer min-w-[100px] md:min-w-[160px] rounded focus:ring-2 focus:ring-indigo-600 transition duration-200"
                >
                  Submit
                </button>
              </div>
            </form>

            {uploadStatus && (
              <div className="mt-4 text-center">
                <p
                  className={`font-bold ${
                    uploadStatus.toLowerCase().includes('success')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
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