import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeMenu: string;
  showSettings: boolean;
  theme: 'light' | 'dark';
  isSidebarOpen: boolean;
}

const initialState: UIState = {
  activeMenu: 'mis-evaluaciones',
  showSettings: false,
  theme: 'light',
  isSidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveMenu: (state, action: PayloadAction<string>) => {
      state.activeMenu = action.payload;
    },
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
  setActiveMenu, 
  toggleSettings, 
  setTheme, 
  toggleSidebar,
  closeSidebar 
} = uiSlice.actions;
export default uiSlice.reducer;