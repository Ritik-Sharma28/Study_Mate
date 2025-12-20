import Group from '../models/Group.model.js';

import { COMMUNITY_GROUPS } from '../mockData.js'; 
import GroupMember from '../models/GroupMember.model.js';





export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({});
    
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




export const getMyGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.find({ user: req.user._id })
                                          .populate('group');
    
    
    const groups = memberships.map(m => m.group);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




export const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    
    const existing = await GroupMember.findOne({ user: userId, group: groupId });
    if (existing) {
      return res.status(400).json({ message: 'Already a member' });
    }

    
    await GroupMember.create({ user: userId, group: groupId });
    
    
    const memberCount = await GroupMember.countDocuments({ group: groupId });
    res.status(201).json({ memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    
    
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




export const getGroupMembers = async (req, res) => {
  try {
    const members = await GroupMember.find({ group: req.params.id })
                                      .populate('user', 'name avatarId');
    
    res.json(members.map(m => m.user)); 
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};