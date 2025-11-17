import Group from '../models/Group.model.js';

import { COMMUNITY_GROUPS } from '../mockData.js'; // We'll create this
import GroupMember from '../models/GroupMember.model.js';


// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({});
    // We need to get member counts for each
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await GroupMember.countDocuments({ group: group._id });
        return {
          ...group.toObject(),
          memberCount,
        };
      })
    );
    res.json(groupsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get groups the current user has joined
// @route   GET /api/groups/my-groups
// @access  Private
export const getMyGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.find({ user: req.user._id })
                                          .populate('group');
    
    // We just want to return the group objects
    const groups = memberships.map(m => m.group);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join a group
// @route   POST /api/groups/:id/join
// @access  Private
export const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    // Check if already a member
    const existing = await GroupMember.findOne({ user: userId, group: groupId });
    if (existing) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // Create the membership
    await GroupMember.create({ user: userId, group: groupId });
    
    // Return the new member count
    const memberCount = await GroupMember.countDocuments({ group: groupId });
    res.status(201).json({ memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave a group
// @route   DELETE /api/groups/:id/leave
// @access  Private
export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    // Find and delete the membership
    const result = await GroupMember.deleteOne({ user: userId, group: groupId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    const memberCount = await GroupMember.countDocuments({ group: groupId });
    res.json({ message: 'Left group successfully', memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get members of a group
// @route   GET /api/groups/:id/members
// @access  Private
export const getGroupMembers = async (req, res) => {
  try {
    const members = await GroupMember.find({ group: req.params.id })
                                      .populate('user', 'name avatarId');
    
    res.json(members.map(m => m.user)); // Return just the user objects
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};