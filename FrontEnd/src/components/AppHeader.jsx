// src/components/AppHeader.jsx

import React, { useState, useEffect, useRef } from 'react';
import { SunIcon, MoonIcon, ChatIcon, SearchIcon } from './Icons.jsx';
import { apiSearchUsers } from '../services/apiService.js';
import { getAvatarUrl } from '../constants.js';

const AppHeader = ({ title, theme, toggleTheme, onShowChats, showSearch, onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // NEW: State to handle mobile search expansion
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const searchRef = useRef(null);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const users = await apiSearchUsers(query);
          setResults(users);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (userId) => {
    onViewProfile(userId);
    setShowDropdown(false);
    setQuery('');
    setIsMobileSearchOpen(false); // Close mobile search after selection
  };

  // Helper to close search mode on mobile
  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm z-20 relative h-16">
      
      {/* TITLE: Hidden on mobile ONLY when search is active to make space */}
      <h1 className={`text-2xl font-bold text-gray-800 dark:text-white capitalize transition-all duration-200 ${isMobileSearchOpen ? 'hidden md:block' : 'block'}`}>
        {title}
      </h1>

      {/* RIGHT SIDE CONTAINER */}
      <div className={`flex items-center ${isMobileSearchOpen ? 'flex-1 w-full' : 'space-x-3'}`}>
        
        {/* --- SEARCH SECTION --- */}
        {showSearch && (
          <>
            {/* 1. Mobile Search Trigger Icon (Visible only on mobile & when search is closed) */}
            {!isMobileSearchOpen && (
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                <SearchIcon />
              </button>
            )}

            {/* 2. The Search Bar (Expandable) */}
            <div 
              ref={searchRef}
              className={`
                transition-all duration-200 ease-in-out relative
                ${isMobileSearchOpen 
                   ? 'flex flex-1 mr-3' // Mobile Open: Flex to take available space
                   : 'hidden md:flex md:w-64' // Mobile Closed: Hidden. Desktop: Fixed width
                }
              `}
            >
              <div className="flex items-center w-full bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-2 border border-transparent focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-900">
                
                {/* Back Button (Mobile Only) or Search Icon (Desktop) */}
                {isMobileSearchOpen ? (
                  <button onClick={closeMobileSearch} className="mr-2 text-gray-500 dark:text-gray-400 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex-shrink-0 text-gray-400 mr-2">
                    <SearchIcon />
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Search users..."
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 flex-1 placeholder-gray-400 w-full min-w-0"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if(results.length > 0) setShowDropdown(true) }}
                  autoFocus={isMobileSearchOpen} // Auto focus when opening on mobile
                />
                {isSearching && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2 flex-shrink-0"></div>}
              </div>

              {/* Dropdown Results */}
              {showDropdown && results.length > 0 && (
                <div className="absolute top-full mt-2 right-0 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="py-1">
                    {results.map(user => (
                      <button
                        key={user._id}
                        onClick={() => handleUserClick(user._id)}
                        className="flex items-center w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <img 
                          src={getAvatarUrl(user.avatarId)} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" 
                        />
                        <span className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {user.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Results Message */}
              {showDropdown && query.length > 0 && !isSearching && results.length === 0 && (
                 <div className="absolute top-full mt-2 right-0 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 text-center z-50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No users found.</p>
                 </div>
             )}
            </div>
          </>
        )}

        {/* --- ACTION BUTTONS --- */}
        {/* Wrapped in a div that prevents shrinking so they are never crushed */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <button
            onClick={onShowChats}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ChatIcon />
          </button>
        </div>

      </div>
    </header>
  );
};

export default AppHeader;