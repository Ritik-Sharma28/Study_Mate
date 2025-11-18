import Message from '../models/Message.model.js';
import User from '../models/User.model.js';

// @desc    Get all messages for a room
// @route   GET /api/messages/dm/:roomId
// @access  Private
const getDmMessages = async (req, res) => {
  try {
    const messages = await Message.find({ dmRoom: req.params.roomId })
      .populate('sender', 'name avatarId _id')
      .sort({ createdAt: 'asc' });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all messages for a group
// @route   GET /api/messages/group/:groupId
// @access  Private
const getGroupMessages = async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'name avatarId _id')
      .sort({ createdAt: 'asc' });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get the user's chat list (DMs ONLY)
// @route   GET /api/messages/my-chats
// @access  Private
const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;
    const allChatsMap = new Map();

    // --- 1. DM LOGIC ---
    const dmMessages = await Message.find({
      dmRoom: { $regex: new RegExp(userId.toString()) },
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatarId _id');

    for (const msg of dmMessages) {
      if (!allChatsMap.has(msg.dmRoom)) {
        const idParts = msg.dmRoom.split('__');
        const otherUserId = idParts[0].toString() === userId.toString() ? idParts[1] : idParts[0];
        
        // Fetch the other user's info
        const otherUser = await User.findById(otherUserId).select('name avatarId');

        if (otherUser) {
          allChatsMap.set(msg.dmRoom, {
            roomType: 'dm',
            roomId: msg.dmRoom,
            lastMessage: msg,
            displayUser: {
              _id: otherUser._id,
              name: otherUser.name,
              avatarId: otherUser.avatarId,
            },
          });
        }
      }
    }

    // --- 2. CONVERT & SORT ---
    const allChats = [...allChatsMap.values()];
    
    allChats.sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json(allChats);
  } catch (error) {
    console.error('getChatList error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getDmMessages, getGroupMessages, getChatList };