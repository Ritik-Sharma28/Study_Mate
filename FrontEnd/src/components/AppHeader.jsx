// src/components/AppHeader.jsx

import React from 'react';
import { SunIcon, MoonIcon , ChatIcon } from './Icons.jsx';

// 2. Accept onShowChats prop
const AppHeader = ({ title, theme, toggleTheme, onShowChats }) => (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">{title}</h1>
        
        {/* 3. Add container for buttons */}
        <div className="flex items-center space-x-3">
 
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
                       <button 
              onClick={onShowChats} // 4. Add onClick
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-300"
            >
                <ChatIcon />
            </button>
        </div>
    </header>
);

export default AppHeader;

