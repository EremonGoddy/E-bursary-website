import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./components/pages/HomePage"
import AboutPage from './components/pages/AboutPage';
import ServicesPage from './components/pages/ServicesPage';
import ContactPage from './components/pages/ContactPage';
import LoginPage from './components/authentication/LoginPage';
import RegisterPage from './components/authentication/RegisterPage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import CommitteeDashboard from './components/dashboard/CommitteeDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import PersonalDetails from './components/applicationform/PersonalDetails';
import AmountDetails from './components/applicationform/AmountDetails';
import DisclosureDetails from './components/applicationform/DisclosureDetails';
import FamilyDetails from './components/applicationform/FamilyDetails';
import StudentSetting from './components/applicationform/StudentSetting';
import Documentupload from './components/applicationform/DocumentUpload';
import StudentReport from './components/applicationform/StudentReport';
import CommitteeReport from './components/committeeview/CommitteeReport';
import PersonalInformation from './components/committeeview/PersonalInformation';
import UserDetails from './components/committeeview/UserDetails';
import CommitteeProfile from './components/committeeview/CommitteeProfile';
import CommitteeSetting from './components/committeeview/CommitteeSetting';
import AdminReport from './components/admincontrols/AdminReport';
import BursaryFundManagement from './components/admincontrols/BursaryFundManagment';
import MonitoringApplication from './components/admincontrols/MonitoringApplication';
import UserManagement from './components/admincontrols/UserManagement';
import AdminSetting from './components/admincontrols/AdminSetting';
import AuditLogs from './components/admincontrols/AuditLogs';
import BursaryAllocation from './components/committeeview/BursaryAllocation';
import ProgressStepper from './components/applicationform/ProgressStepper';
import ForgotPassword from './components/authentication/ForgotPassword';
import OTPVerification from './components/authentication/VerifyOtp';
import PasswordReset from './components/authentication/ResetPassword';


function App() {


return (
<Router>
<div className="App">
<Routes>
<Route path="/" element={<HomePage/>} />
<Route path="/about" element={<AboutPage/>} />
 <Route path="/services" element={<ServicesPage/>} />
<Route path="/contact" element={<ContactPage/>} />
<Route path="/login" element={<LoginPage/>} />
<Route path="/register" element={<RegisterPage/>} />
<Route path="/admindashboard" element={<AdminDashboard/>} />
<Route path="/committeedashboard" element={<CommitteeDashboard/>} />
<Route path="/studentdashboard" element={<StudentDashboard/>} />
<Route path="/personaldetails" element={<PersonalDetails/>} />
<Route path="/amountdetails" element={<AmountDetails/>} />
<Route path="/disclosuredetails" element={<DisclosureDetails/>} />
<Route path="/familydetails" element={<FamilyDetails/>} />
<Route path="/studentsetting" element={<StudentSetting/>} />
<Route path="/documentupload" element={<Documentupload/>} />
<Route path="/studentreport" element={<StudentReport/>} />
<Route path="/committeereport" element={<CommitteeReport/>}/>
<Route path="/personalInformation" element={<PersonalInformation/>}/>
<Route path="/personalInformation/:id" element={<PersonalInformation/>} />
<Route path="/userdetails" element={<UserDetails/>} />
<Route path="/committeeprofile" element={<CommitteeProfile/>} />
<Route path="/committeesetting" element={<CommitteeSetting/>} />
<Route path="/adminreport" element={<AdminReport/>} />
<Route path="/adminsetting" element={<AdminSetting/>} />
<Route path="/auditlogs" element={<AuditLogs/>} />
<Route path="/bursarymanagement" element={<BursaryFundManagement/>} />
<Route path="/monitoring" element={<MonitoringApplication/>} />
<Route path="/usermanagement" element={<UserManagement/>} />
<Route path="/bursaryallocation" element={<BursaryAllocation/>} />
<Route path="/bursaryallocation/:id" element={<BursaryAllocation/>}/>
<Route path="/progress" element={<ProgressStepper/>}/>
<Route path="/forgotpassword" element={<ForgotPassword/>}/>
<Route path="/otpverify" element={<OTPVerification/>}/>
<Route path="/resetpassword" element={<PasswordReset/>}/>
</Routes>
</div>
</Router>
)
}

export default App
