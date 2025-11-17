import axios from 'axios';

// --- 1. CREATE A NEW AXIOS INSTANCE ---
// This reads the VITE_API_BASE_URL from your .env file
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // This tells axios to send cookies with requests
});

// --- 2. UPDATE YOUR FUNCTIONS TO USE THE NEW INSTANCE ---
// Notice the URLs no longer start with '/api'
// The baseURL is added automatically

// --- Auth Functions ---
export const apiLogin = async (email, password) => {
  // URL is now just '/auth/login'
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
};

export const apiRegister = async (formData) => {
  // URL is now just '/auth/register'
  const { data } = await apiClient.post('/auth/register', formData);
  return data;
};

// 1. Replaces apiGetPosts
export const apiGetRecommendedPosts = async (userId) => {
  // GET /api/v1/posts/recommend-posts?user_id=...
  const { data } = await apiClient.get(`/v1/posts/recommend-posts`, {
    params: { user_id: userId }
  });
  return data.recommended; // The Python API returns an object { "recommended": [...] }
};

// 2. New Find Partner function
export const apiFindPartners = async (userId, filters) => {
  // filters = { skills: [], studyTime: [], teamPref: 'Team' }
  const params = new URLSearchParams();
  params.append('user_id', userId);
  
  // Add filters if they exist
  if (filters.skills && filters.skills.length > 0) {
    filters.skills.forEach(skill => params.append('domain', skill)); // 'skills' in frontend is 'domain' in API
  }
  if (filters.studyTime && filters.studyTime.length > 0) {
    filters.studyTime.forEach(time => params.append('study_time', time.toLowerCase()));
  }
  if (filters.teamPref) {
    params.append('team_pref', filters.teamPref.toLowerCase());
  }

  // GET /api/v1/partners/find-partner?user_id=...&domain=react&team_pref=team
  const { data } = await apiClient.get(`/v1/partners/find-partner`, { params });
  return data.matches; // The Python API returns an object { "matches": [...] }
};

// POST /api/posts
export const apiCreatePost = async (postData) => {
  // postData will be { title, summary, content, tags }
  const { data } = await apiClient.post('/posts', postData);
  return data;
};
// POST /api/posts/:id/like
export const apiLikePost = async (postId) => {
  const { data } = await apiClient.put(`/posts/${postId}/like`);
  return data; // Returns the updated post
};

// --- END ADD ---

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name avatarId')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- NEW USER FUNCTIONS ---
export const apiUpdateUserProfile = async (profileData) => {
  const { data } = await apiClient.put('/users/profile', profileData);
  return data;
};

// --- NEW POST FUNCTIONS ---
export const apiGetMyPosts = async () => {
  const { data } = await apiClient.get('/posts/myposts');
  return data;
};

export const apiUpdatePost = async (postId, postData) => {
  const { data } = await apiClient.put(`/posts/${postId}`, postData);
  return data;
};

export const apiDeletePost = async (postId) => {
  const { data } = await apiClient.delete(`/posts/${postId}`);
  return data;
};


// --- NEW USER FUNCTIONS ---
export const apiGetUserById = async (userId) => {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data;
};

// --- NEW POST FUNCTIONS ---
export const apiGetPostsByUserId = async (userId) => {
  const { data } = await apiClient.get(`/posts/user/${userId}`);
  return data;
};

export const apiGetDmMessages = async (roomId) => {
  const { data } = await apiClient.get(`/messages/dm/${roomId}`);
  return data;
};

export const apiGetGroupMessages = async (groupId) => {
  const { data } = await apiClient.get(`/messages/group/${groupId}`);
  return data;
};

export const apiGetMyChats = async () => {
  const { data } = await apiClient.get('/messages/my-chats');
  return data;
};


// ... (all existing API functions)

// --- NEW GROUP FUNCTIONS ---

export const apiGetAllGroups = async () => {
  const { data } = await apiClient.get('/groups');
  return data;
};

export const apiGetMyGroups = async () => {
  const { data } = await apiClient.get('/groups/my-groups');
  return data;
};

export const apiJoinGroup = async (groupId) => {
  const { data } = await apiClient.post(`/groups/${groupId}/join`);
  return data;
};

export const apiLeaveGroup = async (groupId) => {
  const { data } = await apiClient.delete(`/groups/${groupId}/leave`);
  return data;
};

export const apiGetGroupMembers = async (groupId) => {
  const { data } = await apiClient.get(`/groups/${groupId}/members`);
  return data;
};

// This calls the POST /api/groups/seed route
export const apiSeedGroups = async () => {
  const { data } = await apiClient.post('/groups/seed');
  return data;
};
// --- END ADD ---

export const apiLogout = async () => {
  const { data } = await apiClient.post('/auth/logout');
  return data;
};

// ... (error interceptor)

// --- ERROR HANDLING (Optional but good) ---
// We can add a "response interceptor" to handle errors globally
apiClient.interceptors.response.use(
  (response) => response, // If response is good, just return it
  (error) => {
    // If response is bad, log it and re-throw a clearer error
    const message = error.response?.data?.message || error.message;
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);
