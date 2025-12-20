import React from 'react';
import Post from '../Post.jsx';
import { NewPostIcon } from '../Icons.jsx';
import { getAvatarUrl } from '../../constants.js';


const PostsView = ({ onOpenPostModal, posts, isLoading, error, user, onLikePost, setToastMessage  , onViewProfile}) => (
  
  <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
    
    {}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-3">
        <img 
          src={getAvatarUrl(user.avatarId)} 
          alt={user.name} 
          className="w-11 h-11 rounded-full object-cover"
        />
        <button 
          onClick={onOpenPostModal}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-left text-gray-500 dark:text-gray-400 py-3 px-4 rounded-full transition-colors"
        >
          What's on your mind, {user.name.split(' ')[0]}?
        </button>
        <button
          onClick={onOpenPostModal}
          className="flex-shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
        >
          <NewPostIcon />
          <span className="ml-2 hidden sm:inline">Create Post</span>
        </button>
      </div>
    </div>

    {}
    {isLoading && (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )}
    
    {error && (
      <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-center">
        <p className="font-medium text-red-700 dark:text-red-200">Error: {error}</p>
      </div>
    )}

    {}
    {!isLoading && !error && (
      <div className="space-y-6">
        {posts.map(post => (
          <Post 
            key={post._id} 
            post={post} 
            user={user} 
            onLikePost={onLikePost}
            setToastMessage={setToastMessage} 
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    )}
  </div>
);

export default PostsView;