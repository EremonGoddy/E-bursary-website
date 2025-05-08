import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faUserGear,
  faBank,
  faFileAlt,
  faChartBar,
  faFileLines,
  faGear,
  faSignOutAlt,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const AdminDashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(true);
  const [adminDetails, setAdminDetails] = useState({});
  const [bursaryAmount, setBursaryAmount] = useState(0);
  const [allocatedAmount, setAllocatedAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [approvedApplications, setApprovedApplications] = useState(0);
  const [rejectedApplications, setRejectedApplications] = useState(0);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

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
        console.error('Error fetching bursary amount:', error);
      });

    axios
      .get('http://localhost:5000/api/admin-details')
      .then((response) => {
        setAdminDetails({
          name: response.data.name,
          email: response.data.email,
        });
      })
      .catch((error) => console.error('Error fetching admin details:', error));

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

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await axios.get('http://localhost:5000/api/activity-logs');
      setActivityLogs(response.data);
    };
    fetchLogs();
  }, []);

  const handleDeleteUser = async (userId) => {
    await axios.delete(`http://localhost:5000/api/users/${userId}`);
    const usersResponse = await axios.get('http://localhost:5000/api/users');
    setUsers(usersResponse.data);
    const logsResponse = await axios.get('http://localhost:5000/api/activity-logs');
    setActivityLogs(logsResponse.data);
  };

  const approvedPercentage = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
  const rejectedPercentage = totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0;

  const chartData = {
    labels: ['Approved', 'Rejected'],
    datasets: [
      {
        data: [approvedPercentage, rejectedPercentage],
        backgroundColor: ['#4CAF50', '#FF5252'],
        hoverBackgroundColor: ['#388E3C', '#D32F2F'],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      datalabels: {
        color: '#fff',
        formatter: (value) => `${value.toFixed(2)}%`,
        font: {
          weight: 'bold',
          size: 15,
        },
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 shadow-md z-20">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">EBursary</h2>
          <h1 className="text-lg font-semibold">Welcome, {adminDetails.name}</h1>
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faBell} className="text-2xl text-gray-600" />
            <img
              src="/images/patient.png"
              alt="Admin"
              className="rounded-full w-10 h-10"
            />
          </div>
        </div>
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex flex-row pt-20">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900 text-white p-4 h-full">
          <ul className="space-y-6 flex flex-col items-center md:items-start">
            <li>
              <Link to="/admindashboard" className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faHouse} className="text-lg" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/usermanagement" className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faUserGear} className="text-lg" />
                <span>User Management</span>
              </Link>
            </li>
            <li>
              <Link to="/bursarymanagement" className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faBank} className="text-lg" />
                <span>Bursary Management</span>
              </Link>
            </li>
            <li>
              <Link to="/monitoring" className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faFileAlt} className="text-lg" />
                <span>Application Monitoring</span>
              </Link>
            </li>
            <li>
              <Link to="/adminreport" className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faChartBar} className="text-lg" />
                <span>Analysis</span>
              </Link>
            </li>
            <li>
              <Link to="/auditlogs" className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faFileLines} className="text-lg" />
                <span>Audit Logs</span>
              </Link>
            </li>
            <li>
              <Link to="/adminsetting" className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faGear} className="text-lg" />
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <Link to="/" className="flex items-center space-x-2 text-red-500">
                <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
                <span>Logout</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bursary Fund Details */}
            <div className="bg-white p-6 shadow rounded-md">
              <h2 className="text-xl font-bold text-center">Bursary Fund Details</h2>
              <div className="flex justify-around items-center mt-4">
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

            {/* Quick Statistics */}
            <div className="bg-white p-6 shadow rounded-md">
              <h2 className="text-xl font-bold text-center">Quick Statistics</h2>
              <div className="flex justify-between items-center mt-4">
                <div className="text-center bg-green-500 text-white p-3 rounded shadow">
                  <p>Total Applications:</p>
                  <strong>{totalApplications}</strong>
                </div>
                <div className="text-center bg-blue-500 text-white p-3 rounded shadow">
                  <p>Approved Applications:</p>
                  <strong>{approvedApplications}</strong>
                </div>
                <div className="text-center bg-red-500 text-white p-3 rounded shadow">
                  <p>Rejected Applications:</p>
                  <strong>{rejectedApplications}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Existing Users */}
            <div className="bg-white p-6 shadow rounded-md">
              <h2 className="text-xl font-bold">Existing Users</h2>
              <table className="table-auto w-full mt-4">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Full Name</th>
                    <th className="border px-4 py-2">Email</th>
                    <th className="border px-4 py-2">Role</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="border px-4 py-2">{user.id}</td>
                      <td className="border px-4 py-2">{user.name}</td>
                      <td className="border px-4 py-2">{user.email}</td>
                      <td className="border px-4 py-2">{user.role}</td>
                      <td className="border px-4 py-2">
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Activity Logs */}
            <div className="bg-white p-6 shadow rounded-md">
              <h2 className="text-xl font-bold">Activity Logs</h2>
              <ul className="mt-4 space-y-2">
                {activityLogs.map((log, index) => (
                  <li key={index} className="border-b pb-2">
                    {log.log_message} at {log.log_time}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Approval Status Chart */}
          <div className="bg-white p-6 shadow rounded-md mt-4">
            <h2 className="text-xl font-bold text-center">Approval Status</h2>
            <div className="mt-4">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;