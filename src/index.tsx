
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Catch and log global errors to help debug blank pages in production
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Error Caught:", message, "at", source, ":", lineno);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL: Root element not found in HTML. Ensure <div id='root'></div> exists.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Mounting Error:", err);
  }
}
