import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";

const AboutPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Navbar - Fixed */}
      <nav className="navbar bg-white fixed top-0 left-0 w-full shadow-lg z-20">
        <div className="container mx-auto px-4 sm:px-0 py-2 flex justify-between items-center">
          <Link className="text-2xl font-bold text-blue-500 hover:text-blue-600" to="/">
            Ebursary
          </Link>
          <div className="space-x-4 hidden md:flex">
            <Link
              className="nav-link text-lg transition duration-300 px-3 py-2 rounded"
              to="/"
            >
              Home
            </Link>
            <Link
              className="nav-link text-lg transition duration-300 px-3 py-2 rounded"
              to="/about"
            >
              About
            </Link>
            <Link
              className="nav-link text-lg transition duration-300 px-3 py-2 rounded"
              to="/services"
            >
              Services
            </Link>
            <Link
              className="nav-link text-lg transition duration-300 px-3 py-2 rounded"
              to="/contact"
            >
              Contact
            </Link>
          </div>
          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu md:hidden p-2 rounded-lg focus:outline-none focus:ring-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faXmark : faBars}
              className="text-gray-700 text-2xl"
            />
          </button>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="navbar-collapse bg-white p-4 w-[95%] rounded-lg transition-transform ease-in duration-100 shadow-md z-20 absolute top-[70px] left-1/2 transform -translate-x-1/2">
            <Link
              className="nab-links block text-lg transition duration-300 px-3 py-2 text-center"
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              className="nab-links block text-lg transition duration-300 px-3 py-2 text-center"
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              className="nab-links block text-lg transition duration-300 px-3 py-2 text-center"
              to="/services"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              className="nab-links block text-lg transition duration-300 px-3 py-2 text-center"
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
        <div className=" abouts absolute top-0 mt-55 left-0 w-full h-20 flex items-center justify-center bg-black bg-opacity-50">
          <h2 className="text-4xl md:text-6xl text-white font-bold">About Us</h2>
        </div>
      </div>

      {/* About Section */}
      <div className="content-section py-8 px-4 sm:px-8 mt-[10px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Student Registration */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Student Registration</h2>
            <p className="text-gray-600 mt-4">
              Easily register for bursary applications through our user-friendly system. 
              Create an account and start your journey toward financial assistance. 
              The digital process eliminates paperwork and streamlines registration, 
              allowing students to focus on their education without hassle.
            </p>
          </div>

          {/* Application Tracking */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Application Tracking</h2>
            <p className="text-gray-600 mt-4">
              Track your bursary application in real time with our transparent system. 
              Stay informed at every stage, from submission to approval, through timely 
              updates. No need to follow up manually — our platform keeps you in the loop.
            </p>
          </div>

          {/* Document Upload */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Document Upload</h2>
            <p className="text-gray-600 mt-4">
              Upload required documents securely and with ease. Our system supports multiple 
              file formats and ensures data confidentiality. Simplify submissions and manage 
              your application digitally, reducing the need for physical paperwork.
            </p>
          </div>

          {/* Allocation Notifications */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800">Allocation Notifications</h2>
            <p className="text-gray-600 mt-4">
              Get notified about bursary allocation and disbursement status. Our alerts 
              keep you informed at key milestones, helping you stay updated and plan 
              ahead with confidence. Notifications are sent directly to ensure transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        &copy; {new Date().getFullYear()} E-Bursary | Empowering Education in Turkana
      </footer>
    </div>
  );
};

export default AboutPage;