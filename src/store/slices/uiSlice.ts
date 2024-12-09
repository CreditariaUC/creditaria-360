import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeMenu: string;
  showSettings: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  activeMenu: 'mis-evaluaciones',
  showSettings: false,
  theme: 'light',
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
  },
});

export const { setActiveMenu, toggleSettings, setTheme } = uiSlice.actions;
export default uiSlice.reducer;