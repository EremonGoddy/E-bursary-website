import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faFileAlt, faDownload, faTimes, faCog,
  faSignOutAlt, faBars, faBell,
} from '@fortawesome/free-solid-svg-icons';

const PersonalDetails = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
   const [documentUploaded, setDocumentUploaded] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    subcounty: '',
    ward: '',
    village: '',
    birth: '',
    gender: '',
    institution: '',
    year: '',
    admission: ''
  });

   const subCounties = {
    "Turkana Central": ["Kanamkemer", "Kerio Delta", "Kalokol", "Township"],
    "Turkana East": ["Lokori/Kochodin", "Katilia", "Kapedo/Napeitom"],
    "Turkana South": ["Kaputir", "Katilu", "Lobokat", "Lokichar"],
    "Loima": ["Lokiriama/Lorengippi", "Lomelo", "Loima", "Turkwel"],
    "Turkana North": ["Kaeris", "Kaaleng/Kaikor", "Lapur", "Lake Zone"],
    "Kibish": ["Kibish", "Nakalale", "Lapur"],
    "Turkana West": ["Letea", "Kalobeyei", "Kakuma", "Lopur", "Songot"],
  };

   // Villages linked to wards
  const villages = {
    Kaeris: ["Kaeris Village", "Kangakipur", "Mlima-Tatu", "Kanukurudio"],
    "Kaaleng/Kaikor": ["Kaikor", "Kaaleng", "Lokamarinyang"],
    Lapur: ["Lowareng'ak", "Todonyang", "Nachukui"],
    "Lake Zone": ["Namadak", "Lorengippi", "Kalokol East"],
    // Example villages for others
    Kanamkemer: ["Nawoitorong", "Canaan"],
    "Kerio Delta": ["Kerio East", "Kerio West"],
    Kalokol: ["Kalokol North", "Kalokol South"],
    Township: ["Nakwamekwi", "Town"],
    // Add the rest as needed...
  };

  const [errorMsg, setErrorMsg] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Toggle sidebar
  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  // Fetch all student names and emails on mount for duplicate check
  useEffect(() => {
    axios
      .get('https://e-bursary-backend.onrender.com/api/students/all-names')
      .then((res) => {
        setAllStudents(
          (res.data || []).map(stu => ({
            fullname: stu.fullname?.trim().toLowerCase(),
            email: stu.email?.trim().toLowerCase()
          }))
        );
      })
      .catch(() => setAllStudents([]));
  }, []);

  // Fetch student info and document upload status
  useEffect(() => {
   const token = sessionStorage.getItem('authToken');
  const name = sessionStorage.getItem('userName');
  const userId = sessionStorage.getItem('userId');

  if (!token) {
    navigate('/signin');
    return;
  }

  setUserName(name);
  setLoading(true);

  // ✅ Fetch student details only if token is present
  axios.get('https://e-bursary-backend.onrender.com/api/student', {
    headers: {
      Authorization: token,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
  .then((response) => {
    setStudentDetails(response.data);
    setFormData(response.data);
    setLoading(false);
  })
  .catch((error) => {
    setLoading(false);
    if (error.response && error.response.status === 401) {
      navigate('/signin');
    }
  });

  // ✅ Only call document status API if both token and userId exist
  if (userId) {
    axios
      .get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`, {
        headers: { Authorization: token }  // Optional but recommended for security
      })
      .then((res) => {
        const isUploaded = res.data && res.data.uploaded === true;
        setDocumentUploaded(isUploaded);
        
      })
      .catch(() => setDocumentUploaded(false));
  }

  }, [navigate]);


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
}, []);

  // On mount, check if personal details already exist for this user_id
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');
    const userId = sessionStorage.getItem('userId');
    if (!token) {
      navigate('/signin');
      return;
    }
    setUserName(name);

    // Use the backend endpoint that returns 404 if not found
    if (userId) {
      axios.get(`https://e-bursary-backend.onrender.com/api/personal-details/user/${userId}`)
        .then(res => {
          // If the API returns a row with user_id, skip this page
          if (res.data && res.data.user_id) {
            navigate('/Amountdetails');
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          // If the backend returns 404, stay on this page
          if (error.response && error.response.status === 404) {
            setLoading(false);
          } else {
            // For any other error, also stay but you can log or notify
            setLoading(false);
            // Optionally: setErrorMsg("Error confirming personal details.");
          }
        });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value,
    ...(name=== "subcounty" ? {ward: "", village: "" } : {}),
      ...(name === "ward" ? { village: "" } : {}),
     });
    setErrorMsg("");
  };

    // Ensures the proper step navigation on sidebar 'Apply' click
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
        // Details exist, go to Amountdetails
        navigate('/Amountdetails');
      } else {
        // No details, force personal details page
        navigate('/personaldetails');
      }
    } catch {
      navigate('/personaldetails');
    }
  };

  

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const enteredName = (formData.fullname || "").trim().toLowerCase();
    const enteredEmail = (formData.email || "").trim().toLowerCase();
    const duplicate = allStudents.find(
      stu => stu.fullname === enteredName || stu.email === enteredEmail
    );
    if (duplicate) {
      setErrorMsg("This email or full name is already registered.");
      return;
    }

    axios.post('https://e-bursary-backend.onrender.com/api/personal-details', formData)
      .then(response => {
        alert('Data inserted successfully');
        const userId = response.data.userId;
        sessionStorage.setItem('userId', userId);
        navigate('/Amountdetails');
      })
      .catch(error => {
        if (
          error.response &&
          (error.response.status === 409 ||
            (error.response.data &&
              /already registered|duplicate/i.test(error.response.data.message || "")))
        ) {
          setErrorMsg("This email or full name is already registered.");
        } else {
          setErrorMsg("There was an error inserting the data!");
        }
        console.error('There was an error inserting the data!', error);
      });
  };

  if (loading) return null;

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Top Bar */}
     <div className="bg-white fixed top-0 left-0 w-full shadow-lg p-2 md:p-3 z-50 md:pl-20 md:pr-20">
        <div className="flex justify-between items-center">
        

          <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#14213d]">EBursary</h1>
          <div className="flex items-center space-x-1">
            <h2 className="mr-1 md:mr-5 text-[1rem] md:text-[1.2rem] font-bold text-[#14213d]">
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
{/* Sidebar toggle only visible on small screens */}
{/* Toggle Button for opening sidebar on mobile */}
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

      <div className="flex pt-20 min-h-screen">
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
  

  {/* Toggle Button for Desktop View */}
