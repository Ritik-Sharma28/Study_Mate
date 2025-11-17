import React, { useState, useCallback, useEffect } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import MainAppScreen from './components/MainAppScreen.jsx';
import DmScreen from './components/DmScreen.jsx';
import { DEFAULT_USER } from './constants.js'; // We still need this for the *old* App.jsx file

const App = () => {
  const [currentView, setCurrentView] = useState('auth');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [chattingWith, setChattingWith] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  
  // --- MODIFIED THIS FUNCTION ---
  // It no longer needs to check for 'DemoUser'
  const handleLoginSuccess = useCallback((userData) => {
    setLoggedInUser(userData); // Just set the user data from the API
    setCurrentView('main');
  }, []);
  // --- END MODIFICATION ---

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    setCurrentView('auth');
    // We should also call a logout API endpoint here
    // but we can add that later.
  }, []);

  const handleStartChat = useCallback((user) => { setChattingWith(user); setCurrentView('dm'); }, []);
  const handleGoBack = useCallback(() => { setCurrentView('main'); setChattingWith(null); }, []);

  const renderView = () => {
    switch (currentView) {
      case 'main': return <MainAppScreen user={loggedInUser} onStartChat={handleStartChat} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
      case 'dm': return <DmScreen user={chattingWith} onGoBack={handleGoBack} />;
      case 'auth': default: 
        /* --- MODIFIED THIS LINE --- */
        return <AuthScreen onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
        /* --- END MODIFICATION --- */
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center p-0 md:p-4">
      <div className="w-full h-full md:w-11/12 md:max-w-6xl md:h-[95vh] md:max-h-[1000px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col md:rounded-3xl overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}

export default App;