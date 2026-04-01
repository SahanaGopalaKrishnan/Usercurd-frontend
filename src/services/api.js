import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userAPI = {
  // Get all users
  getAllUsers: () => API.get('/users'),

  // Get user by ID
  getUserById: (id) => API.get(`/users/${id}`),

  // Create user
  createUser: (userData) => API.post('/users', userData),

  // Update user (PUT - full update)
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),

  // Partial update (PATCH)
  updatePartialUser: (id, userData) => API.patch(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => API.delete(`/users/${id}`),

  // Upload photo
  uploadPhoto: (id, formData) => {
    // DO NOT set 'Content-Type'; let Axios handle multipart boundary
    return axios.post(`http://localhost:8081/api/users/${id}/photo`, formData);
  },

  // Get certificates
  getUserCertificates: (userId) => API.get(`/users/${userId}/certificates`),

  // Upload certificate
  uploadCertificate: (userId, certificateType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('certificateType', certificateType);
    return API.post(`/users/${userId}/certificates`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete certificate
  deleteCertificate: (certificateId) =>
    API.delete(`/users/certificates/${certificateId}`),
};

export default API;