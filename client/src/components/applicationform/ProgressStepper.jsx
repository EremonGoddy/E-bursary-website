import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUsers,
  faExclamationTriangle,
  faPaperclip,
  faCoins
} from '@fortawesome/free-solid-svg-icons';

// Step configuration
const steps = [
  { label: "Personal Details", icon: faUser, path: "/personaldetails", color: "text-blue-600" },
  { label: "Amount Details", icon: faCoins, path: "/amountdetails", color: "text-yellow-500" },
  { label: "Family Details", icon: faUsers, path: "/familydetails", color: "text-pink-600" },
  { label: "Disclosure Details", icon: faExclamationTriangle, path: "/disclosuredetails", color: "text-red-500" },
  { label: "Upload Documents", icon: faPaperclip, path: "/documentupload", color: "text-green-600" }
];

/**
 * ProgressStepper
 * Fetches user progress from backend and displays the application stepper.
 */
const ProgressStepper = () => {
  const [progress, setProgress] = useState({ currentStep: 0, completedSteps: [] });

  useEffect(() => {
    // Get the current user's userId from session storage (must be set on login)
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      axios
        .get(`https://e-bursary-backend.onrender.com/api/application-progress/${userId}`)
        .then(res => {
          setProgress({
            currentStep: res.data.currentStep,
            completedSteps: res.data.completedSteps
          });
        })
        .catch(() => {
          setProgress({ currentStep: 0, completedSteps: [] });
        });
    }
  }, []);

  const { currentStep, completedSteps } = progress;

  return (
    <div className="flex items-center justify-center mb-6 mt-1 w-full max-w-8xl mx-auto">
      {steps.map((step, idx) => {
        // Consider step completed if in completedSteps or before currentStep
        const isCompleted = completedSteps.includes(idx) || idx < currentStep;
        const isActive = idx === currentStep;

        // Icon color: white for completed or active, else the color in the step
        const iconColorClass = isCompleted || isActive ? "text-white" : step.color;

        // Step circle background
        let bgColor = "bg-gray-200";
        if (isCompleted) bgColor = "bg-green-500";
        else if (isActive) bgColor = "bg-blue-600";

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center min-w-[100px]">
              <div className={`rounded-full w-11 h-11 flex items-center justify-center text-2xl ${bgColor} transition-colors duration-300`}>
                <FontAwesomeIcon icon={step.icon} className={iconColorClass} />
              </div>
              <span className={`text-sm mt-2 text-center w-28 break-words ${
                isActive ? 'font-semibold text-blue-700'
                  : isCompleted ? 'text-green-600'
                  : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {idx !== steps.length - 1 && (
              <div className={
                "flex-1 h-1.5 mx-4 rounded transition-colors duration-300 " +
                (isCompleted
                  ? "bg-green-500"
                  : isActive
                    ? "bg-blue-500"
                    : "bg-gray-200")
              } />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressStepper;