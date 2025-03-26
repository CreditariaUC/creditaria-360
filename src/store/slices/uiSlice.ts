import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  showSettings: boolean;
  theme: 'light' | 'dark';
  isSidebarOpen: boolean;
}

const initialState: UIState = {
  showSettings: false,
  theme: 'light',
  isSidebarOpen: false,
};

export const resetUI = createAction('ui/reset');

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(resetUI, () => initialState);
  },
  reducers: {
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
  },
});

export const { 
  toggleSettings, 
  setTheme, 
  toggleSidebar,
  closeSidebar 
} = uiSlice.actions;
export default uiSlice.reducer;