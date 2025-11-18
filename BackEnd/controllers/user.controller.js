import User from '../models/User.model.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // We get req.user from our 'protect' middleware
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.avatarId = req.body.avatarId || user.avatarId;
    user.domains = req.body.domains || user.domains;
    user.learningStyle = req.body.learningStyle || user.learningStyle;
    user.studyTime = req.body.studyTime || user.studyTime;
    user.teamPref = req.body.teamPref || user.teamPref;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      avatarId: updatedUser.avatarId,
      domains: updatedUser.domains,
      learningStyle: updatedUser.learningStyle,
      studyTime: updatedUser.studyTime,
      teamPref: updatedUser.teamPref,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email'); // Don't send private info

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @access  Private
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.query
      ? {
          name: { $regex: req.query.query, $options: 'i' }, // Case-insensitive regex
        }
      : {};

    // Find users matching the keyword, excluding the current user
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
      .select('name avatarId')
      .limit(10); // Limit results to 10 for performance

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getUserProfile, updateUserProfile, getUserById , searchUsers };