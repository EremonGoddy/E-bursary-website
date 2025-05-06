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
          src="/images/contact.jpg"
          alt="About Us"
          className="w-full object-cover h-[40vh] md:h-[65vh]"
        />
        <div className="abouts absolute top-0 mt-55 left-0 w-full h-20 flex items-center justify-center bg-black bg-opacity-50">
          <h2 className="text-4xl md:text-6xl text-white font-bold">Contact us</h2>
        </div>
      </div>

      {/* Services Section */}
      <div className="content-section py-6 px-4 sm:px-6 mt-[10px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Location */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg flex items-start gap-4">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 text-2xl" />
            <div>
              <h4 className="text-xl font-semibold text-gray-800">Location</h4>
              <p className="text-base text-gray-600 mt-2">
                Nawoitorong, Turkana County Headquarters<br />P.O Box 141-30500, Lodwar
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg flex items-start gap-4">
            <FontAwesomeIcon icon={faPhoneAlt} className="text-blue-500 text-2xl" />
            <div>
              <h4 className="text-xl font-semibold text-gray-800">Phone</h4>
              <p className="text-base text-gray-600 mt-2">+254707556732</p>
              <p className="text-base text-gray-600">+254707556732</p>
            </div>
          </div>

          {/* Email */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg flex items-start gap-4">
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 text-2xl" />
            <div>
              <h4 className="text-xl font-semibold text-gray-800">Email</h4>
              <p className="text-base text-gray-600 mt-2">eremon.godwin@gmail.com</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="contents mb-4 p-4 bg-transparent rounded-lg">
      
            <p className="text-base text-gray-600 mt-2">
            <h3 className="text-xl font-semibold text-gray-800">Contact Us</h3>
              Have questions or need assistance? We're here to help! Whether you’re seeking information,
              need support, or have feedback, feel free to reach out. Fill out the form below with your
              details and message, and our team will respond promptly.
              We look forward to connecting with you and addressing your needs effectively!
            </p>
          </div>

          {/* Message Form */}
          <div className="content mb-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Send us a Message</h2>
            <form className="p-4 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Message</label>
                <textarea
                  className="w-full px-4 py-2 h-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message here..."
                />
              </div>
              <button
                type="submit"
                className="contact-button w-full"
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