<div className="hidden md:flex justify-end mb-4">
  <FontAwesomeIcon
    icon={sidebarActive ? faTimes : faBars}
    className={`text-white cursor-pointer text-[1.5rem] ${
      sidebarActive ? 'ml-auto' : 'mr-2'
    }`}
    onClick={toggleSidebar}
  />
</div>



  {/* Navigation */}
<ul className="flex flex-col h-full mt-6 space-y-10">
  {[
    {
      icon: faHouse,
      label: 'Dashboard',
      to: '/studentdashboard'
    },
    {
      icon: faFileAlt,
      label: 'Apply',
      isButton: true,
      onClick: handleApplyClick,
      disabled: documentUploaded
    },
    {
      icon: faDownload,
      label: 'Report',
      to: '/studentreport'
    },
    {
      icon: faBell,
      label: 'Notification',
      to: '/messages'
    },
    {
      icon: faCog,
      label: 'Settings',
      to: '/studentsetting'
    },
    {
      icon: faSignOutAlt,
      label: 'Logout',
      isLogout: true
    }
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
          <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
          <span
            className={`${
              sidebarActive ? 'inline-block ml-2 text-[1rem] md:text-[1.1rem] font-semibold' : 'hidden'
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
          } ${item.disabled ? 'pointer-events-none opacity-60 cursor-not-allowed' : ''}`}
          aria-disabled={item.disabled ? 'true' : 'false'}
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
          <div className="relative">
            <FontAwesomeIcon icon={item.icon} className="text-[1.2rem] md:text-[1.4rem]" />
            {item.label === 'Notification' && hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
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
        {/* Main Content Area */}
        <div className={`flex-1 md:ml-25 transition-all duration-300
          ${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[50px]'}
          `}>
          <ProgressStepper currentStep={0}  className="" />
          <div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[350px] md:max-w-[600px]  mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center text-[#14213d]">Bursary Application Form</h1>
            <h2 className="text-lg font-semibold mb-6 text-center text-[#14213d]">Student Details</h2>
            {errorMsg && (
              <div className="mb-4 text-center text-red-600 font-semibold">{errorMsg}</div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2  gap-3 md:gap-4">
              <div>
                <label htmlFor="fullname" className="block text-[#14213d] font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter Full Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block  text-[#14213d] font-medium mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter Email"
                  required
                />
              </div>
            <div>
 {/* Sub County Dropdown */}
      <label htmlFor="subcounty" className="block text-[#14213d] font-medium mb-1">
        Sub County
      </label>
      <select
        id="subcounty"
        name="subcounty"
        value={formData.subcounty}
        onChange={handleChange}
        className="form-select w-full border border-gray-300 text-[#14213d] rounded px-3 py-2 focus:border-blue-500"
        required
      >
        <option value="">Select Sub County</option>
        {Object.keys(subCounties).map((sub) => (
          <option key={sub} value={sub}>
            {sub}
          </option>
        ))}
      </select>
</div>

              <div>
                {/* Ward Dropdown */}
      <label htmlFor="ward" className="block text-[#14213d] font-medium mb-1">
        Ward
      </label>
      <select
        id="ward"
        name="ward"
        value={formData.ward}
        onChange={handleChange}
        className="form-select w-full border border-gray-300 text-[#14213d] rounded px-3 py-2 focus:border-blue-500"
        required
        disabled={!formData.subcounty} // Disable until subcounty is chosen
      >
        <option value="">Select Ward</option>
        {formData.subcounty &&
          subCounties[formData.subcounty].map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
      </select>
              </div>
              <div>
                 {/* Village Dropdown */}
      <label htmlFor="village" className="block text-[#14213d] font-medium mb-1">
        Village Unit
      </label>
      <select
        id="village"
        name="village"
        value={formData.village}
        onChange={handleChange}
        className="form-select w-full border border-gray-300 text-[#14213d] rounded px-3 py-2 focus:border-blue-500"
        required
        disabled={!formData.ward}
      >
        <option value="">Select Village</option>
        {formData.ward &&
          villages[formData.ward]?.map((village) => (
            <option key={village} value={village}>
              {village}
            </option>
          ))}
      </select>
              </div>
              <div>
                <label htmlFor="birth" className="block text-[#14213d] font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  id="birth"
                  name="birth"
                  value={formData.birth}
                  onChange={handleChange}
                  className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[#14213d] font-medium mb-1">Gender</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      className="form-radio text-blue-600"
                      required
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      className="form-radio text-blue-600"
                      required
                    />
                    <span className="ml-2">Female</span>
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="institution" className="block text-[#14213d] font-medium mb-1">Name of Institution</label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter institution"
                  required
                />
              </div>
              <div>
                <label htmlFor="year" className="block  text-[#14213d] font-medium mb-1">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="form-input w-full border text-[#14213d] border-gray-300 rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter year of education"
                  required
                />
              </div>
              <div>
                <label htmlFor="admission" className="block text-[#14213d] font-medium mb-1">Admission</label>
                <input
                  type="text"
                  id="admission"
                  name="admission"
                  value={formData.admission}
                  onChange={handleChange}
                  className="form-input w-full border border-gray-300 text-[#14213d] rounded px-3 py-2 focus:border-blue-500"
                  placeholder="Enter Admission"
                  required
                />
              </div>
            </form>
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-[#14213d] text-white px-10 py-2 min-w-[100px] md:min-w-[160px] rounded cursor-pointer hover:bg-gray-600 transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
