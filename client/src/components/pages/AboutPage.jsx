import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faBalanceScale, faEye, faMobileScreenButton, faPeopleGroup, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";

const AboutPage = () => {

  
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

return (
<div className="w-full overflow-x-hidden">
{/* Navbar - Fixed */}
<nav className="bg-white fixed top-0 left-0 w-full shadow-lg z-20 md:pl-20 md:pr-20">
<div className="mx-auto px-4 sm:px-0 py-2 flex justify-between items-center">
<Link className="text-3xl sm:text-3xl md:text-4xl font-bold text-[#1d3557]" to="/">
Ebursary
</Link>
<div className="space-x-4 hidden md:flex">
<Link
className="relative text-[1.35rem] text-[#14213d] font-semibold px-3 py-2 transition duration-300 hover:text-[#fca311] 
before:absolute before:bottom-0 before:left-2 before:h-[2.5px] before:w-0 
before:bg-[#fca311] before:transition-all before:duration-300 
hover:before:w-[80%]"
to="/">
Home
</Link>
<Link
className="relative text-[1.35rem] text-[#14213d] font-semibold px-3 py-2 transition duration-300 hover:text-[#fca311] 
before:absolute before:bottom-0 before:left-2 before:h-[2.5px] before:w-0 
before:bg-[#fca311] before:transition-all before:duration-300 
hover:before:w-[80%]"
to="/about">
About
</Link>
<Link
className="relative text-[1.35rem] text-[#14213d] font-semibold px-3 py-2 transition duration-300 hover:text-[#fca311] 
before:absolute before:bottom-0 before:left-2 before:h-[2.5px] before:w-0 
before:bg-[#fca311] before:transition-all before:duration-300 
hover:before:w-[80%]"
to="/services">
Services
</Link>
<Link
className="relative text-[1.35rem] text-[#14213d] font-semibold px-3 py-2 transition duration-300 hover:text-[#fca311] 
before:absolute before:bottom-0 before:left-2 before:h-[2.5px] before:w-0 
before:bg-[#fca311] before:transition-all before:duration-300 
hover:before:w-[80%]"
to="/contact">
Contact
</Link>
</div>
{/* Mobile Menu Toggle */}
<button
className="md:hidden p-2 rounded-lg focus:outline-none"
onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
>
<FontAwesomeIcon
icon={isMobileMenuOpen ? faXmark : faBars}
className="text-[#14213d]  text-2xl focus"
/>
</button>
</div>
{/* Mobile Menu */}
{isMobileMenuOpen && (
<div className="bg-white p-4 w-[95%]  rounded-lg transition-transform ease-in duration-100 shadow-md z-20 absolute top-[70px] left-1/2 transform -translate-x-1/2 h-[240px]">
<Link
className="block text-lg font-semibold text-[#14213d]  transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/"
onClick={() => setIsMobileMenuOpen(false)}>
Home
</Link>
<Link
className="block text-lg font-semibold text-[#14213d]   transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/about"
onClick={() => setIsMobileMenuOpen(false)}>
About
</Link>
<Link
className="block text-lg  font-semibold text-[#14213d] transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/services"
onClick={() => setIsMobileMenuOpen(false)}
>
Services
</Link>
<Link
className="block text-lg  font-semibold text-[#14213d] transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/contact"
onClick={() => setIsMobileMenuOpen(false)}
>
Contact
</Link>
</div>
)}
</nav>

{/* Hero Section with Tailwind Styling */}
<div className="relative mt-[60px]">
<img
src="/images/mission.jpg"
alt="About Us"
className="w-full object-cover h-[40vh] md:h-[60vh]"
/>
<div className="blurs absolute mb-28 md:mb-4 lg:mt-8 xl:mb-50  bottom-0 left-0 w-full h-[60px] sm:h-[120px] md:h-[80px]  flex justify-center items-center">
<h2 className="text-[1.2rem] md:text-4xl text-white mt-[1px] font-bold text-center">About Us</h2>
</div>
</div>

{/* About Section */}
<div className="py-8 px-4 sm:px-8 mt-[2px]  sm:mt-[2px] md:mt-[2px] lg:mt-[2px] xl:mt-[2px] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
{/* Student Registration */}
<div className="mb-3 p-4 backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
  <div className="flex justify-center mb-2">
<FontAwesomeIcon icon={faBalanceScale} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
  </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Equity</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
Every student deserves a fair and equal opportunity to pursue their education, regardless of their background, family income, or geographic location.  
  Our platform is built to eliminate systemic barriers, ensuring that bursary support reaches those who need it most, with transparency and accountability.
</p>
</div>

{/* Application Tracking */}
<div className=" mb-3 p-4 backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl transition-all duration-300 transform hover:scale-[1.01]">
 <div className="flex justify-center mb-2">
<FontAwesomeIcon icon={faEye} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
  </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Transparency</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
From application to allocation, our platform keeps both students and guardians in the loop with timely updates at every stage.  
  Real-time notifications ensure that no one is left wondering about their application status or disbursement progress.
</p>
</div>

{/* Document Upload */}
<div className="mb-3 p-4 backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl  transition-all duration-300 transform hover:scale-[1.01]">
 <div className="flex justify-center mb-2">
<FontAwesomeIcon icon={faMobileScreenButton} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
  </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Accessibility</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
 Built with simplicity in mind, the eBursary system is designed for easy access anytime, anywhere — whether you're using a smartphone or a computer.  
  This convenience ensures that students and guardians can apply and stay updated without the need to visit offices physically.
</p>
</div>

{/* Allocation Notifications */}
<div className="mb-3 p-4 backdrop-blur-xl bg-white/80 border border-gray-200 shadow-xl rounded-2xl  transition-all duration-300 transform hover:scale-[1.01]">
<div className="flex justify-center mb-2">
<FontAwesomeIcon icon={faPeopleGroup} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
  </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Impact</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
By removing barriers to education funding, we’re not just offering support — we’re creating opportunities.  
This effort plays a vital role in shaping a brighter, more inclusive future for students across Turkana County.
</p>
</div>
</div>
</div>

{/* Footer */}
<footer className="bg-[#14213d] text-white text-center py-4 text-[1rem] md:text-[1.35rem] flex items-center justify-center gap-2">
  <FontAwesomeIcon icon={faGraduationCap} className="text-white text-lg md:text-xl" />
  <span>&copy; {new Date().getFullYear()} E-Bursary | Empowering Education</span>
</footer>
</div>
);
};

export default AboutPage;