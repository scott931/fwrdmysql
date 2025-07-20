import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create a custom event for permission errors
declare global {
  interface WindowEventMap {
    permissionError: CustomEvent<{ message: string }>;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);