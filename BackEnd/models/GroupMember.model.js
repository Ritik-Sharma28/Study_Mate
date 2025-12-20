import mongoose from 'mongoose';

const groupMemberSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


groupMemberSchema.index({ user: 1, group: 1 }, { unique: true });

const GroupMember = mongoose.model('GroupMember', groupMemberSchema);

export default GroupMember;