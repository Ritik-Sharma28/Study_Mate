import React, { useState, useEffect } from 'react';
import { apiGetComments, apiAddComment } from '../services/apiService.js';
import CommentItem from './CommentItem.jsx';

const CommentSection = ({ postId, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const data = await apiGetComments(postId);
            setComments(data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            const addedComment = await apiAddComment(postId, newComment);
            setComments([...comments, addedComment]);
            setNewComment('');
        } catch (err) {
            setError('Failed to add comment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReplyAdded = (newReply) => {
        setComments([...comments, newReply]);
    };

    const handleCommentDeleted = (commentId) => {
        setComments(comments.filter(c => c._id !== commentId));
    };

    // Organize comments into a tree structure
    const rootComments = comments.filter(c => !c.parentComment);
    const getReplies = (commentId) => comments.filter(c => c.parentComment && (c.parentComment._id === commentId || c.parentComment === commentId));

    return (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Comments</h4>

            <form onSubmit={handleAddComment} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
                />
                <button
                    type="submit"
                    disabled={isLoading || !newComment.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    Post
                </button>
            </form>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="space-y-4">
                {rootComments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        replies={getReplies(comment._id)}
                        allComments={comments}
                        postId={postId}
                        user={user}
                        onReplyAdded={handleReplyAdded}
                        onCommentDeleted={handleCommentDeleted}
                    />
                ))}
                {rootComments.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</p>}
            </div>
        </div>
    );
};

export default CommentSection;
