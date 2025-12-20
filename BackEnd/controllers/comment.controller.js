import Comment from '../models/Comment.model.js';
import Post from '../models/Post.model.js';

// @desc    Add a comment (or reply)
// @route   POST /api/comments/:postId
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { content, parentCommentId } = req.body;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await Comment.create({
            content,
            post: postId,
            author: req.user._id,
            parentComment: parentCommentId || null,
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name avatarId')
            .populate('parentComment');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Private
export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .populate('author', 'name avatarId')
            .sort({ createdAt: 1 }); // Oldest first for chronological conversation

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check user authorization
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Optional: Delete child comments (replies) recursively
        // For simplicity, we might just delete this one, or implement a pre-remove hook in model
        // Let's delete all replies to this comment
        await Comment.deleteMany({ parentComment: comment._id });

        await comment.deleteOne();

        res.json({ message: 'Comment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
