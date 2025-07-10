import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const StatusMessagePage = () => {
  const { userId } = useParams();  // ✅ Match the backend param name
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchStatusMessage = async () => {
      try {
        const response = await axios.get(`https://e-bursary-backend.onrender.com/api/status-message/user/${userId}`);
        setStatusMessage(response.data.status_message);
      } catch (error) {
        console.error('Error fetching status message:', error);
        setStatusMessage('No status message available.');
      }
    };

    fetchStatusMessage();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Application Status Message</h2>
        <p className="text-lg text-gray-800">
          {statusMessage ? statusMessage : 'No status message available.'}
        </p>
      </div>
    </div>
  );
};

export default StatusMessagePage;
