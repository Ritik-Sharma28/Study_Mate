import Message from '../models/Message.model.js';
import User from '../models/User.model.js'; // <-- THE FIX: Was '../modelsD/User.model.js'

// @desc    Get all messages for a room
// @route   GET /api/messages/dm/:roomId
// @access  Private
const getDmMessages = async (req, res) => {
  try {
    const messages = await Message.find({ dmRoom: req.params.roomId })
      .populate('sender', 'name avatarId _id') // Added '_id'
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
      .populate('sender', 'name avatarId _id') // Added '_id'
      .sort({ createdAt: 'asc' });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get the user's chat list (DMs and Groups)
// @route   GET /api/messages/my-chats
// @access  Private
const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find all DM messages involving the user
    const dmMessages = await Message.find({
      dmRoom: { $regex: new RegExp(userId.toString()) },
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatarId _id'); // Added '_id'

    // 2. Group DMs by room to get the last message
    const dmChats = new Map();
    for (const msg of dmMessages) {
      if (!dmChats.has(msg.dmRoom)) {
        // This is the last message for this room
        
        // Find the "other user's" ID from the room name
        const idParts = msg.dmRoom.split('__');
        const otherUserId = idParts[0].toString() === userId.toString() ? idParts[1] : idParts[0];
        
        // Fetch the other user's info
        const otherUser = await User.findById(otherUserId).select('name avatarId');

        if (otherUser) {
          dmChats.set(msg.dmRoom, {
            roomType: 'dm',
            roomId: msg.dmRoom,
            lastMessage: msg,
            // This is the user we display on the chat list
            displayUser: {
              _id: otherUser._id,
              name: otherUser.name,
              avatarId: otherUser.avatarId,
            },
          });
        }
      }
    }

    // 3. Find all Group messages (this part is simplified for now)
    // We'll add this once you have a real "Joined Groups" model

    const allChats = [...dmChats.values()];

    // 4. Sort all chats by the last message's timestamp
    allChats.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json(allChats);
  } catch (error) {
    console.error('getChatList error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getDmMessages, getGroupMessages, getChatList };