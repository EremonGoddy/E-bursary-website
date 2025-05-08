import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CommitteeDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(true);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [bursaryAmount, setBursaryAmount] = useState(0);
  const [allocatedAmount, setAllocatedAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [approvedApplications, setApprovedApplications] = useState(0);
  const [rejectedApplications, setRejectedApplications] = useState(0);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/committee-count')
      .then((response) => {
        setBursaryAmount(response.data.amount);
        setAllocatedAmount(response.data.allocated);
        setRemainingAmount(response.data.amount - response.data.allocated);
      })
      .catch((error) => {
        console.error('Error fetching bursary data:', error);
      });

    axios
      .get('http://localhost:5000/api/quick-statistics')
      .then((response) => {
        const { total, approved, rejected } = response.data;
        setTotalApplications(total);
        setApprovedApplications(approved);
        setRejectedApplications(rejected);
      })
      .catch((error) => {
        console.error('Error fetching application statistics:', error);
      });
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/personalInformation');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching personal information:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
    } else {
      axios
        .get('http://localhost:5000/api/profile-committee', {
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 shadow-md z-20">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">EBursary</h2>
          <h1 className="text-lg font-semibold">Welcome, {committeeDetails.fullname}</h1>
          <div className="flex items-center space-x-4">
            <img
              src="/images/patient.png"
              alt="User"
              className="rounded-full w-10 h-10"
            />
            <i className="bi bi-bell-fill text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex flex-row pt-20">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900 text-white p-4 h-full">
          <ul className="space-y-6 flex flex-col items-center md:items-start">
            <li>
              <Link to="/committeedashboard" className="flex items-center space-x-2">
                <i className="bi bi-house-door-fill"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center space-x-2">
                <i className="bi bi-person-square"></i>
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/userdetails" className="flex items-center space-x-2">
                <i className="bi bi-file-earmark-text-fill"></i>
                <span>Student Information</span>
              </Link>
            </li>
            <li>
              <Link to="/comreport" className="flex items-center space-x-2">
                <i className="bi bi-bar-chart-fill"></i>
                <span>Analysis</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center space-x-2">
                <i className="bi bi-gear-fill"></i>
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <Link to="/" className="flex items-center space-x-2 text-red-500">
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {/* Bursary Fund Details & Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 shadow rounded-md">
              <h2 className="text-center text-xl font-bold mb-4">Bursary Fund Details</h2>
              <div className="flex justify-around">
                <div className="text-center">
                  <p>Total Funds Available:</p>
                  <strong>{bursaryAmount}</strong>
                </div>
                <div className="text-center">
                  <p>Amount Allocated to Students:</p>
                  <strong>{allocatedAmount}</strong>
                </div>
                <div className="text-center">
                  <p>Remaining Funds:</p>
                  <strong>{remainingAmount}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 shadow rounded-md">
              <h2 className="text-center text-xl font-bold mb-4">Quick Statistics</h2>
              <div className="flex justify-between items-center">
                <div className="text-center bg-green-500 text-white p-4 rounded shadow">
                  <p>Total Applications:</p>
                  <strong>{totalApplications}</strong>
                </div>
                <div className="text-center bg-blue-500 text-white p-4 rounded shadow">
                  <p>Approved Applications:</p>
                  <strong>{approvedApplications}</strong>
                </div>
                <div className="text-center bg-red-500 text-white p-4 rounded shadow">
                  <p>Rejected Applications:</p>
                  <strong>{rejectedApplications}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Table */}
          <div className="mt-6 bg-white p-6 shadow rounded-md">
            <h2 className="text-center text-2xl font-bold mb-4">Personal Information</h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Full Name</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">Institution</th>
                    <th className="border border-gray-300 px-4 py-2">Admission</th>
                    <th className="border border-gray-300 px-4 py-2">Sub County</th>
                    <th className="border border-gray-300 px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{item.fullname}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.institution}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.admission}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.subcounty}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <Link to={`/PersonalInformation/${item.user_id}`}>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded">User Details</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;