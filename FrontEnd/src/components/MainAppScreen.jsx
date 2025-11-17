import React, { useState, useCallback, useEffect } from 'react';
import {
  apiGetPosts,
  apiCreatePost,
  apiLikePost,
  apiUpdatePost,
  apiUpdateUserProfile,
} from '../services/apiService.js';
import Modal from './Modal.jsx';
import AppHeader from './AppHeader.jsx';
import TabBar from './TabBar.jsx';
import CommunityView from './views/CommunityView.jsx';
import PostsView from './views/PostsView.jsx';
import FindPartnerView from './views/FindPartnerView.jsx';
import ProfileView from './views/ProfileView.jsx';

// --- Character Limits ---
const TITLE_MAX_LENGTH = 100;
const SUMMARY_MAX_LENGTH = 280;
const CONTENT_MAX_LENGTH = 5000;
const TAGS_MAX_LENGTH = 100;

const MainAppScreen = ({ user, onStartChat, onLogout, theme, toggleTheme, onProfileUpdate, onShowChats, onViewProfile }) => {
  const [activeTab, setActiveTab] = useState('community');
  
  // State for Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // State for Post Modal (Create/Edit)
  const [postToEdit, setPostToEdit] = useState(null);
  const [postModalData, setPostModalData] = useState({ title: '', summary: '', content: '', tags: '' });
  
  // State for Posts Feed
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);

  // State for Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  // Effect to clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => { setToastMessage(''); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch Posts on component load or user change
  useEffect(() => {
    if (user) {
      setIsLoadingPosts(true);
      apiGetPosts()
        .then(fetchedPosts => {
          setPosts(fetchedPosts);
          setPostsError(null);
        })
        .catch(err => {
          setPostsError(err.message);
        })
        .finally(() => {
          setIsLoadingPosts(false);
        });
    }
  }, [user]);

  // --- Handlers ---

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  const confirmLogout = () => {
    closeLogoutModal();
    onLogout();
  };

  // --- Post Modal Handlers (Create & Edit) ---

  const handleOpenPostModal = (post = null) => {
    if (post && post._id) {
      // We are EDITING
      setPostToEdit(post);
      setPostModalData({
        title: post.title,
        summary: post.summary,
        content: post.content,
        tags: (post.tags || []).join(', '), // Convert array to string
      });
    } else {
      // We are CREATING
      setPostToEdit(null);
      setPostModalData({ title: '', summary: '', content: '', tags: '' });
    }
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setPostToEdit(null);
    setPostModalData({ title: '', summary: '', content: '', tags: '' });
  };

  const handlePostInputChange = (e) => {
    const { name, value } = e.target;

    // Enforce limits
    if (name === 'title' && value.length > TITLE_MAX_LENGTH) return;
    if (name === 'summary' && value.length > SUMMARY_MAX_LENGTH) return;
    if (name === 'content' && value.length > CONTENT_MAX_LENGTH) return;
    if (name === 'tags' && value.length > TAGS_MAX_LENGTH) return;

    setPostModalData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const tagsArray = postModalData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const postData = {
      title: postModalData.title,
      summary: postModalData.summary,
      content: postModalData.content,
      tags: tagsArray,
    };

    try {
      if (postToEdit) {
        // --- EDIT LOGIC ---
        const updatedPost = await apiUpdatePost(postToEdit._id, postData);
        // Add author back in, since updatePost response doesn't populate it
        const postWithAuthor = { ...updatedPost, author: postToEdit.author };
        setPosts(prev => prev.map(p => (p._id === postToEdit._id ? postWithAuthor : p)));
      } else {
        // --- CREATE LOGIC ---
        const createdPost = await apiCreatePost(postData);
        // Manually add author to new post to fix name bug
        const postWithAuthor = { ...createdPost, author: { name: user.name, avatarId: user.avatarId, _id: user._id } };
        setPosts([postWithAuthor, ...posts]);
      }
      handleClosePostModal();
    } catch (error) {
      console.error("Failed to submit post:", error);
      // We could set an error state inside the modal here
    }
  };

  // --- Like Handler (Optimistic) ---

  const handleLikePost = async (postId) => {
    const currentPost = posts.find(p => p._id === postId);
    if (!currentPost) return;

    const originalPosts = [...posts]; // For rollback
    const isLiked = currentPost.likes.includes(user._id);
    const optimisticLikes = isLiked
      ? currentPost.likes.filter(id => id !== user._id) // Unlike
      : [...currentPost.likes, user._id]; // Like

    const optimisticPost = { ...currentPost, likes: optimisticLikes };

    // Update UI immediately
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? optimisticPost : post
      )
    );

    // Call API in background
    try {
      await apiLikePost(postId);
    } catch (error) {
      // Rollback on failure
      console.error("Failed to like post, rolling back UI.", error);
      setPosts(originalPosts);
    }
  };
  
  // --- Profile Update Handler ---

  const handleProfileUpdateSubmit = async (profileData) => {
    try {
      const updatedUser = await apiUpdateUserProfile(profileData);
      onProfileUpdate(updatedUser); // This calls setLoggedInUser in App.jsx
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error; // Re-throw error so the modal can display it
    }
  };

  // --- Render Logic ---

  const tabTitle = activeTab === 'findPartner' ? 'Find Partner' : activeTab;

  const renderContent = () => {
    switch (activeTab) {
      case 'posts': 
        return <PostsView 
                  onOpenPostModal={handleOpenPostModal}
                  posts={posts}
                  isLoading={isLoadingPosts}
                  error={postsError} 
                  user={user}
                  onLikePost={handleLikePost}
                  setToastMessage={setToastMessage}
                  onViewProfile={onViewProfile}
                />;
      case 'findPartner': 
        return <FindPartnerView 
                  onStartChat={onStartChat} 
                  onViewProfile={onViewProfile}
                />;
      case 'profile': 
        return <ProfileView 
                  user={user} 
                  onLogout={openLogoutModal}
                  onProfileUpdate={handleProfileUpdateSubmit}
                  onOpenPostModal={handleOpenPostModal} // For editing posts
                />;
      case 'community': 
      default: 
        return <CommunityView 
                  onStartChat={onStartChat} 
                  onViewProfile={onViewProfile}
                />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <AppHeader 
        title={tabTitle} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onShowChats={onShowChats}
      />
      
      {/* This main tag now has no padding, letting children control width */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
      
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* AI Study Advice Modal has been REMOVED */}

      {/* New Post / Edit Post Modal */}
      <Modal isOpen={isPostModalOpen} onClose={handleClosePostModal} title={postToEdit ? "Edit Your Post" : "Create a New Post"}>
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {postModalData.title.length} / {TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              type="text"
              name="title"
              value={postModalData.title}
              onChange={handlePostInputChange}
              className="mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Summary</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {postModalData.summary.length} / {SUMMARY_MAX_LENGTH}
              </span>
            </div>
            <input
              type="text"
              name="summary"
              value={postModalData.summary}
              onChange={handlePostInputChange}
              className="mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {postModalData.tags.length} / {TAGS_MAX_LENGTH}
              </span>
            </div>
            <input
              type="text"
              name="tags"
              value={postModalData.tags}
              onChange={handlePostInputChange}
              className="mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200"
              placeholder="e.g. React, Web Dev, JavaScript"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content (Markdown supported)</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {postModalData.content.length} / {CONTENT_MAX_LENGTH}
              </span>
            </div>
            <textarea
              name="content"
              rows="6"
              value={postModalData.content}
              onChange={handlePostInputChange}
              className="mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200 font-mono"
              required
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {postToEdit ? "Save Changes" : "Submit Post"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} title="Confirm Logout">
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">Are you sure you want to log out?</p>
          <div className="flex justify-end gap-x-4">
            <button onClick={closeLogoutModal} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-medium">
              Cancel
            </button>
            <button onClick={confirmLogout} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium">
              Log Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 py-3 px-6 rounded-full shadow-lg animate-fadeIn z-50">
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default MainAppScreen;