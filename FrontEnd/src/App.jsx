import React, { useState, useCallback, useEffect } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import MainAppScreen from './components/MainAppScreen.jsx';
import DmScreen from './components/DmScreen.jsx';
import ChatListView from './components/views/ChatListView.jsx'; 
import UserProfileView from './components/views/UserProfileView.jsx';// 1. Import new view
import { DEFAULT_USER } from './constants.js';
import { connectSocket, disconnectSocket } from './services/socketService.js';
import { apiLogout } from './services/apiService.js';

const App = () => {
  // 2. Add 'chatList' to the view states
  const [currentView, setCurrentView] = useState('auth'); 
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [chattingWith, setChattingWith] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  // 2. New state for which profile we are viewing
  const [viewingProfileId, setViewingProfileId] = useState(null);

  // --- 2. Manage Socket Connection Lifecycle ---
  useEffect(() => {
    if (loggedInUser) {
      connectSocket(); // Connect when user logs in
    }
    return () => {
      disconnectSocket(); // Disconnect on cleanup (e.g., logout)
    };
  }, [loggedInUser]);
  // --- END ---

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
  
  const handleLoginSuccess = useCallback((userData) => {
    setLoggedInUser(userData);
    setCurrentView('main');
  }, []);

// --- 2. UPDATE handleLogout ---
  const handleLogout = useCallback(async () => {
    try {
      await apiLogout(); // Call the backend to clear the cookie
    } catch (err) {
      console.error("Logout failed:", err); // Log error, but log out anyway
    } finally {
      // This runs whether the API call succeeds or fails
      setLoggedInUser(null);
      setCurrentView('auth');
      disconnectSocket(); 
    }
  }, []);
  // --- END UPDATE ---

  const handleProfileUpdate = (newUserData) => {
    setLoggedInUser(newUserData);
  };

  const handleStartChat = useCallback((user) => { 
    setChattingWith(user); 
    setCurrentView('dm'); 
  }, []);
 const handleShowChats = useCallback(() => {
    setCurrentView('chatList');
  }, []);

  const handleViewProfile = useCallback((userId) => {
    setViewingProfileId(userId); // Set the ID to view
    setCurrentView('userProfile'); // Change the page
  }, []);

  const handleGoBackFromDm = useCallback(() => {
    // If we entered DM from a profile, go back to profile
    if (viewingProfileId) { // Check ID
      setCurrentView('userProfile');
    } else {
      setCurrentView('chatList');
    }
  }, [viewingProfileId]); // Depend on ID

  const handleGoBackFromChats = useCallback(() => {
    setCurrentView('main');
  }, []);
// --- FIX: Clear the ID ---
  const handleGoBackFromProfile = useCallback(() => {
    setCurrentView('main');
    setViewingProfileId(null); // Clear the ID
  }, []);
  // --- END NAVIGATION ---

  const renderView = () => {
    switch (currentView) {
      case 'main': 
        return <MainAppScreen 
                  user={loggedInUser} 
                  onStartChat={handleStartChat} 
                  onLogout={handleLogout} 
                  theme={theme} 
                  toggleTheme={toggleTheme}
                  onProfileUpdate={handleProfileUpdate}
                  onShowChats={handleShowChats} // 4. Pass handler down
                  onViewProfile={handleViewProfile}
                />;
      case 'chatList': // 5. Add new case
        return <ChatListView 
                  onStartChat={handleStartChat}
                  onGoBack={handleGoBackFromChats}
                />;
                // 5. New Case for User Profile
      case 'userProfile':
        return <UserProfileView
                  userId={viewingProfileId}
                  onStartChat={handleStartChat}
                  onGoBack={handleGoBackFromProfile}
                />;
      case 'dm': 
        return <DmScreen 
                  user={chattingWith} 
                  onGoBack={handleGoBackFromDm} 
                  currentUser={loggedInUser}
                />;
  
      case 'auth': 
      default: 
        return <AuthScreen 
                  onLoginSuccess={handleLoginSuccess} 
                  theme={theme} 
                  toggleTheme={toggleTheme} 
                />;
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