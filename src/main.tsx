import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { NextUIProvider } from '@nextui-org/react';
import { store } from './store';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <NextUIProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </NextUIProvider>
    </Provider>
  </StrictMode>
);