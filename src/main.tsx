import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Global error handler for debugging white screens
window.onerror = function(message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif; background: white; position: fixed; inset: 0; z-index: 9999; overflow: auto;">
        <h1>Runtime Error</h1>
        <p>${message}</p>
        <pre style="white-space: pre-wrap;">${error?.stack || ''}</pre>
      </div>
    `;
  }
  return false;
};

window.onunhandledrejection = function(event) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif; background: white; position: fixed; inset: 0; z-index: 9999; overflow: auto;">
        <h1>Unhandled Promise Rejection</h1>
        <p>${event.reason?.message || event.reason}</p>
        <pre style="white-space: pre-wrap;">${event.reason?.stack || ''}</pre>
      </div>
    `;
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
