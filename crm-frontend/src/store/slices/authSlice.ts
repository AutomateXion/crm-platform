import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, permissionsApi } from '../../services/api';

interface AuthState {
  user: any | null;
  tenant: any | null;
  permissions: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  tenant: JSON.parse(localStorage.getItem('tenant') || 'null'),
  permissions: JSON.parse(localStorage.getItem('permissions') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false,
  error: null,
  requiresTwoFactor: false,
};

export const login = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const res = await authApi.login(credentials);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state: any = getState();
  try { await authApi.logout(state.auth.refreshToken); } catch {}
  localStorage.clear();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setPermissions: (state, action: PayloadAction<any>) => {
      state.permissions = action.payload;
      localStorage.setItem('permissions', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.requiresTwoFactor) {
          state.requiresTwoFactor = true;
          return;
        }
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.permissions = action.payload.permissions;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('tenant', JSON.stringify(action.payload.tenant));
        localStorage.setItem('permissions', JSON.stringify(action.payload.permissions));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.tenant = null; state.permissions = null;
        state.accessToken = null; state.refreshToken = null;
      });
  },
});

export const { clearError, setPermissions } = authSlice.actions;
export default authSlice.reducer;
