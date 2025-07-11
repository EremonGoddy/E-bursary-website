import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faUser,
  faFileAlt,
  faDownload,
  faChartBar,
  faCog,
  faSignOutAlt,
  faBell,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

const CommitteeReport = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [studentDetails, setStudentDetails] = useState({});
  const [bursaryInfo, setBursaryInfo] = useState({});
  const [userName, setUserName] = useState('');
  const [applicationInfo, setApplicationInfo] = useState({});
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
        .get('https://e-bursary-backend.onrender.com/api/comreport', {
          headers: { Authorization: token },
        })
        .then((response) => {
          setStudentDetails(response.data);
        })
        .catch((error) => console.error('Error fetching student data:', error));
    }

    axios
      .get('https://e-bursary-backend.onrender.com/api/committee-count')
      .then((response) => {
        setBursaryInfo({
          totalFunds: response.data.amount,
          allocated: response.data.allocated,
          remaining: response.data.remaining,
        });
      })
      .catch((error) => console.error('Error fetching bursary info:', error));

    axios
      .get('https://e-bursary-backend.onrender.com/api/quick-statistics')
      .then((response) => {
        setApplicationInfo({
          total: response.data.total,
          approved: response.data.approved,
          rejected: response.data.rejected,
        });
      })
      .catch((error) => console.error('Error fetching application statistics:', error));
  }, [navigate]);

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

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.setFont('times', 'normal');
    doc.setFontSize(25);
    doc.text('Bursary Report', 105, 20, null, null, 'center');
    doc.setFontSize(20);
    doc.text('Generated by Bursary Management System', 105, 30, null, null, 'center');
    doc.line(10, 35, 200, 35);

    // Personal Information Table
    const personalInfo = [
      ['Reference Number', studentDetails.reference_number || 'N/A'],
      ['Full Name', studentDetails.fullname || 'N/A'],
      ['Email', studentDetails.email || 'N/A'],
      ['Phone No', studentDetails.phone_no || 'N/A'],
      ['National ID', studentDetails.national_id || 'N/A'],
      ['Sub County', studentDetails.subcounty || 'N/A'],
      ['Ward', studentDetails.ward || 'N/A'],
      ['Position', studentDetails.position || 'N/A'],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Personal Information', 'Details']],
      body: personalInfo,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontSize: 14 },
      bodyStyles: { fontSize: 12 },
      styles: { font: 'times' },
    });

    // Bursary Information Table
    const bursaryData = [
      ['Total Funds Available', bursaryInfo.totalFunds || 'N/A'],
      ['Allocated Funds', bursaryInfo.allocated || 'N/A'],
      ['Remaining Funds', bursaryInfo.remaining || 'N/A'],
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Bursary Information', 'Details']],
      body: bursaryData,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255], fontSize: 14 },
      bodyStyles: { fontSize: 12 },
      styles: { font: 'times' },
    });

    // Application Information Table
    const applicationData = [
      ['Total Applications', applicationInfo.total || 'N/A'],
      ['Approved Applications', applicationInfo.approved || 'N/A'],
      ['Rejected Applications', applicationInfo.rejected || 'N/A'],
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Application Information', 'Details']],
      body: applicationData,
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43], textColor: [255, 255, 255], fontSize: 14 },
      bodyStyles: { fontSize: 12 },
      styles: { font: 'times' },
    });

    // Declaration Table
    const declarationInfo = [
      ['Declaration', 'I hereby confirm the above details are accurate and complete.'],
      ['Committee Member Name', '________________________'],
      ['Signature', '________________________'],
      ['Date', '________________________'],
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Declaration', '']],
      body: declarationInfo,
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43], textColor: [255, 255, 255], fontSize: 14 },
      bodyStyles: { fontSize: 12, halign: 'left' },
      styles: { font: 'times' },
    });

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 290);
    doc.text('Bursary Management System', 105, 290, null, null, 'center');

    doc.save('Bursary_Report.pdf');
  };

  // Prepare report data for mobile-friendly view
  const reportRows = [
    { label: 'Reference Number', value: studentDetails.reference_number || 'N/A' },
    { label: 'Application Title', value: 'Committee Report' },
    { label: 'Download Application', value: (
      <button
        type="button"
        onClick={downloadReport}
        aria-label="Download Application"
        className="bg-transparent border-0 p-0 m-0 cursor-pointer"
      >
        <FontAwesomeIcon icon={faDownload} className="text-blue-500" />
      </button>
    ) },
  ];

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
                alt="Committee"
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
                <Link to="/committeedashboard" className={`
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
            {/* Profile */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/committeeprofile" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faUser} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Profile</span>
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
                  Profile
                </span>
              </div>
            </li>
            {/* Student Information */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/userdetails" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faUsers} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Student Info</span>
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
                  Student Info
                </span>
              </div>
            </li>
            {/* Analysis */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/committeereport" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faChartBar} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Analysis</span>
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
                  Analysis
                </span>
              </div>
            </li>
            {/* Settings */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/committeesetting" className={`
                  flex items-center w-full space-x-2 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faCog} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Settings</span>
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
                  Settings
                </span>
              </div>
            </li>
            {/* Logout */}
            <li className="relative group">
              <div className="flex items-center">
                <Link to="/" className={`
                  flex items-center w-full space-x-2 mt-25 md:mt-50 text-white no-underline
                  transition-all duration-200
                  ${sidebarActive ? 'justify-start pl-[10px]' : 'justify-center'}
                `}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-[1.2rem] md:text-[1.4rem]" />
                  <span className={`transition-all duration-200 ${sidebarActive ? 'text-[1rem] md:text-[1.1rem] inline ml-[10px]' : 'hidden'}`}>Logout</span>
                </Link>
                <span className={`
                  absolute left-[60px] top-1/2 mt-[0px] md:mt-[98px] -translate-y-1/2
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

        {/* Main Content Area */}
        <div className={`flex-1 ml-8 md:ml-30 p-4 transition-all duration-300`}>
          <div className="bg-white rounded-lg max-w-[340px] md:max-w-[800px] shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] mx-auto -mt-4 md:mt-50 mb-4 md:mb-6 p-1 md:p-8">
            <h1 className="text-1xl md:text-2xl font-bold mb-2 text-center">Bursary Report</h1>
            {/* Responsive Report Info: vertical on mobile, table on md+ */}
            <div>
              {/* Mobile vertical layout */}
              <div className="block md:hidden">
                {reportRows.map((row) => (
                  <div key={row.label} className="flex items-center py-2 border-b last:border-b-0">
                    <span className="font-semibold w-1/2 text-[1rem] bg-blue-500 text-white px-2 py-1 rounded-1">
                      {row.label}
                    </span>
                    <span className="w-1/2 text-[1rem] bg-white-100 px-2 py-1 rounded-r">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              {/* Desktop table layout */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse bg-white shadow-md rounded">
                  <thead>
                    <tr className="bg-blue-500 text-white text-[1.1rem]">
                      <th className="p-2 text-left">Reference Number</th>
                      <th className="p-2 text-left">Application Title</th>
                      <th className="p-2 text-left">Download Application</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b text-[1.1rem]">
                      <td className="p-2">{studentDetails.reference_number || 'N/A'}</td>
                      <td className="p-2">Committee Report</td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={downloadReport}
                          aria-label="Download Application"
                          className="bg-transparent border-0 p-0 m-0 cursor-pointer"
                        >
                          <FontAwesomeIcon
                            icon={faDownload}
                            className="text-blue-500"
                          />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* End Responsive Table Wrapper */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeReport;