import Message from '../models/Message.model.js';
import User from '../models/User.model.js';




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




const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;
    const allChatsMap = new Map();

    
    const dmMessages = await Message.find({
      dmRoom: { $regex: new RegExp(userId.toString()) },
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatarId _id');

    for (const msg of dmMessages) {
      if (!allChatsMap.has(msg.dmRoom)) {
        const idParts = msg.dmRoom.split('__');
        const otherUserId = idParts[0].toString() === userId.toString() ? idParts[1] : idParts[0];
        
        
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