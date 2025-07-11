import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faUser,
  faFileAlt,
  faChartBar,
  faCog,
  faSignOutAlt,
  faBell,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

const BursaryAllocation = () => {
  const { id } = useParams(); // Get the user ID from the URL
  const [data, setData] = useState([]);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [selectedAmount, setSelectedAmount] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [sidebarActive, setSidebarActive] = useState(false);

   const [bursaryAmount, setBursaryAmount] = useState(0);
  const [allocatedAmount, setAllocatedAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const loadData = useCallback(async () => {
    try {
      const url = id
        ? `https://e-bursary-backend.onrender.com/api/get-bursary/${id}`
        : `https://e-bursary-backend.onrender.com/api/get-bursary`;
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [id]);

  const loadBursaryFund = async () => {
    try {
      const response = await axios.get('https://e-bursary-backend.onrender.com/api/committee-count');
      setBursaryAmount(response.data.amount);
      setAllocatedAmount(response.data.allocated);
      setRemainingAmount(response.data.amount - response.data.allocated);
    } catch (error) {
      console.error('Error fetching bursary data:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadBursaryFund();
  }, [loadData]);

  const [submitted, setSubmitted] = useState({});

  const handleAllocate = async (userId) => {
    const amount = selectedAmount[userId];

    if (!amount) {
      alert("Please select an amount before allocating.");
      return;
    }

    if (remainingAmount <= 0) {
      alert("No funds available for allocation.");
      return;
    }

    if (amount > remainingAmount) {
      alert(`Insufficient funds. You can only allocate up to Ksh ${remainingAmount}.`);
      return;
    }

    setLoading(true);
    try {
      await axios.put(`https://e-bursary-backend.onrender.com/api/update-bursary/${userId}`, { bursary: amount });
      alert(`Allocated Ksh ${amount} to the application and updated allocation date.`);
      setSubmitted((prev) => ({ ...prev, [userId]: true }));
      loadData();
      loadBursaryFund();
    } catch (error) {
      console.error('Error updating bursary:', error);
      alert('Failed to update bursary. Please try again later.');
    }
    setLoading(false);
  };

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


  return (
    <div className="w-full min-h-screen relative bg-white-100">
      {/* Top Bar */}
      <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#1F2937]">EBursary</h1>
          <div className="flex items-center space-x-6">
            <h2 className="mr-2 md:mr-5 text-[1.1rem] md:text-[1.20rem] font-semibold">
              Welcome: {committeeDetails.fullname}
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
            {/* Student Info */}
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

        {/* Main Content */}
 
              <div className={`flex-1 ml-0 md:ml-64 p-4 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10 ${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}`}>

          <div className="max-w-4xl mx-auto shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] bg-white rounded-lg p-6">
            <h2 className="text-center text-1xl md:text-2xl font-bold mb-4">Bursary Fund Details</h2>
            <div className="flex justify-around mb-6">
              <div className="text-center text-[0.8rem] md:text-[1rem] font-semibold">
                <p>Total Funds Available:</p>
                <strong>{bursaryAmount.toLocaleString()} Ksh</strong>
              </div>
              <div className="text-center text-[0.8rem] md:text-[1rem] font-semibold">
                <p>Amount Allocated to Students:</p>
                <strong>{allocatedAmount.toLocaleString()} Ksh</strong>
              </div>
              <div className="text-center text-[0.8rem] md:text-[1rem] font-semibold">
                <p>Remaining Funds:</p>
                <strong>{remainingAmount.toLocaleString()} Ksh</strong>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-6 mt-6 text-center">Bursary Allocation</h1>
            {data.map((item) => (
              <div key={item.user_id} className="mb-3">
                <p className="font-semibold text-gray-800 text-[1.1rem] md:text-[1.2rem]">
                  <span className="text-gray-500">Full Name:</span> {item.fullname}
                </p>
                <p className="font-semibold text-gray-800 text-[1.1rem] md:text-[1.2rem]">
                  <span className="text-gray-500">Admission Number:</span> {item.admission}
                </p>
                <p className="font-semibold text-gray-800 text-[1.1rem] md:text-[1.2rem] mb-8">
                  <span className="text-gray-500">Institution:</span> {item.institution}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 mb-2">
                  {[10000, 20000, 30000, 40000, 50000].map((amount) => (
                    <label key={amount} className="flex items-center gap-2 cursor-pointer text-[1.6rem]">
                      <input
                        type="radio"
                        name={`amount-${item.user_id}`}
                        value={amount}
                        checked={selectedAmount[item.user_id] === amount}
                        onChange={() => setSelectedAmount((prev) => ({ ...prev, [item.user_id]: amount }))}
                        className="accent-blue-600 scale-125"
                      />
                      <span className="text-[1.1rem]">{amount.toLocaleString()} Ksh</span>
                    </label>
                  ))}
                </div>
                <div className='flex justify-center'>
                  <button
                    onClick={() => {
                      if (!submitted[item.user_id] && !loading) handleAllocate(item.user_id);
                    }}
                    className={`mt-4 w-full px-4 py-2 rounded font-bold text-white transition-colors duration-200
                      ${(submitted[item.user_id] || remainingAmount <= 0)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
                    `}
                    disabled={submitted[item.user_id] || remainingAmount <= 0}
                  >
                    {remainingAmount <= 0 ? 'No Funds' : submitted[item.user_id] ? 'Allocated' : 'Allocate'}
                  </button>
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>

  );
};

export default BursaryAllocation;