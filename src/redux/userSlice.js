import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../services/api';

// Get all users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await userAPI.getAllUsers();
  return response.data;
});

// Get single user
export const fetchUserById = createAsyncThunk('users/fetchUserById', async (id) => {
  const response = await userAPI.getUserById(id);
  return response.data;
});

// Create user
export const createUser = createAsyncThunk('users/createUser', async (userData) => {
  const response = await userAPI.createUser(userData);
  return response.data;
});

// Update user (PUT - full update)
export const updateUser = createAsyncThunk('users/updateUser', async ({ id, userData }) => {
  const response = await userAPI.updateUser(id, userData);
  return response.data;
});

// Partial update (PATCH)
export const updatePartialUser = createAsyncThunk('users/updatePartialUser', async ({ id, userData }) => {
  const response = await userAPI.updatePartialUser(id, userData);
  return response.data;
});

// Delete user
export const deleteUser = createAsyncThunk('users/deleteUser', async (id) => {
  await userAPI.deleteUser(id);
  return id;
});

// Upload photo
export const uploadUserPhoto = createAsyncThunk('users/uploadUserPhoto', async ({ id, photo }) => {
  const response = await userAPI.uploadPhoto(id, photo);
  return response.data;
});

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch single user
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      
      // Update user (PUT)
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      
      // Partial update (PATCH)
      .addCase(updatePartialUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
      });
  },
});

export const { clearError, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;