import React, { useEffect, useState } from 'react';
import ProgressStepper from "./ProgressStepper";
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
faHouse, faFileAlt, faTimes, faPaperclip, faDownload, faComments, faCog,
faSignOutAlt, faBars, faBell,
} from '@fortawesome/free-solid-svg-icons';

const Documentupload = () => {
const [sidebarActive, setSidebarActive] = useState(false);
const [userName, setUserName] = useState('');
const [studentDetails, setStudentDetails] = useState({});
const [documentUploaded, setDocumentUploaded] = useState(false);
const [hasNewMessage, setHasNewMessage] = useState(false);
const [formData, setFormData] = useState({
documentName: '',
document: null,
});
const [uploadStatus, setUploadStatus] = useState('');
const [existingDocument, setExistingDocument] = useState(null);
const [documentList, setDocumentList] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

const location = useLocation();

// Add userId from session
const userId = sessionStorage.getItem('userId');

// Handle file selection
const handleFileChange = (e) => {
const file = e.target.files[0];
setFormData({
...formData,
documentName: file ? file.name : '',
document: file || null,
});
setUploadStatus('');
};

const toggleSidebar = () => setSidebarActive(!sidebarActive);

// Handle file upload submit
const handleSubmit = async (e) => {
e.preventDefault();
setUploadStatus('');
if (!formData.document || !formData.documentName) {
setUploadStatus('Please select a document to upload.');
return;
}
if (!userId) {
setUploadStatus('User not found. Please login again.');
return;
}
const formDataToSend = new FormData();
formDataToSend.append('documentName', formData.documentName);
formDataToSend.append('document', formData.document);
formDataToSend.append('userId', userId);

try {
const response = await axios.post(
'https://e-bursary-backend.onrender.com/api/upload',
formDataToSend,
{ headers: { 'Content-Type': 'multipart/form-data' } }
);
if (
typeof response.data === 'string' &&
response.data.toLowerCase().includes('success')
) {
setUploadStatus('File uploaded successfully!');
setFormData({ documentName: '', document: null });
// Refresh list after upload
fetchDocuments();
// Optionally redirect after a delay
setTimeout(() => navigate('/studentdashboard'), 800);
} else {
setUploadStatus('File upload failed!');
}
} catch (error) {
console.error('Error uploading file:', error);
setUploadStatus('File upload failed!');
}
};


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


// Fetch all uploaded documents for this user
const fetchDocuments = async () => {
if (!userId) return;
try {
const res = await axios.get(`https://e-bursary-backend.onrender.com/api/upload/list/${userId}`);
if (Array.isArray(res.data)) {
setDocumentList(res.data);
} else {
setDocumentList([]);
}
} catch (err) {
setDocumentList([]);
}
};

// On mount: check login, fetch user and documents, or redirect if already uploaded (single upload scenario)
useEffect(() => {
const token = sessionStorage.getItem('authToken');
const name = sessionStorage.getItem('userName');
const userId = sessionStorage.getItem('userId');
if (!token) {
navigate('/signin');
return;
}
setUserName(name);

// Check if document already uploaded (single-upload scenario)
if (userId) {
axios.get(`https://e-bursary-backend.onrender.com/api/upload/status/${userId}`)
.then(res => {
// If a document is already uploaded, redirect or show existing
if (res.data && res.data.user_id) {
setExistingDocument(res.data);
// Optionally, to allow multiple uploads, fetch all documents instead of redirecting
fetchDocuments();
// Uncomment if you want to redirect on first upload
// navigate('/studentdashboard');
}
})
.catch(err => {
// If 404, user can upload; if other error, handle as needed
if (err.response && err.response.status !== 404) {
setUploadStatus('Error checking upload status!');
}
});
// Always fetch all documents for the user (for list view)
fetchDocuments();
}
// eslint-disable-next-line
}, [navigate]);

// Delete document handler (optional, if you want users to remove their uploads)
const handleDelete = async (docId) => {
if (!window.confirm('Are you sure you want to delete this document?')) return;
try {
await axios.delete(`https://e-bursary-backend.onrender.com/api/upload/${docId}`);
setUploadStatus('Document deleted!');
fetchDocuments();
} catch (err) {
setUploadStatus('Error deleting document.');
}
};

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
{/* Sidebar toggle only visible on small screens */}
{/* Toggle Button for opening sidebar on mobile */}
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
{/* Toggle Button for Desktop View */}
<div className="hidden md:flex justify-end mb-4">
<FontAwesomeIcon
icon={sidebarActive ? faTimes : faBars}
className={`text-white cursor-pointer text-xl ${
sidebarActive ? 'ml-auto' : 'mr-1'
}`}
onClick={toggleSidebar}
/>
</div>

{/* Navigation Menu */}
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
onClick: () => navigate('/personaldetails'),
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
<li
className={`group relative ${item.isLogout ? 'mt-30 md:mt-55' : ''}`}
key={index}
>
{/* Logout Action */}
{item.isLogout ? (
<a
href="#"
onClick={(e) => {
e.preventDefault();
const token = sessionStorage.getItem('authToken');
axios
.post(
'https://e-bursary-backend.onrender.com/api/logout',
{},
{
headers: { Authorization: `Bearer ${token}` }
}
)
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
<FontAwesomeIcon
icon={item.icon}
className="text-xl"
/>
<span
className={`${
sidebarActive
? 'inline-block ml-2 font-semibold'
: 'hidden'
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
} ${
item.disabled
? 'pointer-events-none opacity-60 cursor-not-allowed'
: ''
}`}
aria-disabled={item.disabled ? 'true' : 'false'}
>
<FontAwesomeIcon
icon={item.icon}
className="text-xl"
/>
<span
className={`${
sidebarActive
? 'inline-block ml-2 font-semibold'
: 'hidden'
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
<FontAwesomeIcon
icon={item.icon}
className="text-xl"
/>
{item.label === 'Notification' && hasNewMessage && (
<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
)}
</div>
<span
className={`${
sidebarActive
? 'inline-block ml-2 font-semibold'
: 'hidden'
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
                        
<div className={`flex-1 md:ml-25 transition-all duration-300
${sidebarActive ? 'ml-[0px] md:ml-[200px]' : 'ml-0 md:ml-[50px]'}
`}>
<ProgressStepper currentStep={4} />
<div className="backdrop-blur-xl bg-white/80 border border-gray-300 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01] max-w-[350px] md:max-w-[600px]  mx-auto -mt-4 md:mt-2 mb-4 md:mb-6 p-4 md:p-8">
<h1 className="text-2xl font-bold mb-2 text-center text-[#14213d]">Bursary Application Form</h1>
<h2 className="text-lg font-semibold mb-6 text-center text-[#14213d]">Document Upload Form</h2>

{/* Display all uploaded documents */}
{documentList.length > 0 && (
<div className="mb-6">
<h3 className="font-semibold mb-2 text-center text-blue-700">Your Uploaded Documents</h3>
<ul className="space-y-2">
{documentList.map(doc => (
<li key={doc.id || doc.file_path} className="border rounded p-2 flex justify-between items-center">
<span>
<FontAwesomeIcon icon={faPaperclip} className="mr-2 text-blue-500" />
{doc.document_name}
</span>
<span className="flex items-center gap-3">
<a
href={`https://e-bursary-backend.onrender.com/${doc.file_path.replace(/^(\.\/)?uploads\//, 'uploads/')}`}
target="_blank"
rel="noopener noreferrer"
className="text-blue-700 underline"
>
View
</a>
{/* Optional: delete button */}
{/* <button
className="text-red-600 text-xs underline"
onClick={() => handleDelete(doc.id)}
>
Delete
</button> */}
</span>
</li>
))}
</ul>
</div>
)}

<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
<div>
<label htmlFor="documentName" className="block font-medium text-[#14213d] mb-2">Document Name</label>
<input
type="text"
value={formData.documentName}
readOnly
className="form-input w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 bg-gray-100"
placeholder="No file chosen"
/>
</div>
<div>
<label htmlFor="document" className="block font-medium text-[#14213d] mb-2">Upload Document</label>
<input
type="file"
id="document"
name="document"
onChange={handleFileChange}
required
className="form-input w-full border border-gray-300 rounded px-2 py-1 focus:border-[#14213d] file:mr-4 file:py-2 file:px-4 file:border-0 file:font-semibold file:bg-blue-50 file:cursor-pointer file:text-[#14213d] hover:file:bg-blue-100"
/>
</div>
<div className="flex justify-end mt-8">
<button
type="submit"
className="bg-[#14213d] text-white px-10 py-2 font-bold cursor-pointer min-w-[100px] md:min-w-[160px] rounded hover:bg-gray-700 transition duration-200"
>
Submit
</button>
</div>
</form>
{uploadStatus && (
<div className="mt-4 text-center">
<p className={`font-bold ${uploadStatus.includes('success') ? "text-green-600" : "text-red-600"}`}>
{uploadStatus}
</p>
</div>
)}
</div>
</div>
</div>
</div>
);
};

export default Documentupload;
