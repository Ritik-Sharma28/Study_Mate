import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../../constants.js';
// --- FIX: Import apiGetUserById ---
import { apiGetPostsByUserId, apiGetUserById } from '../../services/apiService.js';
import { DmIcon } from '../Icons.jsx';

// --- FIX: Accept userId as a prop ---
const UserProfileView = ({ userId, onStartChat, onGoBack }) => {
  // --- FIX: Add state for the user object ---
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FIX: New Effect to fetch the user's profile ---
  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedUser = await apiGetUserById(userId);
        setUser(fetchedUser); // <--- THIS FIXES "domain bgera not showing"
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err.message);
      }
    };
    fetchUserProfile();
  }, [userId]);

  // --- FIX: Existing Effect now depends on 'user' ---
  useEffect(() => {
    // This effect will run *after* the one above finishes
    const fetchUserPosts = async () => {
      if (!user) return; // Wait until we have a user
      try {
        const userPosts = await apiGetPostsByUserId(user._id);
        setPosts(userPosts);
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
        // Don't overwrite the main profile error
      } finally {
        setIsLoading(false); // Loading is finished only after posts are fetched
      }
    };
    fetchUserPosts();
  }, [user]); // Depends on 'user' object

  // --- FIX: New Loading/Error state ---
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-800">
        <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-3">Loading Profile...</h2>
        </header>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    // Handle user not found or other errors
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-800">
        <header /* ... */ >
          <button onClick={onGoBack} /* ... */ >
            <svg /* ... */ />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-3">Error</h2>
        </header>
        <div className="flex-1 flex justify-center items-center">
          <p className="text-red-500">{error || 'User not found.'}</p>
        </div>
      </div>
    );
  }
  // --- END FIX ---


  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <button onClick={onGoBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-3">{user.name}'s Profile</h2>
      </header>

      {/* Main Content (now has full 'user' object) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <img src={getAvatarUrl(user.avatarId)} alt={user.name} className="w-32 h-32 rounded-full object-cover shadow-lg" />
              <div className="text-center mt-4">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
              </div>
              <button 
                onClick={() => onStartChat(user)} 
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <DmIcon />
                <span>Send Message</span>
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-left space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Interests & Style</h3>
                <div className="flex items-start">
                    <span className="font-semibold w-1pre/3 text-gray-700 dark:text-gray-300">Domains:</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                        {(user.domains || []).map(d => <span key={d} className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">{d}</span>)}
                    </div>
                </div>
                <p><span className="font-semibold text-gray-700 dark:text-gray-300">Learning:</span> <span className="text-gray-600 dark:text-gray-400">{user.learningStyle}</span></p>
                <p><span className="font-semibold text-gray-700 dark:text-gray-300">Studies:</span> <span className="text-gray-600 dark:text-gray-400">{user.studyTime}</span></p>
                <p><span className="font-semibold text-gray-700 dark:text-gray-300">Preference:</span> <span className="text-gray-600 dark:text-gray-400">{user.teamPref}</span></p>
            </div>
          </div>
          
          {/* RIGHT COLUMN */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}'s Posts</h2>
            
            <div className="space-y-4">
              {!posts && <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>}
              {posts && posts.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">This user hasn't created any posts yet.</p>
              )}
              
              {posts && posts.map(post => (
                <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex-1">{post.summary}</p>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfileView;