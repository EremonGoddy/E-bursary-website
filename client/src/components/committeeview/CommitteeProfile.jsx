// src/components/CommitteeProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faHouse,
  faUser,
  faUsers,
  faCog,
  faBell,
  faChartBar,
  faSignOutAlt,
  faEdit,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import "./Overlay.css";

const API_BASE = 'https://e-bursary-backend.onrender.com';
const MAX_FILE_BYTES = 2 * 1024 * 1024; // server limit you mentioned (2MB)
const TARGET_BYTES = 1.6 * 1024 * 1024; // aim below this to be safe

const CommitteeProfile = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [committeeDetails, setCommitteeDetails] = useState({});
  const [userName, setUserName] = useState('');
  const [isEditFormVisible, setEditFormVisible] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState('');

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone_no: '',
    national_id: '',
    gender: '',
    subcounty: '',
    ward: '',
    position: '',
    signature: '', // holds either existing URL or compressed base64 data URL
  });

  const [isProfileFetched, setIsProfileFetched] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  // Dropdown options
  const subcountyWards = {
    "Turkana Central": ["Kanamkemer", "Kerio Delta", "Kang'atotha", "Kalokol", "Lodwar Township"],
    "Turkana East": ["Lokori/Kochodin", "Katilia", "Kapedo/Napeitom"],
    "Turkana South": ["Kaputir", "Katilu", "Lobokat", "Lokichar", "Kalapata"],
    "Loima": ["Lokiriama/Lorengipi", "Lobei/Kotaruk", "Loima", "Turkwel"],
    "Turkana North": ["Kaeris", "Kaaleng/Kaikor", "Lake Zone", "Kibish", "Nakalale", "Lapur"],
    "Turkana West": ["Letea", "Kalobeyei", "Kakuma", "Lopur", "Songot"],
  };

  const subcounties = Object.keys(subcountyWards);
  const positions = ["Chairperson", "Secretary", "Treasurer", "Member"];

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const name = sessionStorage.getItem('userName');

    if (!token) {
      navigate('/signin');
      return;
    }

    setUserName(name || '');

    axios
      .get(`${API_BASE}/api/profile-committee`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setIsProfileFetched(true);
        const data = response.data;

        if (!data || Object.keys(data).length === 0) {
          setProfileExists(false);
          return;
        }

        setProfileExists(true);
        setCommitteeDetails(data);

        // Put returned signature URL (if any) into formData.signature so saving without change re-sends it
        setFormData((prev) => ({
          ...prev,
          ...data,
          signature: data.signature || '',
        }));

        if (data.signature) {
          setSignaturePreview(data.signature);
        }
      })
      .catch((error) => {
        console.error('Error fetching profile data:', error);
        setIsProfileFetched(true);
        setProfileExists(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Utility: approximate byte size of dataURL
  const dataUrlByteSize = (dataUrl) => {
    if (!dataUrl) return 0;
    const base64 = dataUrl.split(',')[1] || '';
    const padding = (base64.endsWith('==') ? 2 : (base64.endsWith('=') ? 1 : 0));
    return Math.ceil((base64.length * 3) / 4) - padding;
  };

  // Replace resizeAndCompress to fill canvas with white before drawing the image.
  // This prevents transparent/white background from turning black when exporting as JPEG.
  const resizeAndCompress = (file, mime = 'image/jpeg', quality = 0.8, maxW = 1200, maxH = 600) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const ratio = width / height;

          if (width > maxW) {
            width = maxW;
            height = Math.round(width / ratio);
          }
          if (height > maxH) {
            height = maxH;
            width = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // IMPORTANT: fill background with white so JPEG exports don't get a black background.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);

          // draw image on top of the white background
          ctx.drawImage(img, 0, 0, width, height);

          try {
            const dataUrl = canvas.toDataURL(mime, quality);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image (possibly CORS or invalid file)'));
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection: validate + compress until under target size
  const handleSignatureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
      alert('Please upload a valid image file (PNG, JPG, GIF)');
      return;
    }

    // Quick reject if file is huge (>10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Please choose a smaller image (max 10MB) before upload.');
      return;
    }

    setSignatureFile(file);

    // Strategy: try progressively lower quality values and dimensions
    const qualityCandidates = [0.85, 0.75, 0.65, 0.55, 0.45];
    const dimensionCandidates = [
      [1200, 600],
      [1000, 500],
      [800, 400],
      [600, 300],
    ];

    let finalDataUrl = null;

    try {
      for (let q of qualityCandidates) {
        for (let dims of dimensionCandidates) {
          const dataUrl = await resizeAndCompress(file, 'image/jpeg', q, dims[0], dims[1]);
          const size = dataUrlByteSize(dataUrl);
          if (size <= TARGET_BYTES) {
            finalDataUrl = dataUrl;
            break;
          }
        }
        if (finalDataUrl) break;
      }
    } catch (err) {
      console.error('Error during image compression:', err);
      alert('Failed to process image. Try a different image.');
      setSignatureFile(null);
      return;
    }

    // Last attempt: aggressive low-quality small size
    if (!finalDataUrl) {
      try {
        const tryLow = await resizeAndCompress(file, 'image/jpeg', 0.35, 600, 300);
        if (dataUrlByteSize(tryLow) <= MAX_FILE_BYTES) {
          finalDataUrl = tryLow;
        }
      } catch (e) {
        // ignore, will handle below
      }
    }

    if (!finalDataUrl) {
      alert('Selected image could not be reduced below server limit. Please pick a smaller image or crop it locally.');
      setSignatureFile(null);
      return;
    }

    setSignaturePreview(finalDataUrl);
    setFormData((prev) => ({ ...prev, signature: finalDataUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      // Build payload. The backend expects signature as string (either URL or base64 data URL).
      // We keep existing signature URL in formData.signature (set during GET) so we re-send it if unchanged.
      const payload = {
        fullname: formData.fullname,
        email: formData.email,
        phone_no: formData.phone_no,
        national_id: formData.national_id,
        gender: formData.gender,
        subcounty: formData.subcounty,
        ward: formData.ward,
        position: formData.position,
        signature: formData.signature || null,
      };

      await axios.post(`${API_BASE}/api/profile-form`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      alert('Profile created/updated successfully');
      setProfileExists(true);
      setEditFormVisible(false);
      setSignatureFile(null);
    } catch (error) {
      console.error('Error submitting committee data:', error);
      if (error.response && error.response.status === 413) {
        alert('Image too large for server. Please choose a smaller/compressed image and try again.');
      } else {
        alert('Error submitting data. Please try again.');
      }
    }
  };

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
            <h2 className="mr-1 md:mr-5 text-sm md:text-lg font-bold text-[#14213d]">
              Welcome: {committeeDetails.fullname || userName}
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
                className="text-xl cursor-pointer text-[#14213d]"
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
                        .post(`${API_BASE}/api/logout`, {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                        .catch(() => { })
                        .finally(() => {
                          sessionStorage.clear();
                          navigate('/');
                        });
                    }}
                    className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>
                      {item.label}
                    </span>
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className={`flex items-center space-x-2 transition-all duration-200 ${sidebarActive ? 'justify-start' : 'justify-center'}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span className={`${sidebarActive ? 'inline-block ml-2 font-semibold' : 'hidden'}`}>
                      {item.label}
                    </span>
                  </Link>
                )}
                {!sidebarActive && (
                  <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 bg-[#14213d] text-white font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-[120px] flex items-center justify-center z-50">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ml-0 md:ml-64 md:p-4 -mt-6 md:-mt-6 ${sidebarActive ? 'ml-[2px] md:ml-[190px]' : 'ml-[0px] md:ml-[30px]'}`}>
          <div className="md:w-[98%] w-full backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[500px] mx-auto p-3 md:p-6">
            {isProfileFetched ? (
              profileExists ? (
                isEditFormVisible ? (
                  // ---------- EDIT FORM ----------
                  <form onSubmit={handleSubmit}>
                    <h2 className="text-[#14213d] text-2xl font-bold text-center mb-5">
                      Edit Profile
                    </h2>

                    {/* Full Name */}
                    <div className="flex items-center gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">
                        Full Name:
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">Phone No:</label>
                      <input
                        type="text"
                        name="phone_no"
                        value={formData.phone_no}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                        required
                      />
                    </div>

                    {/* National ID */}
                    <div className="flex items-center gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">National ID:</label>
                      <input
                        type="text"
                        name="national_id"
                        value={formData.national_id}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div className="flex items-center mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">Gender:</label>
                      <div className="flex gap-6">
                        {['Male', 'Female'].map((g) => (
                          <label className="flex items-center gap-2" key={g}>
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={formData.gender === g}
                              onChange={handleChange}
                              className="accent-[#14213d]"
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Subcounty */}
                    <div className="flex items-center gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">Subcounty:</label>
                      <select
                        name="subcounty"
                        value={formData.subcounty}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                        required
                      >
                        <option value="">Select Subcounty</option>
                        {subcounties.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ward */}
                    <div className="flex items-center gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">Ward:</label>
                      <select
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                        required
                      >
                        <option value="">Select Ward</option>
                        {(subcountyWards[formData.subcounty] || []).map((ward, i) => (
                          <option key={i} value={ward}>{ward}</option>
                        ))}
                      </select>
                    </div>

                    {/* Position */}
                    <div className="flex items-center gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold w-[110px]">Position:</label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                        required
                      >
                        <option value="">Select Position</option>
                        {positions.map((pos, i) => (
                          <option key={i} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>

                    {/* NEW: Signature Upload */}
                    <div className="flex flex-col gap-3 mb-5">
                      <label className="text-[#14213d] font-semibold">Upload Signature:</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureChange}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      {signaturePreview && (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-sm text-gray-600">Signature Preview:</p>
                          <img
                            src={signaturePreview}
                            alt="Signature Preview"
                            className="border border-gray-300 rounded w-40 h-20 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <button
                      type="submit"
                      className="text-white w-full py-2 rounded-lg bg-[#14213d] cursor-pointer hover:bg-gray-700"
                    >
                      Update Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditFormVisible(false)}
                      className="w-full mt-2 text-[#14213d] cursor-pointer font-semibold border border-[#14213d] py-2 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  // ---------- PROFILE VIEW ----------
                  <div className="relative py-2">
                    <FontAwesomeIcon icon={faUser} className="text-[#14213d] text-2xl inline-block align-middle mr-2" />
                    <h2 className="text-xl font-bold inline-block align-middle text-[#14213d]">Profile</h2>

                    <button
                      onClick={() => setEditFormVisible(true)}
                      className="absolute right-0 top-2 bg-blue-500 cursor-pointer text-white px-1 py-1 md:px-3 md:py-1 font-bold rounded hover:bg-blue-600 flex items-center"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1 font-bold" /> Edit Profile
                    </button>

                    <hr className="my-4" />

                    <div className="space-y-5 text-[#14213d]">
                      {Object.entries(formData).map(([key, value]) => {
                        // Skip signature field from display (show in separate section)
                        if (key === 'signature') return null;

                        return (
                          <div className="flex items-start gap-3 md:gap-24" key={key}>
                            <span className="w-32 font-bold capitalize">{key.replace('_', ' ')}:</span>
                            <span className="flex-1">{String(value ?? '')}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Signature Preview Section */}
                    {signaturePreview && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-bold text-[#14213d] mb-3">Committee Signature</h3>
                        <img
                          src={signaturePreview}
                          alt="Committee Signature"
                          className="border border-gray-300 rounded w-40 h-20 object-contain"
                        />
                      </div>
                    )}
                  </div>
                )
              ) : (
                // ---------- CREATE PROFILE ----------
                <form onSubmit={handleSubmit}>
                  <h2 className="text-[#14213d] text-2xl font-bold text-center mb-5">
                    Create Profile
                  </h2>

                  {/* Full Name */}
                  <div className="flex items-center gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">
                      Full Name:
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">Phone No:</label>
                    <input
                      type="text"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                      required
                    />
                  </div>

                  {/* National ID */}
                  <div className="flex items-center gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">National ID:</label>
                    <input
                      type="text"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex items-center mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">Gender:</label>
                    <div className="flex gap-6">
                      {['Male', 'Female'].map((g) => (
                        <label className="flex items-center gap-2" key={g}>
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={formData.gender === g}
                            onChange={handleChange}
                            className="accent-[#14213d]"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Subcounty */}
                  <div className="flex items-center gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">Subcounty:</label>
                    <select
                      name="subcounty"
                      value={formData.subcounty}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                      required
                    >
                      <option value="">Select Subcounty</option>
                      {subcounties.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ward */}
                  <div className="flex items-center gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">Ward:</label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                      required
                    >
                      <option value="">Select Ward</option>
                      {(subcountyWards[formData.subcounty] || []).map((ward, i) => (
                        <option key={i} value={ward}>{ward}</option>
                      ))}
                    </select>
                  </div>

                  {/* Position */}
                  <div className="flex items-center gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold w-[110px]">Position:</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#14213d]"
                      required
                    >
                      <option value="">Select Position</option>
                      {positions.map((pos, i) => (
                        <option key={i} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  {/* NEW: Signature Upload */}
                  <div className="flex flex-col gap-3 mb-5">
                    <label className="text-[#14213d] font-semibold">Upload Signature:</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    {signaturePreview && (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-gray-600">Signature Preview:</p>
                        <img
                          src={signaturePreview}
                          alt="Signature Preview"
                          className="border border-gray-300 rounded w-40 h-20 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="text-white w-full py-2 rounded-lg bg-[#14213d] cursor-pointer hover:bg-gray-700"
                  >
                    Create Profile
                  </button>
                </form>
              )
            ) : (
              <p className="text-center">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeProfile;