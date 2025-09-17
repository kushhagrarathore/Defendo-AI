import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'
import './index.css'

const router = createBrowserRouter(
  [
    { path: '/*', element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ) },
  ],
  {
    // Future flags to silence React Router v7 warnings
    future: {
      v7_startTransition: true,      // Enables React.startTransition for state updates
      v7_relativeSplatPath: true,    // Enables new relative splat path resolution
    },
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider 
        router={router}
        future={{
          v7_startTransition: true,      // Silences React Router v7 warnings
          v7_relativeSplatPath: true,    // Silences React Router v7 warnings
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>,
)