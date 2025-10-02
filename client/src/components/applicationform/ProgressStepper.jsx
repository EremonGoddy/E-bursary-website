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
<div className="flex items-center justify-start md:justify-center -ml-2 md:ml-0 mb-6 -mt-8 md:-mt-5 md:w-full w-full mx-1 md:mx-auto">
{steps.map((step, idx) => {
const isCompleted = completedSteps.includes(idx) || idx < currentStep;
const isActive = idx === currentStep;
const iconColorClass = isCompleted || isActive ? "text-white" : step.color;
let bgColor = "bg-gray-200";
if (isCompleted) bgColor = "bg-green-500";
else if (isActive) bgColor = "bg-blue-600";

return (
<React.Fragment key={step.label}>
<div className="flex flex-col items-center">
<div className={`rounded-full w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-sm md:text-xl ${bgColor}`}>
<FontAwesomeIcon icon={step.icon} className={iconColorClass} />
</div>
<span className={`text-xs md:text-sm mt-1 text-center w-10 md:w-20 ${
isActive ? 'font-semibold text-blue-700'
: isCompleted ? 'text-green-600'
: 'text-gray-400'
}`}>
{step.label}
</span>
</div>

{/* Add connector line between steps */}
{idx !== steps.length - 1 && (
<div className="flex-1 h-1 bg-gray-200 md:mx-2 mx-1 relative -mt-8">
<div className={`h-full transition-colors duration-300 ${
isCompleted
? "bg-green-500"
: isActive
? "bg-blue-500"
: "bg-gray-200"
}`} />
</div>
)}
</React.Fragment>
);
})}

</div>
);
};

export default ProgressStepper;