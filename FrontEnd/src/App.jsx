import React, { useState, useCallback, useEffect } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import MainAppScreen from './components/MainAppScreen.jsx';
import DmScreen from './components/DmScreen.jsx';
import ChatListView from './components/views/ChatListView.jsx';
import UserProfileView from './components/views/UserProfileView.jsx';
import ForgotPasswordView from './components/views/ForgotPasswordView.jsx';
import ResetPasswordView from './components/views/ResetPasswordView.jsx';
import { connectSocket, disconnectSocket } from './services/socketService.js';
import { apiLogout, apiGetProfile } from './services/apiService.js';
import LoadingScreen from './components/LoadingScreen.jsx';

const App = () => {

  const [currentView, setCurrentView] = useState('auth');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [chattingWith, setChattingWith] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const [viewingProfileId, setViewingProfileId] = useState(null);

  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await apiGetProfile();
        setLoggedInUser(user);
        setCurrentView('main');
      } catch (err) {
        console.log("Not logged in or session expired");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/resetpassword/')) {
      const token = path.split('/')[2];
      if (token) {
        setResetToken(token);
        setCurrentView('resetPassword');
      }
    }
  }, []);


  useEffect(() => {
    if (loggedInUser) {
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [loggedInUser]);


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


  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {

      setLoggedInUser(null);
      setCurrentView('auth');
      disconnectSocket();
    }
  }, []);


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
    setViewingProfileId(userId);
    setCurrentView('userProfile');
  }, []);

  const handleGoBackFromDm = useCallback(() => {

    if (viewingProfileId) {
      setCurrentView('userProfile');
    } else {
      setCurrentView('chatList');
    }
  }, [viewingProfileId]);

  const handleGoBackFromChats = useCallback(() => {
    setCurrentView('main');
  }, []);

  const handleGoBackFromProfile = useCallback(() => {
    setCurrentView('main');
    setViewingProfileId(null);
  }, []);


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
          onShowChats={handleShowChats}
          onViewProfile={handleViewProfile}
        />;
      case 'chatList':
        return <ChatListView
          onStartChat={handleStartChat}
          onGoBack={handleGoBackFromChats}
        />;

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

      case 'forgotPassword':
        return <ForgotPasswordView onGoBack={() => setCurrentView('auth')} />;

      case 'resetPassword':
        return <ResetPasswordView token={resetToken} onResetSuccess={() => setCurrentView('auth')} />;

      case 'auth':
      default:
        return <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
          toggleTheme={toggleTheme}
          onForgotPassword={() => setCurrentView('forgotPassword')}
        />;
    }
  };

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-full flex justify-center items-center p-0 md:p-4">
      <div className="w-full h-full md:w-11/12 md:max-w-6xl md:h-[95vh] md:max-h-[1000px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col md:rounded-3xl overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
}

export default App;