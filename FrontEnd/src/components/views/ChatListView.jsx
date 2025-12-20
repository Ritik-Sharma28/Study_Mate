import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../../constants.js';
import { apiGetMyChats } from '../../services/apiService.js';
import { SearchIcon } from '../Icons.jsx';


const formatLastMessageTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const msgDate = new Date(date);
  
  const isToday = now.toDateString() === msgDate.toDateString();
  if (isToday) {
    return msgDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
  
  return msgDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

const ChatListView = ({ onStartChat, onGoBack }) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiGetMyChats()
      .then(setChats)
      .catch(err => console.error("Failed to fetch chat list", err))
      .finally(() => setIsLoading(false));
  }, []);

  
  const filteredChats = chats.filter(chat => {
    
    if (chat.roomType !== 'dm') return false;

    
    const name = chat.displayUser?.name;
    return name ? name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-800">
      {}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-3">All Chats</h2>
      </header>
      
      {}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-12 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {}
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {filteredChats.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 p-6">
                No conversations found.
              </p>
            )}
            {filteredChats.map(chat => {
              
              return (
                <div 
                  key={chat.roomId} 
                  onClick={() => onStartChat(chat.displayUser, 'dm')} 
                  className="flex items-center p-3 mx-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <img src={getAvatarUrl(chat.displayUser.avatarId)} alt={chat.displayUser.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="ml-4 flex-1 overflow-hidden">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{chat.displayUser.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {chat.lastMessage?.sender?.name}: {chat.lastMessage?.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    {formatLastMessageTime(chat.lastMessage?.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatListView;