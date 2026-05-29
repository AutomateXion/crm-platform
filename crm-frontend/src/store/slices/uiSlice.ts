import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mastersApi } from '../../services/api';

// ─── Masters Slice ────────────────────────────────────────────────────────────
export const fetchMasterValues = createAsyncThunk(
  'masters/fetchBulk',
  async (categoryCodes: string[]) => {
    const res = await mastersApi.getBulkValues(categoryCodes);
    return res.data;
  }
);

const mastersSlice = createSlice({
  name: 'masters',
  initialState: { values: {} as Record<string, any[]>, loading: false },
  reducers: {
    setMasterValues: (state, action) => { state.values = { ...state.values, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterValues.pending, (state) => { state.loading = true; })
      .addCase(fetchMasterValues.fulfilled, (state, action) => {
        state.loading = false;
        state.values = { ...state.values, ...action.payload };
      })
      .addCase(fetchMasterValues.rejected, (state) => { state.loading = false; });
  },
});

// ─── UI Slice ─────────────────────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarCollapsed: false, language: 'en' },
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setLanguage: (state, action) => { state.language = action.payload; },
  },
});

export const { setMasterValues } = mastersSlice.actions;
export const { toggleSidebar, setLanguage } = uiSlice.actions;
export const mastersReducer = mastersSlice.reducer;
export const uiReducer = uiSlice.reducer;
