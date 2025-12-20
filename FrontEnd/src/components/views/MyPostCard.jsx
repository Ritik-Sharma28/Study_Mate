import React, { useState, useEffect, useRef } from 'react';
import { EditIcon, DeleteIcon, EllipsisIcon, LikeIcon } from '../Icons.jsx'; 

const MyPostCard = ({ post, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col">
      {}
      <div className="flex justify-between items-center p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{post.title}</h3>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <EllipsisIcon />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { onEdit(post); setMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <EditIcon /> <span>Edit Post</span>
              </button>
              <button
                onClick={() => { onDelete(post._id); setMenuOpen(false); }}
                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <DeleteIcon /> <span>Delete Post</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {}
      <main className="px-4 pb-4 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">{post.summary}</p>
        
        {}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          <code>{post.content}</code>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </main>
      {}

      {}
      <footer className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 mt-auto">
        <div className="flex items-center space-x-2">
          {}
          <LikeIcon active={false} /> 
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MyPostCard;