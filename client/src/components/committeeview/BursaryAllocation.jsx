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
  const [userName, setUserName] = useState('');
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
      const name = sessionStorage.getItem('userName');
  
    if (!token) {
      navigate('/signin');
    } else {
       setUserName(name || '');
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

  const navItems = [
  { icon: faHouse, label: 'Dashboard', to: '/committeedashboard' },
  { icon: faUser, label: 'Profile', to: '/committeeprofile' },
  { icon: faUsers, label: 'Student Info', to: '/userdetails' },
  { icon: faBell, label: 'Analysis', to: '/committeereport' },
  { icon: faChartBar, label: 'Notification', to: '/committeereport' },
  { icon: faCog, label: 'Settings', to: '/committeesetting' },
  { icon: faSignOutAlt, label: 'Logout', isLogout: true }
  ];

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
<div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-2.5 z-50 md:pl-20 md:pr-20">
<div className="flex justify-between items-center">
<h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
<div className="flex items-center space-x-1">
<h2 className="mr-1 md:mr-5 text-[1rem] md:text-[1.2rem] font-bold text-[#14213d]">
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
className="rounded-full w-7 h-7 md:w-9 md:h-9 mr-1 md:mr-0"
/>
</div>
<div className="block md:hidden">
<FontAwesomeIcon
icon={faBars}
className="text-[1.7rem] cursor-pointer text-[#14213d]"
onClick={toggleSidebar}
/>
</div>
</div>
</div>
</div>

      <div className="flex flex-col md:flex-row pt-20 min-h-screen">
        {/* Sidebar */}
<div
className={`
fixed top-0 left-0 z-40 bg-[#14213d] text-white h-full mt-10 md:mt-14
transition-all duration-100 ease-in-out
overflow-visible
${sidebarActive ? 'w-[180px] p-4' : 'w-0 p-0'}
${sidebarActive ? 'md:w-[210px] md:p-4' : 'md:w-[45px] md:p-2'}
`}
>
<div className="hidden md:flex justify-end mb-4">
<FontAwesomeIcon
icon={faBars}
className={`text-white cursor-pointer text-[1.5rem] ${sidebarActive ? 'ml-auto' : 'mr-2'}`}
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
<FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
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
<FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
<span
className={`${
sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
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
 
              <div className={`flex-1 ml-0 md:ml-64 p-4 transition-all duration-100 pr-3 pl-3 md:pr-10 md:pl-10 ${sidebarActive ? 'ml-[100px] md:ml-[190px]' : 'ml-[35px] md:ml-[30px]'}`}>

          <div className="max-w-4xl backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] mx-auto p-6">
            <h2 className="text-center text-[#14213d] text-1xl md:text-2xl font-bold mb-4">Bursary Fund Details</h2>
           
           <div className="flex justify-around mb-6">
  <div className="text-center text-[#14213d] text-[0.8rem] md:text-[1rem] font-bold">
    <p>Total Funds Available:</p>
    <strong>
      {bursaryAmount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ksh
    </strong>
  </div>
  <div className="text-center text-[#14213d]  text-[0.8rem] md:text-[1rem] font-bold">
    <p>Amount Allocated to Students:</p>
    <strong>
      {allocatedAmount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ksh
    </strong>
  </div>
  <div className="text-center text-[0.8rem] text-[#14213d]  md:text-[1rem] font-bold">
    <p>Remaining Funds:</p>
    <strong>
      {remainingAmount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ksh
    </strong>
  </div>
</div>


            <h1 className="text-2xl font-bold mb-6 mt-6 text-[#14213d]  text-center">Bursary Allocation</h1>
            {data.map((item) => (
              <div key={item.user_id} className="mb-3">
                <p className=" text-gray-800 text-[1.1rem] md:text-[1.2rem]">
                  <span className="text-[#14213d] font-bold">Full Name:</span> {item.fullname}
                </p>
                <p className=" text-gray-800 text-[1.1rem] md:text-[1.2rem]">
                  <span className="text-[#14213d] font-bold">Admission Number:</span> {item.admission}
                </p>
                <p className=" text-gray-800 text-[1.1rem] md:text-[1.2rem] mb-8">
                  <span className="text-[#14213d] font-bold">Institution:</span> {item.institution}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 mb-2 text-[#14213d] font-bold">
                  {[10000, 20000, 30000, 40000, 50000].map((amount) => (
                    <label key={amount} className="flex items-center gap-2 cursor-pointer text-[1.6rem]">
                      <input
                        type="radio"
                        name={`amount-${item.user_id}`}
                        value={amount}
                        checked={selectedAmount[item.user_id] === amount}
                        onChange={() => setSelectedAmount((prev) => ({ ...prev, [item.user_id]: amount }))}
                        className="accent-[#14213d] scale-125 cursor-pointer"
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