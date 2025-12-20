import mongoose from 'mongoose';

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    
    bannerImage: {
      type: String,
      required: false,
    },
    
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model('Group', groupSchema);

export default Group;