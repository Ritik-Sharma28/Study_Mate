export const DOMAINS = ["Web Dev", "ML", "DSA", "Cybersecurity", "Game Dev", "Cloud"];
export const SKILLS = ["JavaScript", "React", "Python", "Node.js", "SQL", "UI/UX Design"];
export const LEARNING_STYLES = ["Visual", "Practical", "Theoretical", "Auditory"];
export const STUDY_TIMES = ["Morning", "Afternoon", "Night", "Flexible"];
export const TEAM_PREFERENCES = ["Team", "Solo"];

// --- ADDED ---
export const AVATAR_OPTIONS = [
    { id: '1027', url: 'https://picsum.photos/id/1027/200/200' },
    { id: '1005', url: 'https://picsum.photos/id/1005/200/200' },
    { id: '1011', url: 'https://picsum.photos/id/1011/200/200' },
    { id: '1012', url: 'https://picsum.photos/id/1012/200/200' },
    { id: '1025', url: 'https://picsum.photos/id/1025/200/200' },
    { id: '237', url: 'https://picsum.photos/id/237/200/200' },
    { id: '3', url: 'https://picsum.photos/id/3/200/200' },
    { id: '8', url: 'https://picsum.photos/id/8/200/200' },
];

const avatarMap = new Map(AVATAR_OPTIONS.map(a => [a.id, a.url]));
// Add a default for safety
avatarMap.set('default', 'https://picsum.photos/id/237/200/200'); 

export const getAvatarUrl = (id) => {
    return avatarMap.get(id) || avatarMap.get('default');
};
// --- END ADD ---


export const SUGGESTED_USERS = [
    // --- FIX: Added mock _id to all users ---
    { _id: 'mockuser1', name: 'Alice', group: 'Web Devs', avatarId: '1027', skills: ['React', 'JavaScript', 'UI/UX Design'] },
    { _id: 'mockuser2', name: 'Bob', group: 'ML Enthusiasts', avatarId: '1005', skills: ['Python', 'ML'] },
    { _id: 'mockuser3', name: 'Charlie', group: 'Competitive Programmers', avatarId: '1011', skills: ['DSA', 'Python'] },
    { _id: 'mockuser4', name: 'Diana', group: 'Cybersecurity', avatarId: '1012', skills: ['Cybersecurity', 'Node.js'] },
    { _id: 'mockuser5', name: 'Ethan', group: 'Game Dev', avatarId: '1025', skills: ['Game Dev', 'JavaScript'] }
];

export const DEFAULT_USER = {
    username: 'DemoUser',
    avatarId: '237', // --- MODIFIED ---
    name: 'Govind',
    email: '22CS045@svnit.ac.in',
    domains: ['Web Dev', 'ML'],
    learningStyle: 'Practical',
    studyTime: 'Night',
    teamPref: 'Team',
};

export const POSTS = [
    { id: 1, author: 'Alice', authorAvatarId: '1027', title: 'React Hooks Best Practices', summary: 'A deep dive into using React Hooks effectively...', content: '## Understanding useState and useEffect...', tags: ['Web Dev', 'React'] },
    { id: 2, author: 'Bob', authorAvatarId: '1005', title: 'Introduction to K-Means Clustering', summary: 'Learn the fundamentals of K-Means...', content: '### How K-Means Works...', tags: ['ML', 'Python'] },
    { id: 3, author: 'Charlie', authorAvatarId: '1011', title: 'My Competitive Programming Journey', summary: 'Tips and tricks for anyone starting...', content: 'Consistency is key...', tags: ['DSA', 'Algorithms'] }
];

// --- ADD THIS NEW MOCK DATA ---
export const COMMUNITY_GROUPS = [
  {
    _id: 'web_devs',
    name: 'Web Devs',
    description: 'All things HTML, CSS, JavaScript, and frameworks. Join us to build the web!',
    bannerImage: 'https://picsum.photos/id/12/600/200',
    memberCount: 42,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('JavaScript')), 
  },
  {
    _id: 'ml_enthusiasts',
    name: 'ML Enthusiasts',
    description: 'From linear regression to deep learning, discuss models and share datasets.',
    bannerImage: 'https://picsum.photos/id/13/600/200',
    memberCount: 78,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('Python')),
  },
  {
    _id: 'react_js',
    name: 'React JS',
    description: 'A dedicated group for React hooks, components, state management, and more.',
    bannerImage: 'https://picsum.photos/id/14/600/200',
    memberCount: 102,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('React')),
  },
  {
    _id: 'dsa_squad',
    name: 'DSA Squad',
    description: 'Grinding LeetCode? Preparing for interviews? This is your group.',
    bannerImage: 'https://picsum.photos/id/15/600/200',
    memberCount: 55,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('DSA')),
  },
  {
    _id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Discuss CTFs, network security, and ethical hacking.',
    bannerImage: 'https://picsum.photos/id/16/600/200',
    memberCount: 31,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('Cybersecurity')),
  },
  {
    _id: 'game_dev_guild',
    name: 'Game Dev Guild',
    description: 'Share your progress in Unity, Unreal, or Godot. All game devs welcome.',
    bannerImage: 'https://picsum.photos/id/17/600/200',
    memberCount: 29,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('Game Dev')),
  },
  {
    _id: 'cloud_crew',
    name: 'Cloud Crew',
    description: 'AWS, Azure, or GCP. Talk about certs, services, and serverless.',
    bannerImage: 'https://picsum.photos/id/18/600/200',
    memberCount: 45,
    members: [], // No mock users have 'Cloud' skill
  },
  {
    _id: 'python_programmers',
    name: 'Python Programmers',
    description: 'A general group for Python lovers, from web scraping to data science.',
    bannerImage: 'https://picsum.photos/id/19/600/200',
    memberCount: 112,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('Python')),
  },
  {
    _id: 'ui_ux_designers',
    name: 'UI/UX Designers',
    description: 'Share your Figma, Sketch, or Framer designs. Talk color theory and user flows.',
    bannerImage: 'https://picsum.photos/id/20/600/200',
    memberCount: 63,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('UI/UX Design')),
  },
  {
    _id: 'node_js_ninjas',
    name: 'Node.js Ninjas',
    description: 'Talk Express, Fastify, event loops, and building fast backends.',
    bannerImage: 'https://picsum.photos/id/21/600/200',
    memberCount: 48,
    members: SUGGESTED_USERS.filter(u => u.skills.includes('Node.js')),
  },
  {
    _id: 'devops_den',
    name: 'DevOps Den',
    description: 'Docker, Kubernetes, CI/CD, and all things infrastructure.',
    bannerImage: 'https://picsum.photos/id/22/600/200',
    memberCount: 39,
    members: [], // No mock users have 'DevOps' skill
  },
];