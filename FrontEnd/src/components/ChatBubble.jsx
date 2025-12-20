import React from 'react';
import { getAvatarUrl } from '../constants.js';

const ChatBubble = ({ message, isSender , }) => {
    if (!message || !message.sender) {
    console.warn("ChatBubble received an invalid message:", message);
    return null;
  }
  
  const time = new Date(message.createdAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex items-end max-w-xs md:max-w-md ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isSender && (
          <img 
            src={getAvatarUrl(message.sender.avatarId)} 
            alt={message.sender.name} 
            className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
          />
        )}
        <div className="flex flex-col">
          {!isSender && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 ml-2.5">
              {message.sender.name}
            </p>
          )}
          <div 
            className={`p-3 rounded-2xl ${
              isSender 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
            }`}
          >
            <p className="text-sm">{message.content || message.text}</p>
          </div>
          <p className={`text-xs text-gray-400 mt-1 ${isSender ? 'text-right mr-1' : 'text-left ml-1'}`}>
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;