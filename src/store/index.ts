import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import evaluationReducer from './slices/evaluationSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    evaluation: evaluationReducer,
    ui: uiReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;