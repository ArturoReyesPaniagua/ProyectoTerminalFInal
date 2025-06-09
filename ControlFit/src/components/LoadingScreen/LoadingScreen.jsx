// frontend/src/components/LoadingScreen.jsx
import React from 'react';
import { Dumbbell } from 'lucide-react';
import { LoadingSpinner } from './ui';

const LoadingScreen = ({ message = 'Cargando...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        {/* Logo animado */}
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 mb-8 animate-pulse">
          <Dumbbell className="h-10 w-10 text-primary-600" />
        </div>
        
        {/* Spinner */}
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        
        {/* Mensaje */}
        <p className="text-lg font-medium text-gray-700 mb-2">ASECGC</p>
        <p className="text-sm text-gray-500">{message}</p>
        
        {/* Puntos animados */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;