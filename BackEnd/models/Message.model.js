import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // We can use ONE of these. If 'group' exists, it's a group chat.
    // If 'dmRoom' exists, it's a DM.
    group: {
      type: String, // Or ObjectId ref if you make a Group model
      index: true,
    },
    dmRoom: {
      type: String, // The calculated 'userA_userB' ID
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;