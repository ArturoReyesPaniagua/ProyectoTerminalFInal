// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, tokenUtils, userUtils } from '../services/api';
import toast from 'react-hot-toast';

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipos de acciones
const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_RESET_ERROR: 'AUTH_RESET_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_RESET_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar si hay un token válido guardado
  const checkAuth = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const token = tokenUtils.getToken();
      const user = userUtils.getUser();

      if (!token || tokenUtils.isTokenExpired(token)) {
        // Token expirado o no existe
        logout();
        return;
      }

      if (user) {
        // Verificar token con el servidor
        try {
          const response = await authService.verifyToken();
          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: {
              user: response.user,
              token: token,
            },
          });
        } catch (error) {
          // Token inválido en el servidor
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      logout();
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Registrar usuario
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const response = await authService.register(userData);

      // Guardar token y usuario
      tokenUtils.setToken(response.token);
      userUtils.setUser(response.user);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      toast.success('¡Registro exitoso! Bienvenido a ASECGC');
      return { success: true, user: response.user };

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error en el registro';
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Iniciar sesión
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const response = await authService.login(credentials);

      // Guardar token y usuario
      tokenUtils.setToken(response.token);
      userUtils.setUser(response.user);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      toast.success(`¡Bienvenido de vuelta, ${response.user.username}!`);
      return { success: true, user: response.user };

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error en el inicio de sesión';
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      // Intentar notificar al servidor (opcional)
      if (state.isAuthenticated) {
        await authService.logout().catch(() => {
          // Ignorar errores de logout del servidor
        });
      }
    } finally {
      // Limpiar estado local siempre
      tokenUtils.removeToken();
      userUtils.removeUser();

      dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
      
      toast.success('Sesión cerrada correctamente');
    }
  };

  // Solicitar recuperación de contraseña
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      await authService.forgotPassword(email);
      
      toast.success('Se ha enviado un enlace de recuperación a tu email');
      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al solicitar recuperación';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Restablecer contraseña
  const resetPassword = async (token, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      await authService.resetPassword(token, newPassword);
      
      toast.success('Contraseña restablecida correctamente');
      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al restablecer contraseña';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Actualizar datos del usuario
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });

    // Actualizar en localStorage también
    const currentUser = userUtils.getUser();
    if (currentUser) {
      userUtils.setUser({ ...currentUser, ...userData });
    }
  };

  // Limpiar error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.AUTH_RESET_ERROR });
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return state.user?.roles?.includes(role) || false;
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => {
    return state.user?.permissions?.includes(permission) || false;
  };

  // Obtener nivel de experiencia del usuario
  const getExperienceLevel = () => {
    return state.user?.profile?.experienceLevel || 'beginner';
  };

  // Verificar si el email está verificado
  const isEmailVerified = () => {
    return state.user?.emailVerified || false;
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Acciones
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
    
    // Utilidades
    hasRole,
    hasPermission,
    getExperienceLevel,
    isEmailVerified,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;