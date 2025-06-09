
// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Aquí podrías enviar el error a un servicio de logging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            {/* Icono de error */}
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            
            {/* Título y mensaje */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                ¡Oops! Algo salió mal
              </h2>
              <p className="mt-2 text-gray-600">
                Ha ocurrido un error inesperado. Por favor intenta recargar la página.
              </p>
            </div>
            
            {/* Botones de acción */}
            <div className="space-y-4">
              <Button
                onClick={this.handleReload}
                icon={<RefreshCw className="w-4 h-4" />}
                className="w-full"
              >
                Recargar página
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                icon={<Home className="w-4 h-4" />}
                className="w-full"
              >
                Ir al inicio
              </Button>
            </div>
            
            {/* Detalles del error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Detalles técnicos
                </summary>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-600 overflow-auto max-h-40">
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
            
            {/* Mensaje de soporte */}
            <div className="text-sm text-gray-500">
              Si el problema persiste, contacta a soporte técnico
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;