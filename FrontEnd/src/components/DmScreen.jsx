import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl } from '../constants.js';
import { 
  joinRoom, 
  leaveRoom, 
  sendMessage, 
  onMessageReceived, 
  offMessageReceived 
} from '../services/socketService.js';
import { apiGetDmMessages } from '../services/apiService.js';
import ChatBubble from './ChatBubble.jsx';

const DmScreen = ({ user, onGoBack, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Calculate Room ID, Join Socket Room, and Fetch History
  useEffect(() => {
    if (!currentUser || !user) return;
    setIsLoading(true); // Start loading

    const newRoomId = [currentUser._id, user._id].sort().join('__');
    setRoomId(newRoomId);
    joinRoom(newRoomId);

    apiGetDmMessages(newRoomId)
      .then(history => {
        setMessages(history);
      })
      .catch(err => console.error("Failed to load history", err))
      .finally(() => setIsLoading(false));

    return () => {
      leaveRoom(newRoomId);
    };
  }, [currentUser, user]);

  // 2. Listen for new messages
  useEffect(() => {
    onMessageReceived((messageData) => {
      if (messageData.dmRoom === roomId) {
        setMessages(prev => [...prev, messageData]);
      }
    });

    return () => {
      offMessageReceived();
    };
  }, [roomId]); 

  // 3. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Handle sending a message
  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    // --- THIS IS THE FIX ---
    // Create message with 'sender' property to match DB
    const ownMessageData = {
      _id: new Date().getTime(),
      text: newMessage, // ChatBubble will read this as message.text
      createdAt: new Date(),
      dmRoom: roomId,
      sender: { // Use 'sender' instead of 'user'
        _id: currentUser._id,
        name: currentUser.name,
        avatarId: currentUser.avatarId,
      },
    };
    // --- END FIX ---
    
    setMessages(prev => [...prev, ownMessageData]);
    sendMessage(roomId, newMessage, false); 
    setNewMessage('');
  };
  
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-800">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img src={getAvatarUrl(user.avatarId)} alt={user.name} className="w-10 h-10 rounded-full object-cover ml-4" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-3">{user.name}</h2>
      </header>
      
      {/* Chat Messages */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatBubble 
                key={msg._id} 
                message={msg} 
                // --- THIS IS THE FIX ---
                // The DB record has 'sender', not 'user'
                isSender={msg.sender._id === currentUser._id} 
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>
      
      {/* Footer / Input */}
      <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex items-center">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-full outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700" 
            />
            <button type="submit" className="ml-3 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
        </form>
      </footer>
    </div>
  );
};

export default DmScreen;