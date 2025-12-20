import axios from 'axios';



const apiClient = axios.create({
  baseURL:  import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});


export const apiSearchUsers = async (query) => {
  const { data } = await apiClient.get(`/users/search`, { params: { query } });
  return data;
};


export const apiLogin = async (email, password) => {

  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
};

export const apiRegister = async (formData) => {

  const { data } = await apiClient.post('/auth/register', formData);
  return data;
};

export const apiForgotPassword = async (email) => {
  const { data } = await apiClient.post('/auth/forgotpassword', { email });
  return data;
};

export const apiResetPassword = async (token, password) => {
  const { data } = await apiClient.put(`/auth/resetpassword/${token}`, { password });
  return data;
};




export const apiGetComments = async (postId) => {
  const { data } = await apiClient.get(`/comments/${postId}`);
  return data;
};

export const apiAddComment = async (postId, content, parentCommentId = null) => {
  const { data } = await apiClient.post(`/comments/${postId}`, { content, parentCommentId });
  return data;
};

export const apiDeleteComment = async (commentId) => {
  const { data } = await apiClient.delete(`/comments/${commentId}`);
  return data;
};


export const apiGetRecommendedPosts = async (userId) => {

  const { data } = await apiClient.get(`/v1/posts/recommend-posts`, {
    params: { user_id: userId }
  });
  return data.recommended;
};


export const apiFindPartners = async (userId, filters) => {

  const params = new URLSearchParams();
  params.append('user_id', userId);


  if (filters.skills && filters.skills.length > 0) {
    filters.skills.forEach(skill => params.append('domain', skill));
  }
  if (filters.studyTime && filters.studyTime.length > 0) {
    filters.studyTime.forEach(time => params.append('study_time', time.toLowerCase()));
  }
  if (filters.teamPref) {
    params.append('team_pref', filters.teamPref.toLowerCase());
  }


  const { data } = await apiClient.get(`/v1/partners/find-partner`, { params });
  return data.matches;
};


export const apiCreatePost = async (postData) => {

  const { data } = await apiClient.post('/posts', postData);
  return data;
};

export const apiLikePost = async (postId) => {
  const { data } = await apiClient.put(`/posts/${postId}/like`);
  return data;
};



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


export const apiUpdateUserProfile = async (profileData) => {
  const { data } = await apiClient.put('/users/profile', profileData);
  return data;
};


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



export const apiGetUserById = async (userId) => {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data;
};


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


export const apiSeedGroups = async () => {
  const { data } = await apiClient.post('/groups/seed');
  return data;
};


export const apiLogout = async () => {
  const { data } = await apiClient.post('/auth/logout');
  return data;
};





apiClient.interceptors.response.use(
  (response) => response,
  (error) => {

    const message = error.response?.data?.message || error.message;
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);
