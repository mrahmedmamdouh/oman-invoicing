import api from './api';

const authService = {
  async login(credentials) {
    return await api.post('/auth/login', credentials);
  },

  async register(userData) {
    return await api.post('/auth/register', userData);
  },

  async refreshToken(refreshToken) {
    return await api.post('/auth/refresh', { refreshToken });
  },

  async logout(refreshToken) {
    return await api.post('/auth/logout', { refreshToken });
  },

  async getCurrentUser() {
    return await api.get('/auth/me');
  },

  async updateProfile(profileData) {
    return await api.put('/auth/profile', profileData);
  },

  async changePassword(passwordData) {
    return await api.put('/auth/password', passwordData);
  },
};

export default authService;
