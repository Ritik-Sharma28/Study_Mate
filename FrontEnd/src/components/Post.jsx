import React, { useState } from 'react';
import { getAvatarUrl } from '../constants.js';
import { LikeIcon, ReplyIcon } from './Icons.jsx';
import CommentSection from './CommentSection.jsx';


const Post = ({ post, user, onLikePost, setToastMessage, onViewProfile }) => {

  const isLiked = post.likes.includes(user._id);
  const [showComments, setShowComments] = useState(false);


  const postDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (

    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">

      { }<button
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

      { }
      <main className="px-5 pb-5 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{post.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{post.summary}</p>

        { }
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          <code>{post.content}</code>
        </div>

        { }
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </main>

      { }
      <footer className="border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-3 py-2">
        { }
        <button
          onClick={() => onLikePost(post._id)}
          className={`flex-1 flex justify-center items-center space-x-2 p-3 rounded-lg transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} hover:bg-red-50 dark:hover:bg-gray-700`}
        >
          <LikeIcon active={isLiked} />
          <span className="text-sm font-medium">
            {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
          </span>
        </button>

        { }
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex justify-center items-center space-x-2 p-3 rounded-lg transition-colors ${showComments ? 'text-blue-500 bg-blue-50 dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400'}`}
        >
          <ReplyIcon />
          <span className="text-sm font-medium">Reply</span>
        </button>
      </footer>

      {showComments && <CommentSection postId={post._id} user={user} />}
    </div>
  );
};

export default Post;