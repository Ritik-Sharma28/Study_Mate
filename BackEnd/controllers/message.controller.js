import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import Group from '../models/Group.model.js'; // <-- NEW: Import Group model
import GroupMember from '../models/GroupMember.model.js'; // <-- NEW: Import GroupMember model

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

// @desc    Get the user's chat list (DMs and Groups)
// @route   GET /api/messages/my-chats
// @access  Private
const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    // Use one map to hold all chats (DMs and Groups)
    const allChatsMap = new Map();

    // 1. Find all DM messages involving the user
    const dmMessages = await Message.find({
      dmRoom: { $regex: new RegExp(userId.toString()) },
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatarId _id');

    // 2. Group DMs by room to get the last message
    for (const msg of dmMessages) {
      if (!allChatsMap.has(msg.dmRoom)) {
        // This is the last message for this room

        // Find the "other user's" ID from the room name
        const idParts = msg.dmRoom.split('__');
        const otherUserId =
          idParts[0].toString() === userId.toString() ? idParts[1] : idParts[0];

        // Fetch the other user's info
        const otherUser = await User.findById(otherUserId).select('name avatarId');

        if (otherUser) {
          allChatsMap.set(msg.dmRoom, {
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

    // --- START: NEW LOGIC FOR GROUPS ---

    // 3. Find all Groups the user is a member of
    const memberships = await GroupMember.find({ user: userId }).populate(
      'group',
      'name' // Only populate the fields we need
    );

    // 4. Find the last message for each group
    for (const membership of memberships) {
      const group = membership.group;
      if (!group) continue; // Skip if group data is missing

      const lastMessage = await Message.findOne({ group: group._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name avatarId _id');
      
      // Only add groups to the chat list if they have at least one message
      if (lastMessage) {
        // Use group ID as the key in the map
        const groupIdStr = group._id.toString();

        if (!allChatsMap.has(groupIdStr)) {
          allChatsMap.set(groupIdStr, {
            roomType: 'group',
            roomId: group._id,
            lastMessage: lastMessage,
            // This is the group we display on the chat list
            displayGroup: {
              _id: group._id,
              name: group.name,
            },
          });
        }
      }
    }
    // --- END: NEW LOGIC FOR GROUPS ---

    // 5. Convert map values to an array
    const allChats = [...allChatsMap.values()];

    // 6. Sort all chats by the last message's timestamp
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