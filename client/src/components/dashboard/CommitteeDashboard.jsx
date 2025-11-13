import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faHouse, faUser, faUsers, faCog, faBell, faChartBar, faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels
);

const CommitteeDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [bursaryAmount, setBursaryAmount] = useState(0);
  const [allocatedAmount, setAllocatedAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [approvedApplications, setApprovedApplications] = useState(0);
  const [rejectedApplications, setRejectedApplications] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [incompleteApplications, setIncompleteApplications] = useState(0);
  const [userName, setUserName] = useState('');
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    setUserName(name);
    if (!token) {
      navigate('/signin');
      return;
    }
    axios
      .get('https://e-bursary-backend.onrender.com/api/profile-committee', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (response) => {
        const profile = response.data;
        setCommitteeDetails(profile);
        if (profile.ward) {
          try {
            const res = await axios.get(
              `https://e-bursary-backend.onrender.com/api/bursary-count/${profile.ward}`
            );
            setBursaryAmount(res.data.amount);
            setAllocatedAmount(res.data.allocated);
            setRemainingAmount(res.data.remaining);
          } catch (error) {
            console.error('Error fetching bursary data:', error);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching committee profile:', error);
      });
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    axios
      .get('https://e-bursary-backend.onrender.com/api/committee-statistics', {
        headers: { Authorization: token },
      })
      .then((response) => {
        const { total, approved, rejected, pending, incomplete } = response.data;
        setTotalApplications(total);
        setApprovedApplications(approved);
        setRejectedApplications(rejected);
        setPendingApplications(pending || 0);
        setIncompleteApplications(incomplete || 0);
      })
      .catch((error) => {
        console.error('Error fetching committee statistics:', error);
      });
  }, []);

  useEffect(() => {
    const fetchPersonalInformation = async () => {
      try {
        const response = await axios.get(
          `https://e-bursary-backend.onrender.com/api/personalInformation/ward/${committeeDetails.ward}`
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching personal information:', error);
      }
    };
    if (committeeDetails.ward) {
      fetchPersonalInformation();
    }
  }, [committeeDetails.ward]);

  const handleApproveStudent = async (studentUserId) => {
    try {
      const committeeName = sessionStorage.getItem('userName');
      if (!committeeName) return;
      await axios.post('https://e-bursary-backend.onrender.com/api/approve-student', {
        studentUserId,
        committeeName,
      });
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  // --- Percent calculations for Pie chart: use percentages like AdminDashboard ---
  const approvedPercentage = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
  const rejectedPercentage = totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0;
  const pendingPercentage = totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0;
  const incompletePercentage = totalApplications > 0 ? (incompleteApplications / totalApplications) * 100 : 0;

  // Pie chart data using percentages per status
  const statusPieData = {
    labels: ['Approved', 'Rejected', 'Pending', 'Incomplete'],
    datasets: [
      {
        data: [approvedPercentage, rejectedPercentage, pendingPercentage, incompletePercentage],
        backgroundColor: [
          "#A5D6A7", "#EF9A9A", "#FFF59D", "#90CAF9"
        ],
        borderColor: [
          "#2E7D32", "#C62828", "#F9A825", "#1565C0"
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "#66BB6A", "#E57373", "#FFD54F", "#64B5F6"
        ],
        hoverBorderColor: [
          "#1B5E20", "#B71C1C", "#F57F17", "#0D47A1"
        ],
      },
    ],
  };

  const statusPieOptions = {
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#000',
        formatter: (value) => `${value.toFixed(2)}%`,
        font: { weight: 'bold', size: 15 },
      },
    },
  };

  // Bar chart for status: use raw numbers, not percentage
  const statusBarData = {
    labels: ['Approved', 'Rejected', 'Pending', 'Incomplete'],
    datasets: [
      {
        label: 'Applications',
        data: [approvedApplications, rejectedApplications, pendingApplications, incompleteApplications],
        backgroundColor: [
          "#A5D6A7", "#EF9A9A", "#FFF59D", "#90CAF9"
        ],
        borderColor: [
          "#2E7D32", "#C62828", "#F9A825", "#1565C0"
        ],
        borderWidth: 2,
        barThickness: 60,
      },
    ],
  };

  const statusBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#000',
        font: { weight: 'bold', size: 14 },
      },
    },
    scales: {
      x: {
        ticks: { color: '#14213d', font: { size: 12, weight: 'bold' }},
        grid: { display: false },
        barPercentage: 1.0,
        categoryPercentage: 0.6,
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#14213d',
          font: { size: 12, weight: 'bold' },
        },
        suggestedMax: Math.max(
          approvedApplications,
          rejectedApplications,
          pendingApplications,
          incompleteApplications
        ) * 1.2,
      },
    },
  };

  // Bursary Chart: show percentages in label, just like status
  const bursaryTotal = Number(bursaryAmount) || 1; // avoid division by zero
  const bursaryAllocatedPct = Number(allocatedAmount) / bursaryTotal * 100;
  const bursaryRemainingPct = Number(remainingAmount) / bursaryTotal * 100;

  const bursaryPieData = {
    labels: [
      `Allocated (${bursaryAllocatedPct.toFixed(2)}%)`,
      `Remaining (${bursaryRemainingPct.toFixed(2)}%)`
    ],
    datasets: [
      {
        label: 'Bursary Distribution',
        data: [bursaryAllocatedPct, bursaryRemainingPct],
        backgroundColor: ['#2E7D32', '#F9A825'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 2,
      },
    ],
  };

  const bursaryPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 15 },
        formatter: (value) => `${value.toFixed(2)}%`
      },
    },
  };

  const bursaryBarData = {
    labels: [
      `Allocated (${bursaryAllocatedPct.toFixed(2)}%)`,
      `Remaining (${bursaryRemainingPct.toFixed(2)}%)`
    ],
    datasets: [
      {
        label: 'Funds (KSh)',
        data: [allocatedAmount, remainingAmount],
        backgroundColor: ['#2E7D32', '#F9A825'],
        borderColor: ['#1B5E20', '#F57F17'],
        borderWidth: 2,
        barThickness: 60,
      },
    ],
  };

  const bursaryBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#000',
        anchor: 'end',
        align: 'top',
        font: { weight: 'bold', size: 14 },
        formatter: (value) =>
          `${Number(value).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) =>
          `${Number(value).toLocaleString('en-KE')}`},
      },
    },
  };

  const navItems = [
    { icon: faHouse, label: 'Dashboard', to: '/committeedashboard' },
    { icon: faUser, label: 'Profile', to: '/committeeprofile' },
    { icon: faUsers, label: 'Student Info', to: '/userdetails' },
    { icon: faBell, label: 'Analysis', to: '/committeereport' },
    { icon: faChartBar, label: 'Notification', to: '/committeenotify' },
    { icon: faCog, label: 'Settings', to: '/committeesetting' },
    { icon: faSignOutAlt, label: 'Logout', isLogout: true }
  ];

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 md:p-2">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-1 md:p-2.5 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
          <div className="flex items-center space-x-1">
            <h2 className="mr-1 md:mr-5 text-sm md:text-lg font-bold text-[#14213d]">
              Welcome: {committeeDetails.name || userName}
            </h2>
            <div className="flex items-center space-x-2">
              <img
                src={
                  committeeDetails.gender === 'Female'
                    ? '/images/woman.png'
                    : committeeDetails.gender === 'Male'
                    ? '/images/patient.png'
                    : '/images/user.png'
                }
                alt="User"
                className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-2 md:mr-20"
              />
              <FontAwesomeIcon icon={faBell} className="text-xl"/>
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
              icon={faBars}
              className={`text-white cursor-pointer text-xl ${sidebarActive ? 'ml-auto' : 'mr-1'}`}
              onClick={toggleSidebar}
            />
          </div>
          <ul className="flex flex-col h-full mt-6 space-y-10">
            {navItems.map((item, index) => (
              <li className={`group relative ${item.isLogout ? 'mt-30 md:mt-45' : ''}`} key={index}>
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
                        .catch(() => {})
                        .finally(() => {
                          sessionStorage.clear();
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
                        sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'
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
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span
                      className={`${
                        sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'
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

        {/* Main Content */}
        <div className={`flex-1 ml-0 md:ml-64 p-2 -mt-10 md:-mt-5 transition-all duration-100 pr-1 pl-1 md:pr-5 md:pl-5
${sidebarActive ? 'ml-[100px] md:ml-[190px]' : '-ml-[10px] md:ml-[30px]'}
        `}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bursary Fund Details */}
            <div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
              <h2 className="text-xl font-bold text-[#14213d] text-center mb-4">
                Bursary Fund Details
              </h2>
              <div className="flex flex-col gap-4 md:flex-row md:justify-around md:gap-6">
                <div className="flex-1 text-center  border-3 border-[#1565C0] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#1565C0] font-semibold mb-1">Total Funds Available</p>
                  <strong className="text-blue-700 text-lg">
                    {Number(bursaryAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh
                  </strong>
                </div>
                <div className="flex-1 text-center  border-3 border-[#2E7D32] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#2E7D32] font-semibold mb-1">{`Allocated (${bursaryAllocatedPct.toFixed(2)}%)`}</p>
                  <strong className="text-green-700 text-lg">
                    {Number(allocatedAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh
                  </strong>
                </div>
                <div className="flex-1 text-center  border-3 border-[#F9A825] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#F9A825] font-semibold mb-1">{`Remaining (${bursaryRemainingPct.toFixed(2)}%)`}</p>
                  <strong className="text-yellow-600 text-lg">
                    {Number(remainingAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Statistics */}
            <div className="w-full mb-0 md:mb-4 backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
              <h2 className="text-xl font-bold text-[#14213d] text-center mb-4">
                Quick Statistics
              </h2>
              <div className="flex flex-col gap-4 md:flex-row md:justify-around md:gap-3">
                <div className="flex-1 text-center border-3 border-[#F9A825] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#F9A825] font-semibold mb-1">Pending</p>
                  <strong className="text-[#F9A825] text-lg">{pendingApplications}</strong>
                </div>
                <div className="flex-1 text-center border-3 border-[#616161] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#424242] font-semibold mb-1">Incomplete</p>
                  <strong className="text-[#424242] text-lg">{incompleteApplications}</strong>
                </div>
                <div className="flex-1 text-center border-3 border-[#1565C0] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#1565C0] font-semibold mb-1">Total Student</p>
                  <strong className="text-[#1565C0] text-lg">{totalApplications}</strong>
                </div>
                <div className="flex-1 text-center border-3 border-[#2E7D32] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#2E7D32] font-semibold mb-1">Approved</p>
                  <strong className="text-[#2E7D32] text-lg">{approvedApplications}</strong>
                </div>
                <div className="flex-1 text-center border-3 border-[#C62828] rounded-xl p-3 shadow-md transition-transform hover:scale-105">
                  <p className="text-[#C62828] font-semibold mb-1">Rejected</p>
                  <strong className="text-[#C62828] text-lg">{rejectedApplications}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Table */}
          <div className="backdrop-blur-xl mb-5 bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] w-full mx-auto p-2 md:p-4">
            <h2 className="text-center text-xl font-bold text-[#14213d] mb-2 md:mb-4">Personal Information</h2>
            <div className="overflow-x-auto w-full">
              <table className="min-w-[600px] w-full border-collapse border border-gray-300">
                <thead className="bg-[#14213d] text-white">
                  <tr>
                    <th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Full Name</th>
                    <th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Email</th>
                    <th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Institution</th>
                    <th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Admission</th>
                    <th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Sub County</th>
                    <th className="border border-gray-300 px-1 py-1 md:px-4 md:py-2 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100 text-[#14213d]">
                      <td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.fullname}</td>
                      <td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.email}</td>
                      <td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.institution}</td>
                      <td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.admission}</td>
                      <td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 whitespace-nowrap">{item.subcounty}</td>
                      <td className="border border-gray-300 px-1 py-1 md:px-4 md:py-1 text-center whitespace-nowrap">
                        {(item.approved_by_committee && item.approved_by_committee !== userName) ? (
                          <span className="text-gray-500 text-[0.85rem] italic">
                            Reviewed by {item.approved_by_committee}
                          </span>
                        ) : (
                          <Link
                            to={`/PersonalInformation/${item.user_id}`}
                            onClick={() => handleApproveStudent(item.user_id)}
                            className="text-blue-500 no-underline hover:text-blue-700 font-bold"
                          >
                            User Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Table responsive hint for mobile */}
              <div className="md:hidden text-center text-gray-500 mt-2">Swipe left/right to see all columns</div>
            </div>
          </div>

          {/* Charts Section: Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3 mb-4 md:mt-0">
            <div className="w-full max-h-[500px] backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
              <h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">Application Status (Pie)</h2>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-0 md:gap-6">
                <div className="w-full lg:w-2/3 flex justify-center">
                  <div className="w-[300px] h-[300px]"><Pie data={statusPieData} options={statusPieOptions} /></div>
                </div>
                <div className="flex flex-col items-start lg:items-start gap-0 md:gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-green-100 border-3 border-green-500 shadow-md"></div>
                    <p className="text-green-700 font-bold">
                      Approved: <span>{approvedApplications} ({approvedPercentage.toFixed(2)}%)</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-red-100 border-3 border-red-500 shadow-md"></div>
                    <p className="text-red-700 font-bold">
                      Rejected: <span>{rejectedApplications} ({rejectedPercentage.toFixed(2)}%)</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-yellow-100 border-3 border-yellow-500 shadow-md"></div>
                    <p className="text-yellow-700 font-bold">
                      Pending: <span>{pendingApplications} ({pendingPercentage.toFixed(2)}%)</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-blue-100 border-3 border-blue-500 shadow-md"></div>
                    <p className="text-blue-700 font-bold">
                      Incomplete: <span>{incompleteApplications} ({incompletePercentage.toFixed(2)}%)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full max-h-[500px] backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
              <h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">Application Status (Bar)</h2>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-0 md:gap-6">
                <div className="w-full lg:w-2/3 flex justify-center">
                  <div className="w-[330px] h-[300px] md:w-[380px] md:h-[300px]"><Bar data={statusBarData} options={statusBarOptions} /></div>
                </div>
                <div className="flex flex-col items-start lg:items-start w-full lg:w-auto mt-4 gap-0 md:gap-4 lg:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-green-100 border-3 border-green-500 shadow-md"></div>
                    <p className="text-green-700 font-bold">
                      Approved: <span>{approvedApplications}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-red-100 border-3 border-red-500 shadow-md"></div>
                    <p className="text-red-700 font-bold">
                      Rejected: <span>{rejectedApplications}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-yellow-100 border-3 border-yellow-500 shadow-md"></div>
                    <p className="text-yellow-700 font-bold">
                      Pending: <span>{pendingApplications}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-blue-100 border-3 border-blue-500 shadow-md"></div>
                    <p className="text-blue-700 font-bold">
                      Incomplete: <span>{incompleteApplications}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Bursary Fund Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3 md:mt-0">
            <div className="w-full max-h-[500px] backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
              <h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">Bursary Fund Overview (Pie)</h2>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-0 md:gap-6">
                <div className="w-full lg:w-2/3 flex justify-center">
                  <div className="w-[300px] h-[300px]">
                    <Pie data={bursaryPieData} options={bursaryPieOptions} />
                  </div>
                </div>
                <div className="flex flex-col items-start lg:items-start gap-0 md:gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-blue-100 border-3 border-blue-500 shadow-md"></div>
                    <p className="text-blue-700 font-bold">
                      Total Funds: <strong className="text-blue-700 ">
                        {Number(bursaryAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-green-100 border-3 border-green-500 shadow-md"></div>
                    <p className="text-green-700 font-bold">
                      Allocated: <strong className="text-green-700 ">
                        {Number(allocatedAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh ({bursaryAllocatedPct.toFixed(2)}%)
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-yellow-100 border-3 border-yellow-500 shadow-md"></div>
                    <p className="text-yellow-700 font-bold">
                      Remaining: <strong className="text-yellow-700">
                        {Number(remainingAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh ({bursaryRemainingPct.toFixed(2)}%)
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full max-h-[500px] backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] p-3 md:p-3">
              <h2 className="text-xl md:text-2xl font-bold text-center text-[#14213d] mb-4">Bursary Fund Overview (Bar)</h2>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-0 md:gap-6">
                <div className="w-full lg:w-2/3 flex justify-center">
                  <div className="w-[330px] h-[300px] md:w-[380px] md:h-[300px]">
                    <Bar data={bursaryBarData} options={bursaryBarOptions} />
                  </div>
                </div>
                <div className="flex flex-col items-start lg:items-start w-full lg:w-auto mt-4 gap-0 md:gap-4 lg:mt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-blue-100 border-3 border-blue-500 shadow-md"></div>
                    <p className="text-blue-700 font-bold">
                      Total Funds: <strong className="text-blue-700">
                        {Number(bursaryAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-green-100 border-3 border-green-500 shadow-md"></div>
                    <p className="text-green-700 font-bold">
                      Allocated: <strong className="text-green-700 ">
                        {Number(allocatedAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh ({bursaryAllocatedPct.toFixed(2)}%)
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-yellow-100 border-3 border-yellow-500 shadow-md"></div>
                    <p className="text-yellow-700 font-bold">
                      Remaining: <strong className="text-yellow-700 ">
                        {Number(remainingAmount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })} KSh ({bursaryRemainingPct.toFixed(2)}%)
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;