import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
faBars,
faXmark,
faMapMarkerAlt,
faPhoneAlt,
faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";

const ContactPage = () => {
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

return (
<div className="w-full overflow-x-hidden">
{/* Navbar - Fixed */}
<nav className=" bg-white fixed top-0 left-0 w-full shadow-lg z-20 md:pl-20 md:pr-20">
<div className=" mx-auto px-4 sm:px-0 py-2 flex justify-between items-center">
<Link className="text-3xl sm:text-3xl md:text-4xl font-bold text-[#1F2937]" to="/">
Ebursary
</Link>
<div className="space-x-4 hidden md:flex">
<Link
className=" text-[1.35rem] transition duration-300 px-3 py-2 rounded hover:text-[#FFD700]"
to="/">
Home
</Link>
<Link
className="text-[1.35rem] transition duration-300 px-3 py-2 rounded hover:text-[#FFD700]"
to="/about">
About
</Link>
<Link
className="text-[1.35rem] transition duration-300 px-3 py-2 rounded hover:text-[#FFD700]"
to="/services"
>
Services
</Link>
<Link
className="text-[1.35rem] transition duration-300 px-3 py-2 rounded hover:text-[#FFD700]"
to="/contact"
>
Contact
</Link>
</div>
{/* Mobile Menu Toggle */}
<button
className=" md:hidden p-2 rounded-lg focus:outline-none"
onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
>
<FontAwesomeIcon
icon={isMobileMenuOpen ? faXmark : faBars}
className="text-gray-700 text-3xl focus"
/>
</button>
</div>
{/* Mobile Menu */}
{isMobileMenuOpen && (
<div className="bg-white p-4 w-[95%]  rounded-lg transition-transform ease-in duration-100 shadow-md z-20 absolute top-[70px] left-1/2 transform -translate-x-1/2 h-[240px]">
<Link
className="block text-lg   transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/"
onClick={() => setIsMobileMenuOpen(false)}>
Home
</Link>
<Link
className="block text-lg   transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/about"
onClick={() => setIsMobileMenuOpen(false)}>
About
</Link>
<Link
className="block text-lg   transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
to="/services"
onClick={() => setIsMobileMenuOpen(false)}>
Services
</Link>
<Link
className="block text-lg   transition duration-300  px-3 py-3 text-center hover:text-[#FFD700]"
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
src="/images/contact.jpg"
alt="About Us"
className="w-full object-cover h-[40vh] md:h-[65vh]"
/>
<div className="blurs absolute mb-28 md:mb-4 lg:mt-8 xl:mb-50  bottom-0 left-0 w-full h-[60px] sm:h-[120px] md:h-[80px]  flex justify-center items-center">
<h2 className="text-[1.2rem] md:text-4xl text-white mt-[1px] font-bold text-center">Contact us</h2>
</div>
</div>

{/* Services Section */}
<div className="py-8 px-4 sm:px-8 mt-[2px] sm:mt-[2px] md:mt-[2px] lg:mt-[2px] xl:mt-[2px]">
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-3 md:mb-8">
{/* Location */}
<div className="mb-3 p-4 bg-white  rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
<FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#1F2937] text-2xl" />
<div>
<h4 className="text-[1.3rem] md:text-[1.35rem] font-semibold text-gray-800">Location</h4>
<p className="text-gray-600 mt-4 text-[1rem] md:text-[1.1rem]">
Nawoitorong, Turkana County Headquarters<br />P.O Box 141-30500, Lodwar
</p>
</div>
</div>

{/* Phone */}
<div className="mb-3 p-4 bg-white  rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
<FontAwesomeIcon icon={faPhoneAlt} className="text-[#1F2937] text-2xl" />
<div>
<h4 className="text-[1.3rem] md:text-[1.35rem] font-semibold text-gray-800">Phone</h4>
<p className="text-gray-600 mt-4 text-[1rem] md:text-[1.1rem]">+254707556732</p>
<p className="text-gray-600 mt-4 text-[1rem] md:text-[1.1rem]">+254707556732</p>
</div>
</div>

{/* Email */}
<div className="mb-3 p-4 bg-white  rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)]">
<FontAwesomeIcon icon={faEnvelope} className="text-[#1F2937] text-2xl" />
<div>
<h4 className="text-[1.3rem] md:text-[1.35rem] font-semibold text-gray-800">Email</h4>
<p className="text-gray-600 mt-4 text-[1rem] md:text-[1.1rem]">eremon.godwin@gmail.com</p>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Contact Details */}
  <div className="mb-3 p-4 bg-transparent rounded-lg flex flex-col justify-center">
    <h3 className="text-[1.3rem] md:text-[1.35rem] font-semibold text-gray-800">Contact Us</h3>
    <p className="text-gray-600 mt-4 text-[1rem] md:text-[1.1rem]">
      Have questions or need assistance? We're here to help! Whether you’re seeking information,
      need support, or have feedback, feel free to reach out. Fill out the form below with your
      details and message, and our team will respond promptly.
      We look forward to connecting with you and addressing your needs effectively!
    </p>
  </div>

  {/* Message Form */}
  <div className="mb-3 p-4 bg-white rounded-lg shadow-[0_0_10px_3px_rgba(0,0,0,0.25)] ml-auto w-full max-w-lg">
    <h2 className="text-[1.3rem] md:text-[1.35rem] font-semibold text-gray-800 text-center">Send us a Message</h2>
    <form className="p-4 space-y-4">
      <div>
        <label className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Name</label>
        <input
          type="text"
          className="w-full px-4 py-2 border text-[1rem] md:text-[1.1rem] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          placeholder="John Doe"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 text-[1rem] md:text-[1.1rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          placeholder="example@email.com"
        />
      </div>
      <div>
        <label className="block text-gray-700 text-[1rem] md:text-[1.1rem] font-semibold mb-1">Message</label>
        <textarea
          className="w-full px-4 py-2 h-24 border text-[1rem] md:text-[1.1rem] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          placeholder="Write your message here..."
        />
      </div>
      <button
        type="submit"
        className="bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
      >
        Send Message
      </button>
    </form>
  </div>
</div>
</div>

{/* Footer */}
<footer className="bg-gray-800 text-white text-center py-4">
&copy; {new Date().getFullYear()} E-Bursary | Empowering Education
</footer>
</div>
);
};

export default ContactPage;