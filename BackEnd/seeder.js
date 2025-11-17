import Group from './models/Group.model.js';
// 1. Remove the User import
import { COMMUNITY_GROUPS } from './mockData.js';

// --- 2. ADD THIS VARIABLE ---
// Set this to 'true' to delete all groups and re-seed.
// Set to 'false' for normal operation.
const FORCE_SEED = false; // <-- SET THIS TO TRUE FOR THE FIRST RUN

export const checkAndSeedGroups = async () => {
  try {
    if (FORCE_SEED) {
      console.log('Forcing re-seed: Deleting all groups...');
      await Group.deleteMany({});
    }

    // 3. Check if groups already exist
    const groupCount = await Group.countDocuments();
    if (groupCount > 0) {
      console.log('Groups already seeded. Skipping.');
      return;
    }

    // 4. REMOVE THE 'owner' CHECK
    // No need to find a user anymore

    console.log('No groups found. Seeding database...');

    // 5. Prepare group data (without an owner)
    const groupsToCreate = COMMUNITY_GROUPS.map(group => ({
      name: group.name,
      description: group.description,
      bannerImage: group.bannerImage,
      // 'owner' is now optional
    }));

    // 6. Seed the database
    await Group.insertMany(groupsToCreate);
    console.log('Successfully seeded Community Groups to the database.');

  } catch (error) {
    console.error('Error seeding groups:', error);
  }
};