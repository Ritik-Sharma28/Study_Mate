import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Post',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
