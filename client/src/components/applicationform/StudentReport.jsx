import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faFileAlt,
  faDownload,
  faCog,
  faTimes,
  faSignOutAlt,
  faBars,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Client-side background remover.
 * Returns a PNG dataURL with transparent background.
 */
async function removeBackgroundFromImage(src, { bgColor = [245,245,245], fuzz = 40, blurPx = 1 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, w, h);
      } catch (err) {
        reject(new Error('Canvas is tainted (CORS) or getImageData failed.'));
        return;
      }

      const data = imageData.data;
      const [bgR, bgG, bgB] = bgColor;
      const fuzziness = Math.max(1, Math.min(255, fuzz));

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        const maxDiff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
        if (maxDiff <= fuzziness) {
          const factor = maxDiff / fuzziness;
          data[i+3] = Math.round(a * factor);
        }
      }

      ctx.putImageData(imageData, 0, 0);

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
        resolve(canvas.toDataURL('image/png'));
      }
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load image: ' + (e?.message || 'unknown')));
    };

    img.src = src;
  });
}

/** Helper: convert hex color to rgb array for jsPDF setDrawColor */
function hexToRgb(hex) {
  const h = hex.replace('#','');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  return [ (bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255 ];
}

const StudentReport = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
  const [studentProfile, setStudentProfile] = useState({});
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const navigate = useNavigate();

  // Tweak these constants to match the sample image
  const signatureBlue = '#0b63b7'; // line/signature color (adjust as needed)
  const lineThicknessPx = 2;       // UI line thickness
  const lineGapPx = 20;            // gap between top and bottom line in UI

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    if (!token) {
      navigate('/signin');
      return;
    }
    setUserName(name);

    (async () => {
      try {
        const response = await axios.get('https://e-bursary-backend.onrender.com/api/reports', {
          headers: { Authorization: token },
        });
        const data = response.data || {};

        if (data.committee_signature) {
          try {
            // Try removing the background before saving to state
            const processed = await removeBackgroundFromImage(data.committee_signature, {
              bgColor: [245, 245, 245], // tune to your stored signature box color if known
              fuzz: 40,
              blurPx: 1
            });
            data.committee_signature = processed;
          } catch (err) {
            console.warn('Background removal failed (CORS or other). Using original signature.', err);
          }
        }

        setStudentDetails(data);
      } catch (err) {
        console.error('Error fetching report', err);
      }
    })();

    // student profile
    axios.get('https://e-bursary-backend.onrender.com/api/student', {
      headers: { Authorization: token }
    }).then(r => setStudentProfile(r.data)).catch(() => setStudentProfile({}));
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const userId = sessionStorage.getItem('userId');
    if (!token) { navigate('/signin'); return; }
    if (!userId) return;

    axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`, { headers: { Authorization: token }})
      .then(r => {
        const message = r.data.status_message;
        setHasNewMessage(Boolean(message && message.toLowerCase().includes('new')));
      }).catch(() => {});
    axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, { headers: { Authorization: token }})
      .then(r => setDocumentUploaded(r.data && r.data.uploaded === true))
      .catch(() => setDocumentUploaded(false));
  }, [navigate]);

  const handleApplyClick = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');
    if (!userId) { navigate('/personaldetails'); return; }
    try {
      const res = await axios.get(`https://e-bursary-backend.onrender.com/api/personal-details/user/${userId}`);
      if (res.data && res.data.user_id) navigate('/Amountdetails');
      else navigate('/personaldetails');
    } catch {
      navigate('/personaldetails');
    }
  };

  const downloadReport = React.useCallback(() => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('times', 'normal');

    // Header
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFontSize(22);
    doc.text('Bursary Report', pageW / 2, 50, { align: 'center' });
    doc.setFontSize(11);
    doc.text('Generated by Bursary Management System', pageW / 2, 68, { align: 'center' });
    doc.line(40, 80, pageW - 40, 80);

    // Personal info
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

    autoTable(doc, {
      startY: 100,
      head: [['Personal Information', 'Details']],
      body: personalInfo,
      theme: 'striped',
      headStyles: { fillColor: [41,128,185], textColor: [255,255,255], fontSize: 11 },
      styles: { font: 'times', fontSize: 10 }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Bursary Information', 'Details']],
      body: [
        ['Allocated Amount', studentDetails.bursary || 'N/A'],
        ['Application Status', studentDetails.status || 'N/A']
      ],
      theme: 'grid',
      headStyles: { fillColor: [39,174,96], textColor: [255,255,255], fontSize: 11 },
      styles: { font: 'times', fontSize: 10 }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Declaration', '']],
      body: [
        ['Declaration', 'I hereby confirm the above details are accurate and complete.'],
        ['Approved by', studentDetails.approved_by_committee || 'N/A'],
        ['Allocation date', studentDetails.allocation_date || 'N/A'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [192,57,43], textColor: [255,255,255], fontSize: 11 },
      styles: { font: 'times', fontSize: 10 }
    });

    // Draw signature band lines across page and overlay signature
    const sigY = doc.lastAutoTable.finalY + 36;
    const margin = 48;
    const leftX = margin;
    const rightX = pageW - margin;
    const [r,g,b] = hexToRgb(signatureBlue);
    doc.setDrawColor(r,g,b);
    doc.setLineWidth(1.4);

    // top and bottom lines of the band
    const topLineY = sigY + 26;
    const bottomLineY = topLineY + 20;
    doc.line(leftX, topLineY, rightX, topLineY);
    doc.line(leftX, bottomLineY, rightX, bottomLineY);

    // Add signature image centered and overlapping those lines
    if (studentDetails.committee_signature) {
      const sigWidth = 220;
      const sigHeight = 90;
      const sigX = (pageW - sigWidth) / 2;
      try {
        doc.addImage(studentDetails.committee_signature, 'PNG', sigX, sigY, sigWidth, sigHeight);
      } catch (err) {
        console.error('Error adding signature to PDF:', err);
      }
    } else {
      doc.setFontSize(10);
      doc.text('Committee Signature: ___________________________', leftX, sigY + 46);
    }

    // Approved by label below signature
    doc.setFontSize(10);
    doc.text(`Approved by: ${studentDetails.approved_by_committee || 'N/A'}`, pageW / 2, bottomLineY + 36, { align: 'center' });

    // Footer
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, doc.internal.pageSize.getHeight() - 36);
    doc.text('Bursary Management System', pageW / 2, doc.internal.pageSize.getHeight() - 36, { align: 'center' });

    doc.save('Bursary_Report.pdf');
  }, [studentDetails]);

  const reportRows = [
    { label: 'Reference Number', value: studentDetails.reference_number || 'N/A' },
    { label: 'Application Title', value: 'Bursary Application' },
    { label: 'Application Status', value: studentDetails.status || 'N/A' },
    { label: 'Download Application', value: (
      <button type="button" onClick={downloadReport} aria-label="Download Application" className="bg-transparent border-0 p-0 m-0 cursor-pointer">
        <FontAwesomeIcon icon={faDownload} className="text-[#14213d]" />
      </button>
    )},
  ];

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* top bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14213d]">EBursary</h1>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm md:text-lg font-bold text-[#14213d]">Welcome: {userName}</h2>
            <div className="block md:hidden">
              <FontAwesomeIcon icon={faBars} className="text-xl cursor-pointer text-[#14213d]" onClick={toggleSidebar} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-20 min-h-screen">
        {/* sidebar (unchanged) */}
        <div className={`fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14 transition-all duration-100 ease-in-out overflow-visible ${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'} ${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[36px] md:p-2'}`}>
          <div className="hidden md:flex justify-end mb-4">
            <FontAwesomeIcon icon={sidebarActive ? faTimes : faBars} className={`text-white cursor-pointer text-xl ${sidebarActive ? 'ml-auto' : 'mr-1'}`} onClick={toggleSidebar} />
          </div>
          <ul className="flex flex-col h-full mt-6 space-y-10">
            {[
              { icon: faHouse, label: 'Dashboard', to: '/studentdashboard' },
              { icon: faFileAlt, label: 'Apply', isButton: true, onClick: handleApplyClick, disabled: documentUploaded },
              { icon: faDownload, label: 'Report', to: '/studentreport' },
              { icon: faBell, label: 'Notification', to: '/messages' },
              { icon: faCog, label: 'Settings', to: '/studentsetting' },
              { icon: faSignOutAlt, label: 'Logout', isLogout: true }
            ].map((item, idx) => (
              <li className={`group relative ${item.isLogout ? 'mt-30 md:mt-55' : ''}`} key={idx}>
                {/* simplified rendering for brevity (same as earlier) */}
                {/* ... */}
                <Link to={item.to || '#'} className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}>
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                  <span className={`${sidebarActive ? 'inline-block ml-2 text-xl font-semibold' : 'hidden'}`}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* main content */}
        <div className={`flex-1 md:ml-25 transition-all duration-300 ${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[40px]'}`}>
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[360px] md:max-w-[1100px] mx-auto -mt-6 md:mt-2 mb-4 md:mb-6 p-0 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-[#14213d] text-center">Bursary Report</h1>

            {/* Desktop table */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse bg-white shadow-md rounded">
                <thead>
                  <tr className="bg-[#14213d] text-white">
                    <th className="p-2">Reference Number</th>
                    <th className="p-2">Application Title</th>
                    <th className="p-2">Application Status</th>
                    <th className="p-2">Download Application</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b text-[1.1rem] text-center">
                    <td className="p-2">{studentDetails.reference_number || 'N/A'}</td>
                    <td className="p-2">Bursary Application</td>
                    <td className="p-2">{studentDetails.status || 'N/A'}</td>
                    <td className="p-2">
                      <button type="button" onClick={downloadReport} aria-label="Download Application" className="bg-transparent border-0 p-0 m-0 cursor-pointer">
                        <FontAwesomeIcon icon={faDownload} className="text-[#14213d] text-xl" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signature band that matches Image 3 */}
            <div className="mt-8 pt-8 border-t-2 border-gray-300">
              <h3 className="text-lg font-bold text-[#14213d] mb-4">Committee Signature</h3>

              <div className="flex items-center flex-col">
                <div className="relative w-full max-w-[720px] flex items-center justify-center py-6" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  {/* top line */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `calc(50% - ${lineGapPx/2 + (lineThicknessPx/2)}px)`,
                    height: `${lineThicknessPx}px`,
                    backgroundColor: signatureBlue,
                    opacity: 1
                  }} />
                  {/* bottom line */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `calc(50% + ${lineGapPx/2 - (lineThicknessPx/2)}px)`,
                    height: `${lineThicknessPx}px`,
                    backgroundColor: signatureBlue,
                    opacity: 1
                  }} />

                  {/* signature image centered and overlapping the lines */}
                  {studentDetails.committee_signature ? (
                    <img
                      src={studentDetails.committee_signature}
                      alt="Committee Signature"
                      className="z-10 object-contain"
                      style={{ maxWidth: '72%', height: 'auto', filter: 'contrast(1.05) saturate(1.1)' }}
                    />
                  ) : (
                    <div className="text-gray-600">Signature pending</div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold text-[#14213d]">Approved by:</span> {studentDetails.approved_by_committee || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-[#14213d]">Approval Date:</span> {studentDetails.allocation_date || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;