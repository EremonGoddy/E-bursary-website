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
<Route path="/committeereport" element={<CommitteeReport/>} />
</Routes>
</div>
</Router>
)
}

export default App
