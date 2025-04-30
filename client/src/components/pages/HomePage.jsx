import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";

const HomePage = () => {
  const images = [
    "/images/arrangement-education-growth-concept.jpg",
    "/images/homepic.jpg",
    "/images/homephoto.jpg",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

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
              className="text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 rounded"
              to="/"
            >
              Home
            </Link>
            <Link
              className="text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 rounded"
              to="/about"
            >
              About
            </Link>
            <Link
              className="text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 rounded"
              to="/services"
            >
              Services
            </Link>
            <Link
              className="text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 rounded"
              to="/contact"
            >
              Contact
            </Link>
          </div>
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={faBars} className="text-gray-700 text-2xl" />
          </button>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="navbar-collapse bg-white p-4 w-[95%] rounded-lg transition-transform ease-in duration-100 shadow-md z-20 absolute top-[70px] left-1/2 transform -translate-x-1/2">
            <Link
              className="block text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 text-center"
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              className="block text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 text-center"
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              className="block text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 text-center"
              to="/services"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              className="block text-lg text-gray-700 hover:text-blue-500 transition duration-300 hover:bg-gray-200 px-3 py-2 text-center"
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </nav>

      {/* Image Slider */}
      <div id="carouselExample" className="relative mt-[60px]">
        <div className="carousel-inner">
          {images.map((image, index) => (
            <div
              className={`carousel-item ${
                index === currentImageIndex ? "block" : "hidden"
              }`}
              key={index}
            >
              <img
                src={image}
                className="w-full object-cover h-[40vh] md:h-[65vh]"
                alt="Bursary program"
              />
              <div className="empowering absolute bottom-0 left-0 w-full h-[80px] flex justify-center items-center">
                <h2 className="text-2xl md:text-4xl text-white mt-[10px]">
                  Empowering Education in Turkana Through Bursaries: Your Path to Success
                </h2>
              </div>
              {/* Centered Button */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <button
                  className="getting-started"
                  onClick={() => (window.location.href = "/getting-started")}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section py-8 sm:px-0 px-4 mt-[60px]">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Program Overview */}
          <div className="mb-8 p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Overview of the Bursary Program
            </h2>
            <p className="text-gray-600 mt-4">
              The Turkana County Bursary Program is designed to support deserving students from Turkana County in their pursuit of higher education. The program aims to alleviate financial barriers and empower talented individuals to achieve their academic goals. Eligible candidates will receive financial assistance to cover tuition fees, textbooks, and other educational expenses.
            </p>
          </div>

          {/* Key Dates */}
          <div className="mb-8 p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800">Key Dates</h2>
            <ul className="list-disc pl-5 mt-4">
              <li className="text-gray-600">📅 Application Open: <strong>12/3/2024</strong></li>
              <li className="text-gray-600">📅 Deadline: <strong>25/3/2024</strong></li>
              <li className="text-gray-600">📢 Recipients Announced: <strong>2/4/2024</strong></li>
              <li className="text-gray-600">💰 Disbursement: <strong>12/4/2024</strong></li>
            </ul>
          </div>

          {/* Important Announcement */}
          <div className="mb-8 p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Important Announcement
            </h2>
            <p className="text-gray-600 mt-4">
              We are pleased to announce that the application period for the Turkana County Bursary Program is now open. All interested candidates are encouraged to submit their applications before the deadline to be considered for financial assistance. Additionally, please note that this year, we have expanded the eligibility criteria to include students pursuing vocational and technical courses.
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

export default HomePage;