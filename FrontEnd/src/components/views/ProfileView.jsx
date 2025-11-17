import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../../constants.js';
import { apiGetMyPosts, apiDeletePost } from '../../services/apiService.js';
import MyPostCard from './MyPostCard.jsx'; // We'll keep using this, but it's redesigned
import EditProfileModal from '../EditProfileModal.jsx';
import Modal from '../Modal.jsx';

// 1. Remove 'onGetAdvice' from props
const ProfileView = ({ user, onLogout, onProfileUpdate, onOpenPostModal }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setIsLoading(true);
        const posts = await apiGetMyPosts();
        setMyPosts(posts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPosts();
  }, []); // Runs once on load

  const openDeleteModal = (postId) => {
    setPostToDelete(postId);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await apiDeletePost(postToDelete);
      setMyPosts(prev => prev.filter(p => p._id !== postToDelete));
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleEditProfileSubmit = async (profileData) => {
    await onProfileUpdate(profileData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- LEFT COLUMN --- */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* ... (img, name, email, edit profile button) ... */}
            <img src={getAvatarUrl(user.avatarId)} alt="User Avatar" className="w-32 h-32 rounded-full object-cover shadow-lg" />
            <div className="text-center mt-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)} 
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
            >
              Edit Profile
            </button>
          </div>
          
          {/* About Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-left space-y-4">
            {/* ... (Domains, Learning Style, etc.) ... */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">About Me</h3>
              <div className="flex items-start">
                  <span className="font-semibold w-1/3 text-gray-700 dark:text-gray-300">Domains:</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                      {(user.domains || []).map(d => <span key={d} className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">{d}</span>)}
                  </div>
              </div>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Learning Style:</span> <span className="text-gray-600 dark:text-gray-400">{user.learningStyle}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Study Time:</span> <span className="text-gray-600 dark:text-gray-400">{user.studyTime}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Preference:</span> <span className="text-gray-600 dark:text-gray-400">{user.teamPref}</span></p>
          </div>

          {/* 2. REMOVED AI ADVICE BUTTON */}
          <button onClick={onLogout} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">Logout</button>
        </div>
        
        {/* --- RIGHT COLUMN --- */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Posts</h2>
          {isLoading && <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          
          {/* 3. Updated grid layout to look better */}
          <div className="grid grid-cols-1 gap-6">
            {!isLoading && !error && myPosts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">You haven't created any posts yet.</p>
            )}

            {!isLoading && !error && myPosts.map(post => (
              <MyPostCard 
                key={post._id} 
                post={post} 
                onEdit={() => onOpenPostModal(post)}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* --- MODALS --- */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdate={handleEditProfileSubmit}
      />
      
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
        {/* ... (Delete confirmation content) ... */}
        <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end gap-x-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium">
                    Cancel
                </button>
                <button onClick={confirmDeletePost} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium">
                    Delete
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileView;