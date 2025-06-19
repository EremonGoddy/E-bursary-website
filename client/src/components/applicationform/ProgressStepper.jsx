import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUsers,
  faExclamationTriangle,
  faPaperclip,
  faCoins
} from '@fortawesome/free-solid-svg-icons';

const steps = [
  { label: "Personal Details", icon: faUser, path: "/personaldetails", color: "text-blue-600" },
  { label: "Amount Details", icon: faCoins, path: "/amountdetails", color: "text-yellow-500" },
  { label: "Family Details", icon: faUsers, path: "/familydetails", color: "text-pink-600" },
  { label: "Disclosure Details", icon: faExclamationTriangle, path: "/disclosuredetails", color: "text-red-500" },
  { label: "Upload Documents", icon: faPaperclip, path: "/documentupload", color: "text-green-600" }
];

const ProgressStepper = ({ currentStep }) => (
  <div className="flex items-center justify-center mb-6 mt-1">
    {steps.map((step, idx) => {
      const isActive = idx === currentStep;
      const isCompleted = idx < currentStep;
      // Decide icon color: use .text-white for completed or active, else use step.color
      const iconColorClass =
        isCompleted || isActive ? "text-white" : step.color;

      return (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center">
            <div className={`
              rounded-full w-11 h-11 flex items-center justify-center text-2xl
              ${isCompleted ? "bg-green-500" : isActive ? "bg-blue-600" : "bg-gray-200"}
            `}>
              <FontAwesomeIcon icon={step.icon} className={iconColorClass} />
            </div>
            <span className={`text-xs mt-2 ${isActive ? 'font-semibold text-blue-700' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {idx !== steps.length - 1 && (
            <div className={`flex-1 h-1 mx-2 ${idx < currentStep ? "bg-green-500" : "bg-gray-200"}`}></div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default ProgressStepper;