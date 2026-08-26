import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faFileAlt,
  faPaperclip,
  faDownload,
  faComments,
  faCog,
  faTimes,
  faSignOutAlt,
  faBars,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Client-side background remover:
 * - src: image URL or dataURL
 * - options: { bgColor: [r,g,b], fuzz: number(0-255), blurPx: number }
 * Returns a Promise resolving to a PNG dataURL with transparent background.
 *
 * Notes:
 * - If the image is cross-origin, the server must allow CORS (Access-Control-Allow-Origin).
 * - If canvas getImageData throws (tainted), the promise rejects.
 */
async function removeBackgroundFromImage(src, { bgColor = [245, 245, 245], fuzz = 40, blurPx = 1 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // required for cross-origin images (backend must allow CORS)
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // Draw image to canvas
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, w, h);
      } catch (err) {
        reject(new Error('Canvas is tainted (CORS issue) or getImageData failed.'));
        return;
      }

      const data = imageData.data;
      const [bgR, bgG, bgB] = bgColor;
      const fuzziness = Math.max(1, Math.min(255, fuzz));

      // Create alpha mask by making near-bg pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];

        // Use max channel difference as a simple distance metric
        const maxDiff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));

        if (maxDiff <= fuzziness) {
          // Proportionally reduce alpha: exact bg -> fully transparent
          const factor = maxDiff / fuzziness; // 0..1
          data[i+3] = Math.round(a * factor);
        }
      }

      // Put data back
      ctx.putImageData(imageData, 0, 0);

      // Optionally blur to smooth edges - use an output canvas if ctx.filter is supported
      if (blurPx > 0 && typeof ctx.filter !== 'undefined') {
        const outCanvas = document.createElement('canvas');
        outCanvas.width = w;
        outCanvas.height = h;
        const outCtx = outCanvas.getContext('2d');
        outCtx.clearRect(0, 0, w, h);
        outCtx.filter = `blur(${blurPx}px)`;
        outCtx.drawImage(canvas, 0, 0);
        resolve(outCanvas.toDataURL('image/png'));
      } else {
        // No blur or browser doesn't support ctx.filter
        resolve(canvas.toDataURL('image/png'));
      }
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load image: ' + (e?.message || 'unknown error')));
    };

    // If src is a blob/object URL or dataURL, crossOrigin may be ignored but it's fine.
    img.src = src;
  });
}

