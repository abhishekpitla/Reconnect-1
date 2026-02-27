import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('reconnect_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('reconnect_token');
            localStorage.removeItem('reconnect_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Users
export const getProfile = (userId) => api.get(`/users/${userId}`);
export const updateProfile = (data) => api.put('/users/profile', data);
export const searchUsers = (q) => api.get(`/users/search?q=${q}`);

// Activities
export const createActivity = (data) => api.post('/activities', data);
export const getFeed = (page = 1) => api.get(`/activities/feed?page=${page}`);
export const getActivity = (id) => api.get(`/activities/${id}`);
export const getUserActivities = (userId) => api.get(`/activities/user/${userId}`);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// Connections
export const sendConnectionRequest = (recipientId) => api.post('/connections/request', { recipientId });
export const acceptConnection = (connectionId) => api.put(`/connections/${connectionId}/accept`);
export const removeConnection = (connectionId) => api.delete(`/connections/${connectionId}`);
export const getFriends = () => api.get('/connections/friends');
export const getPendingRequests = () => api.get('/connections/pending');

// Engagements
export const toggleEngagement = (activityId, type) => api.post('/engagements/toggle', { activityId, type });
export const getActivityEngagements = (activityId) => api.get(`/engagements/activity/${activityId}`);
export const respondToInvite = (engagementId, status) => api.post('/engagements/respond', { engagementId, status });
export const getPendingInvites = () => api.get('/engagements/pending');

// Chats
export const getActivityMessages = (activityId) => api.get(`/chats/${activityId}`);
export const sendChatMessage = (data) => api.post('/chats', data);

// Notifications
export const getNotifications = (page = 1) => api.get(`/notifications?page=${page}`);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

export default api;
