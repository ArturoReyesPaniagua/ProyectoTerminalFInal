// frontend/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading de componentes para mejor rendimiento
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workouts = lazy(() => import('./pages/Workouts'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppProvider>
            <div className="App">
              {/* Configuración global de toast */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '16px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />

              {/* Rutas de la aplicación */}
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Rutas protegidas */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/workouts/*" 
                    element={
                      <ProtectedRoute>
                        <Workouts />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Redirección de la raíz */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Página de error 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </AppProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;



