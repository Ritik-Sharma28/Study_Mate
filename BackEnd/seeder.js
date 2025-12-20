import Group from './models/Group.model.js';

import { COMMUNITY_GROUPS } from './mockData.js';




const FORCE_SEED = false; 

export const checkAndSeedGroups = async () => {
  try {
    if (FORCE_SEED) {
      console.log('Forcing re-seed: Deleting all groups...');
      await Group.deleteMany({});
    }

    
    const groupCount = await Group.countDocuments();
    if (groupCount > 0) {
      console.log('Groups already seeded. Skipping.');
      return;
    }

    
    

    console.log('No groups found. Seeding database...');

    
    const groupsToCreate = COMMUNITY_GROUPS.map(group => ({
      name: group.name,
      description: group.description,
      bannerImage: group.bannerImage,
      
    }));

    
    await Group.insertMany(groupsToCreate);
    console.log('Successfully seeded Community Groups to the database.');

  } catch (error) {
    console.error('Error seeding groups:', error);
  }
};