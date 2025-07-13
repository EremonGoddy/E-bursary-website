import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faUserPlus, faListCheck, faFileUpload, faBell, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";

const ServicesPage = () => {
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

return (
<div className="w-full overflow-x-hidden">
{/* Navbar - Fixed */}
<nav className=" bg-white fixed top-0 left-0 w-full shadow-lg z-20 md:pl-20 md:pr-20">
<div className=" mx-auto px-4 sm:px-0 py-2 flex justify-between items-center">
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
className=" md:hidden p-2 rounded-lg focus:outline-none"
onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
<FontAwesomeIcon
icon={isMobileMenuOpen ? faXmark : faBars}
className="text-[#14213d]   text-3xl focus"/>
</button>
</div>
{/* Mobile Menu */}
{isMobileMenuOpen && (
<div className=" bg-white p-4 w-[95%]  rounded-lg transition-transform ease-in duration-100 shadow-md z-20 absolute top-[70px] left-1/2 transform -translate-x-1/2 h-[240px]">
<Link
className="block text-lg font-semibold text-[#14213d]    transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/"
onClick={() => setIsMobileMenuOpen(false)}>
Home
</Link>
<Link
className="block text-lg  font-semibold text-[#14213d]   transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/about"
onClick={() => setIsMobileMenuOpen(false)}
>
About
</Link>
<Link
className="block text-lg font-semibold text-[#14213d]    transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/services"
onClick={() => setIsMobileMenuOpen(false)}
>
Services
</Link>
<Link
className="block text-lg  font-semibold text-[#14213d]   transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/contact"
onClick={() => setIsMobileMenuOpen(false)}>
Contact
</Link>
</div>
)}
</nav>

{/* Hero Section with Tailwind Styling */}
<div className="relative mt-[60px]">
<img
src="/images/finance.jpg"
alt="About Us"
className="w-full object-cover h-[40vh] md:h-[65vh]"
/>
<div className=" blurs absolute mb-28 md:mb-4 lg:mt-8 xl:mb-50  bottom-0 left-0 w-full h-[60px] sm:h-[120px] md:h-[80px]  flex justify-center items-center">
<h2 className="text-[1.2rem] md:text-4xl text-white mt-[1px] font-bold text-center">Our services </h2>
</div>
</div>

{/* Services Section */}
<div className="py-8 px-4 sm:px-8 mt-[2px] sm:mt-[2px] md:mt-[2px] lg:mt-[2px] xl:mt-[2px]">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
{/* Student Registration */}
<div className="mb-4 p-4 bg-white  rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
<div className="flex justify-center mb-2">
<FontAwesomeIcon icon={faUserPlus} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
  </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Student Registration</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
Easily register for bursary applications through our user-friendly system. 
Create an account and start your journey toward financial assistance. 
The digital process eliminates paperwork and streamlines registration, 
allowing students to focus on their education without hassle.
</p>
</div>

{/* Application Tracking */}
<div className="mb-4 p-4 bg-white  rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
    <div className="flex justify-center mb-2">
    <FontAwesomeIcon icon={faListCheck} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
      </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Application Tracking</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
Track your bursary application in real time with our transparent system. 
Stay informed at every stage, from submission to approval, through timely 
updates. No need to follow up manually — our platform keeps you in the loop.
</p>
</div>

{/* Document Upload */}
<div className="mb-4 p-4 bg-white  rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
    <div className="flex justify-center mb-2">
    <FontAwesomeIcon icon={faFileUpload} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
      </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Document Upload</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
Upload required documents securely and with ease. Our system supports multiple 
file formats and ensures data confidentiality. Simplify submissions and manage 
your application digitally, reducing the need for physical paperwork.
</p>
</div>

{/* Allocation Notifications */}
<div className="mb-4 p-4 bg-white  rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
    <div className="flex justify-center mb-2">
    <FontAwesomeIcon icon={faBell} className="text-[#14213d] text-[2rem] md:text-[2rem]" />
      </div>
<h2 className="text-[1.3rem] md:text-[1.35rem] font-bold text-[#14213d] text-center">Allocation Notifications</h2>
<p className="text-[#14213d] mt-4 text-[1rem] md:text-[1.1rem]">
Get notified about bursary allocation and disbursement status. Our alerts 
keep you informed at key milestones, helping you stay updated and plan 
ahead with confidence. Notifications are sent directly to ensure transparency.
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

export default ServicesPage;