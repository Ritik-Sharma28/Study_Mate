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
    { name: 'Alice', group: 'Web Devs', avatarId: '1027', skills: ['React', 'JavaScript', 'UI/UX Design'] },
    { name: 'Bob', group: 'ML Enthusiasts', avatarId: '1005', skills: ['Python', 'ML'] },
    { name: 'Charlie', group: 'Competitive Programmers', avatarId: '1011', skills: ['DSA', 'Python'] },
    { name: 'Diana', group: 'Cybersecurity', avatarId: '1012', skills: ['Cybersecurity', 'Node.js'] },
    { name: 'Ethan', group: 'Game Dev', avatarId: '1025', skills: ['Game Dev', 'JavaScript'] }
];

export const DEFAULT_USER = {
    _id: 'mockDemoUser',
    username: 'DemoUser',
    avatarId: '237', // --- MODIFIED ---
    name: 'Govind',
    email: '22CS045@svnit.ac.in',
    domains: ['Web Dev', 'ML'],
    learningStyle: 'Practical',
    studyTime: 'Night',
    teamPref: 'Team',
};

// export const DEFAULT_USER = {
//     _id: 'mockDemoUser', // <-- ADD A MOCK ID
//     username: 'DemoUser',
//     avatarId: '237',
//     // ...
// };

export const POSTS = [
    { id: 1, author: 'Alice', authorAvatarId: '1027', title: 'React Hooks Best Practices', summary: 'A deep dive into using React Hooks effectively...', content: '## Understanding useState and useEffect...', tags: ['Web Dev', 'React'] },
    { id: 2, author: 'Bob', authorAvatarId: '1005', title: 'Introduction to K-Means Clustering', summary: 'Learn the fundamentals of K-Means...', content: '### How K-Means Works...', tags: ['ML', 'Python'] },
    { id: 3, author: 'Charlie', authorAvatarId: '1011', title: 'My Competitive Programming Journey', summary: 'Tips and tricks for anyone starting...', content: 'Consistency is key...', tags: ['DSA', 'Algorithms'] }
];

// ...
