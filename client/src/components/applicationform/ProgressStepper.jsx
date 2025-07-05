import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCoins,
  faUsers,
  faExclamationTriangle,
  faPaperclip
} from '@fortawesome/free-solid-svg-icons';

// Step configuration (fixed order)
const steps = [
  { label: "Personal Details", icon: faUser, path: "/personaldetails" },
  { label: "Amount Details", icon: faCoins, path: "/amountdetails" },
  { label: "Family Details", icon: faUsers, path: "/familydetails" },
  { label: "Disclosure Details", icon: faExclamationTriangle, path: "/disclosuredetails" },
  { label: "Upload Documents", icon: faPaperclip, path: "/documentupload" }
];

const ProgressStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    axios.get(`https://e-bursary-backend.onrender.com/api/application-status/${userId}`)
      .then(res => {
        const data = res.data;

        let step = 0;
        if (data.personal_details) step = 1;
        if (data.amount_details) step = 2;
        if (data.family_details) step = 3;
        if (data.disclosure_details) step = 4;
        if (
          data.personal_details &&
          data.amount_details &&
          data.family_details &&
          data.disclosure_details
        ) step = 5;

        setCurrentStep(step);
      })
      .catch(err => {
        console.error(err);
        setCurrentStep(0);
      });
  }, []);

  return (
    <div className="flex items-center justify-center mb-6 mt-1 w-full max-w-6xl mx-auto">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        const bgColor = isCompleted ? "bg-green-500" : isActive ? "bg-blue-600" : "bg-gray-200";
        const iconColor = isCompleted || isActive ? "text-white" : "text-gray-500";

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center min-w-[90px]">
              <div className={`rounded-full w-10 h-10 flex items-center justify-center text-xl ${bgColor}`}>
                <FontAwesomeIcon icon={step.icon} className={iconColor} />
              </div>
              <span className={`text-[0.75rem] mt-2 text-center w-24 ${isActive ? 'text-blue-700 font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {idx !== steps.length - 1 && (
              <div className={`flex-1 h-1.5 mx-2 rounded ${idx < currentStep - 1 ? 'bg-green-500' : idx === currentStep - 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
