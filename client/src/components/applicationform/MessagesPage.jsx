import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MessagePage = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`https://e-bursary-backend.onrender.com/api/get-messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const senderRole = 'Committee'; // Or 'Student' depending on role
      const messageContent = newMessage;

      await axios.post('https://e-bursary-backend.onrender.com/api/send-message', {
        user_id: id,
        sender_role: senderRole,
        message_content: messageContent
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.message_id} className="border border-gray-300 rounded p-3">
                <div className="font-semibold text-gray-700">{msg.sender_role}</div>
                <div className="text-gray-800 mt-1">{msg.message_content}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(msg.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
