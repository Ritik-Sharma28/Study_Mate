import React, { useState } from 'react';
import { getAvatarUrl } from '../constants.js';
import { apiAddComment, apiDeleteComment } from '../services/apiService.js';

const CommentItem = ({ comment, replies, allComments, postId, user, onReplyAdded, onCommentDeleted }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsLoading(true);
        try {
            const newReply = await apiAddComment(postId, replyContent, comment._id);
            onReplyAdded(newReply);
            setIsReplying(false);
            setReplyContent('');
        } catch (err) {
            console.error('Failed to add reply:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await apiDeleteComment(comment._id);
                onCommentDeleted(comment._id);
            } catch (err) {
                console.error('Failed to delete comment:', err);
            }
        }
    };

    const getChildReplies = (parentId) => allComments.filter(c => c.parentComment && (c.parentComment._id === parentId || c.parentComment === parentId));

    const commentDate = new Date(comment.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="flex gap-3">
            <img
                src={getAvatarUrl(comment.author.avatarId)}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full object-cover mt-1"
            />
            <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{comment.author.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{commentDate}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
                </div>

                <div className="flex gap-4 mt-1 ml-1">
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                        Reply
                    </button>
                    {user && user._id === comment.author._id && (
                        <button
                            onClick={handleDelete}
                            className="text-xs font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                            Delete
                        </button>
                    )}
                </div>

                {isReplying && (
                    <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Reply to ${comment.author.name}...`}
                            className="flex-1 p-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !replyContent.trim()}
                            className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            Reply
                        </button>
                    </form>
                )}

                {/* Recursive Replies */}
                {replies && replies.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        {replies.map(reply => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                replies={getChildReplies(reply._id)}
                                allComments={allComments}
                                postId={postId}
                                user={user}
                                onReplyAdded={onReplyAdded}
                                onCommentDeleted={onCommentDeleted}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
