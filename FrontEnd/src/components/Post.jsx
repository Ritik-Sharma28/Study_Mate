import React from 'react';
import { getAvatarUrl } from '../constants.js';
import { LikeIcon, ReplyIcon } from './Icons.jsx'; // 1. Import new ReplyIcon

// 2. Accept 'setToastMessage' prop
const Post = ({ post, user, onLikePost, setToastMessage  , onViewProfile}) => {
    
  const isLiked = post.likes.includes(user._id);
  
  // 3. Format timestamp
  const postDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    // 4. Complete Redesign of the Post Card
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      
      {/* --- POST HEADER --- */}<button 
        onClick={() => onViewProfile(post.author._id)} 
        className="p-5 flex items-center space-x-3 text-left w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
 <header className="p-5 flex items-center space-x-3">
        
        <img 
          src={getAvatarUrl(post.author.avatarId)} 
          alt={post.author.name} 
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{post.author.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{postDate}</p>
        </div>
      </header>
      

      </button>
     
      {/* --- POST BODY --- */}
      <main className="px-5 pb-5 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{post.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{post.summary}</p>
        
        {/* We respect formatting without using the ugly <pre> tag */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          <code>{post.content}</code>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </main>
      
      {/* --- POST ACTIONS --- */}
      <footer className="border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-3 py-2">
        {/* Like Button */}
        <button 
          onClick={() => onLikePost(post._id)} 
          className={`flex-1 flex justify-center items-center space-x-2 p-3 rounded-lg transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} hover:bg-red-50 dark:hover:bg-gray-700`}
        >
          <LikeIcon active={isLiked} />
          <span className="text-sm font-medium">
            {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
          </span>
        </button>
        
        {/* Reply Button (New) */}
        <button 
          onClick={() => setToastMessage('Reply feature coming soon!')}
          className="flex-1 flex justify-center items-center space-x-2 p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <ReplyIcon />
          <span className="text-sm font-medium">Reply</span>
        </button>
      </footer>
    </div>
  );
};

export default Post;