const StudentReport = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
  const [studentProfile, setStudentProfile] = useState({});
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  // Fetch reports and student profile, process signature to remove background
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    if (!token) {
      navigate('/signin');
      return;
    }
    setUserName(name);

    // Async fetch wrapper
    (async () => {
      try {
        const response = await axios.get('https://e-bursary-backend.onrender.com/api/reports', {
          headers: { Authorization: token },
        });

        const data = response.data || {};

        // If committee_signature exists, attempt to process it
        if (data.committee_signature) {
          try {
            // Tune bgColor and fuzz based on the typical signature background.
            // If the background is pure white, you can use [255,255,255] and a lower fuzz.
            const processedDataUrl = await removeBackgroundFromImage(data.committee_signature, {
              bgColor: [245, 245, 245], // try [255,255,255] if background is pure white
              fuzz: 40,                 // increase if the background is grayish
              blurPx: 1                 // small blur to smooth edges
            });

            // Replace the signature URL with the processed transparent PNG data URL
            data.committee_signature = processedDataUrl;
          } catch (err) {
            // Processing failed (likely CORS / tainted canvas). Keep original.
            console.warn('Signature background removal failed, using original signature:', err);
          }
        }

        setStudentDetails(data);
      } catch (error) {
        console.error('Error fetching student report data:', error);
      }
    })();

    // Fetch student profile data (unchanged)
    axios
      .get('https://e-bursary-backend.onrender.com/api/student', {
        headers: { Authorization: token },
      })
      .then((response) => {
        setStudentProfile(response.data);
      })
      .catch((error) => {
        setStudentProfile({});
      });
  }, [navigate]);

  // Check for new messages and document upload status
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');

    if (!token) {
      navigate('/signin');
      return;
    }

    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, {
        headers: { Authorization: token }
      })
        .then(response => {
          const message = response.data.status_message;
          if (message && message.toLowerCase().includes("new")) {
            setHasNewMessage(true);
          } else {
            setHasNewMessage(false);
          }
        })
        .catch(err => {
          console.error('Error checking status message:', err);
        });
    }

    if (userId) {
      axios
        .get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, {
          headers: { Authorization: token }
        })
        .then((res) => {
          const isUploaded = res.data && res.data.uploaded === true;
          setDocumentUploaded(isUploaded);
        })
        .catch(() => setDocumentUploaded(false));
    }
  }, [navigate]);

  // Handle Apply click
  const handleApplyClick = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/personaldetails');
      return;
    }
    try {
      const res = await axios.get(`https://e-bursary-backend.onrender.com/api/personal-details/user/${userId}`);
      if (res.data && res.data.user_id) {
        navigate('/Amountdetails');
      } else {
        navigate('/personaldetails');
      }
    } catch {
      navigate('/personaldetails');
    }
  };

  // Download PDF utility
  const downloadReport = React.useCallback(() => {
    const doc = new jsPDF();
    doc.setFont('times', 'normal');

    // Title Section
    doc.setFontSize(25);
    doc.text('Bursary Report', 105, 20, null, null, 'center');
    doc.setFontSize(20);
    doc.text('Generated by Bursary Management System', 105, 30, null, null, 'center');
    doc.line(10, 35, 200, 35);

    // Table Data
    const personalInfo = [
      ['Reference Number', studentDetails.reference_number || 'N/A'],
      ['Full Name', studentDetails.fullname || 'N/A'],
      ['Sub County', studentDetails.subcounty || 'N/A'],
      ['Ward', studentDetails.ward || 'N/A'],
      ['Institution', studentDetails.institution || 'N/A'],
      ['Admission Number', studentDetails.admission || 'N/A'],
      ['Date of Birth', studentDetails.birth || 'N/A'],
      ['Gender', studentDetails.gender || 'N/A'],
    ];

    const bursaryInfo = [
      ['Allocated Amount', studentDetails.bursary || 'N/A'],
      ['Application Status', studentDetails.status || 'N/A'],
    ];

    // Render Personal Info Table
    autoTable(doc, {
      startY: 50,
      head: [['Personal Information', 'Details']],
      body: personalInfo,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontSize: 14 },
      bodyStyles: { fontSize: 12 },
      styles: { font: 'times' },
    });

    // Render Bursary Info Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Bursary Information', 'Details']],
      body: bursaryInfo,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255], fontSize: 14 },
      bodyStyles: { fontSize: 12 },
      styles: { font: 'times' },
    });

    // Declaration Table
    const declarationInfo = [
      ['Declaration', 'I hereby confirm the above details are accurate and complete.'],
      ['Approved by', studentDetails.approved_by_committee || 'N/A'],
      ['Allocation date', studentDetails.allocation_date || 'N/A'],
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

    // Add Committee Signature Section
    const signatureSectionY = doc.lastAutoTable.finalY + 20;

    if (studentDetails.committee_signature) {
      try {
        // Add signature heading
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('Committee Signature', 20, signatureSectionY);

        // Add signature image (supports dataURL PNG)
        doc.addImage(studentDetails.committee_signature, 'PNG', 20, signatureSectionY + 8, 50, 25);

        // Add approval date
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(`Approved: ${studentDetails.allocation_date || new Date().toLocaleDateString()}`, 20, signatureSectionY + 37);
      } catch (error) {
        console.error('Error adding signature image to PDF:', error);
        // Fallback if image cannot be added
        doc.setFontSize(10);
        doc.text('Committee Signature: [Signature on file]', 20, signatureSectionY);
      }
    } else {
      // No signature available
      doc.setFontSize(10);
      doc.text('Committee Signature: _____________________', 20, signatureSectionY);
    }

    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 290);
    doc.text('Bursary Management System', 105, 290, null, null, 'center');

    // Save must be LAST after all content is added!
    doc.save('Bursary_Report.pdf');
  }, [studentDetails]);

  // Prepare report data (for mobile)
  const reportRows = [
    { label: 'Reference Number', value: studentDetails.reference_number || 'N/A' },
    { label: 'Application Title', value: 'Bursary Application' },
    { label: 'Application Status', value: studentDetails.status || 'N/A' },
    { label: 'Download Application', value: (
      <button
        type="button"
        onClick={downloadReport}
        aria-label="Download Application"
        className="bg-transparent border-0 p-0 m-0 cursor-pointer"
      >
        <FontAwesomeIcon icon={faDownload} className="text-[#14213d]" />
      </button>
    )},
  ];

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
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
        {/* Sidebar */}
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
              className={`text-white cursor-pointer text-xl ${sidebarActive ? 'ml-auto' : 'mr-1'}`}
              onClick={toggleSidebar}
            />
          </div>

          <ul className="flex flex-col h-full mt-6 space-y-10">
            {[
              { icon: faHouse, label: 'Dashboard', to: '/studentdashboard' },
              { icon: faFileAlt, label: 'Apply', isButton: true, onClick: handleApplyClick, disabled: documentUploaded },
              { icon: faDownload, label: 'Report', to: '/studentreport' },
              { icon: faBell, label: 'Notification', to: '/messages' },
              { icon: faCog, label: 'Settings', to: '/studentsetting' },
              { icon: faSignOutAlt, label: 'Logout', isLogout: true }
            ].map((item, index) => (
              <li className={`group relative ${item.isLogout ? 'mt-30 md:mt-55' : ''}`} key={index}>
                {item.isLogout ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const token = sessionStorage.getItem('authToken');
                      axios
                        .post('https://e-bursary-backend.onrender.com/api/logout', {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                        .catch(() => { })
                        .finally(() => {
                          sessionStorage.clear();
                          setDocumentUploaded(false);
                          navigate('/');
                        });
                    }}
                    className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>{item.label}</span>
                  </a>
                ) : item.isButton ? (
                  <a
                    href="#"
                    onClick={item.disabled ? undefined : item.onClick}
                    className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'} ${item.disabled ? 'pointer-events-none opacity-60 cursor-not-allowed' : ''}`}
                    aria-disabled={item.disabled ? 'true' : 'false'}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>{item.label}</span>
                  </a>
                ) : (
                  <Link to={item.to} className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}>
                    <div className="relative">
                      <FontAwesomeIcon icon={item.icon} className="text-xl" />
                      {item.label === 'Notification' && hasNewMessage && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <span className={`${sidebarActive ? 'inline-block ml-2 text-xl font-semibold' : 'hidden'}`}>{item.label}</span>
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

        {/* Main Content Area */}
        <div className={`
          flex-1 md:ml-25 transition-all duration-300
          ${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[40px]'}`}>
          <div className=" backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[360px] md:max-w-[1500px] mx-auto -mt-6 md:mt-2 mb-4 md:mb-6 p-0 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-[#14213d] text-center">Bursary Report</h1>

            {/* Responsive Report Info: vertical on mobile, table on md+ */}
            <div>
              {/* Mobile vertical layout */}
              <div className="block md:hidden">
                {reportRows.map((row) => (
                  <div key={row.label} className="flex items-center py-2 border-b last:border-b-0">
                    <span className="font-semibold w-1/2 bg-[#14213d] text-white px-2 py-1 rounded-1">
                      {row.label}
                    </span>
                    <span className="w-1/2 bg-white-100 px-2 py-1 rounded-r">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desktop table layout */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse bg-white shadow-md rounded">
                  <thead>
                    <tr className="bg-[#14213d] text-white">
                      <th className="p-2 text-centre">Reference Number</th>
                      <th className="p-2 text-centre">Application Title</th>
                      <th className="p-2 text-centre">Application Status</th>
                      <th className="p-2 text-centre">Download Application</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b text-[1.1rem] text-center">
                      <td className="p-2">{studentDetails.reference_number || 'N/A'}</td>
                      <td className="p-2">Bursary Application</td>
                      <td className="p-2">{studentDetails.status || 'N/A'}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={downloadReport}
                          aria-label="Download Application"
                          className="bg-transparent border-0 p-0 m-0 cursor-pointer"
                        >
                          <FontAwesomeIcon
                            icon={faDownload}
                            className="text-[#14213d] text-xl"
                          />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Committee Signature Display Section */}
            <div className="mt-8 pt-8 border-t-2 border-gray-300">
              {studentDetails.committee_signature ? (
                <div>
                  <h3 className="text-lg font-bold text-[#14213d] mb-4">Committee Signature</h3>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={studentDetails.committee_signature}
                        alt="Committee Signature"
                        // Remove bg-white so transparent PNG displays correctly over page background
                        className="border-2 border-gray-400 rounded-lg w-48 h-32 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2">
                        <span className="font-semibold text-[#14213d]">Approved by:</span> {studentDetails.approved_by_committee || 'N/A'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold text-[#14213d]">Approval Date:</span> {studentDetails.allocation_date || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#14213d] font-semibold text-lg mb-2">
                    Digital Signature: <span className="text-[#e63946]">Pending</span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Awaiting committee approval and signature
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;