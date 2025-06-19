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

/**
 * @param {object} props
 * @param {number} props.currentStep - the current step (0-based)
 * @param {number[]} [props.completedSteps] - optional, array of completed step indexes
 *
 * Usage:
 * <ProgressStepper currentStep={2} completedSteps={[0,1]} />
 * - currentStep: the index of the step the user is currently on
 * - completedSteps: array of indexes for completed steps (for more accurate state)
 */
const ProgressStepper = ({ currentStep, completedSteps = [] }) => (
  <div className="flex items-center justify-center mb-6 mt-1 w-full max-w-8xl mx-auto"> {/* max-w-7xl for more stretch */}
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
          <div className="flex flex-col items-center min-w-[100px]"> {/* min-w-[100px] increases icon/step spacing */}
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
              "flex-1 h-1.5 mx-4 rounded transition-colors duration-300 " + // h-2 = thicker, mx-4 = wider gap, flex-1 for long lines
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

export default ProgressStepper;