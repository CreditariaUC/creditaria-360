import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeMenu: string;
  showSettings: boolean;
  theme: 'light' | 'dark';
  isSidebarOpen: boolean;
}

const initialState: UIState = {
  activeMenu: '',
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