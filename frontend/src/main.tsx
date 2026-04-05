import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ResumeProvider } from './context/ResumeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="67693100136-4guqlhu2dodr82gngrueus53sii1cvod.apps.googleusercontent.com">
      <AuthProvider>
        <ResumeProvider>
          <App />
        </ResumeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
