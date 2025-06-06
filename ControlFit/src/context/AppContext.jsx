// frontend/src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { workoutService, analyticsService } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Estado inicial
const initialState = {
  // Configuración de la app
  theme: 'light',
  units: 'metric', // metric | imperial
  language: 'es',
  
  // Datos de entrenamiento
  workoutTemplates: [],
  exercises: [],
  currentWorkout: null,
  
  // Analytics y estadísticas
  dashboardStats: null,
  bodyFatHistory: [],
  progressionData: {},
  
  // Estados de carga
  loading: {
    templates: false,
    exercises: false,
    analytics: false,
    bodyFat: false,
  },
  
  // Configuraciones de usuario
  preferences: {
    notifications: true,
    autoSave: true,
    showTips: true,
    defaultRestTime: 60, // segundos
    defaultSets: 3,
    defaultReps: 10,
  },
  
  // Cache de datos
  cache: {
    lastUpdated: null,
    exercises: null,
    analytics: null,
  },
  
  // Errores
  errors: {},
};

// Tipos de acciones
const APP_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_UNITS: 'SET_UNITS',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_PREFERENCES: 'SET_PREFERENCES',
  
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  SET_WORKOUT_TEMPLATES: 'SET_WORKOUT_TEMPLATES',
  ADD_WORKOUT_TEMPLATE: 'ADD_WORKOUT_TEMPLATE',
  UPDATE_WORKOUT_TEMPLATE: 'UPDATE_WORKOUT_TEMPLATE',
  DELETE_WORKOUT_TEMPLATE: 'DELETE_WORKOUT_TEMPLATE',
  
  SET_EXERCISES: 'SET_EXERCISES',
  ADD_EXERCISE: 'ADD_EXERCISE',
  UPDATE_EXERCISE: 'UPDATE_EXERCISE',
  
  SET_CURRENT_WORKOUT: 'SET_CURRENT_WORKOUT',
  UPDATE_CURRENT_WORKOUT: 'UPDATE_CURRENT_WORKOUT',
  
  SET_DASHBOARD_STATS: 'SET_DASHBOARD_STATS',
  SET_BODY_FAT_HISTORY: 'SET_BODY_FAT_HISTORY',
  SET_PROGRESSION_DATA: 'SET_PROGRESSION_DATA',
  
  UPDATE_CACHE: 'UPDATE_CACHE',
};

// Reducer para manejar el estado de la aplicación
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };

    case APP_ACTIONS.SET_UNITS:
      return { ...state, units: action.payload };

    case APP_ACTIONS.SET_LANGUAGE:
      return { ...state, language: action.payload };

    case APP_ACTIONS.SET_PREFERENCES:
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload } 
      };

    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, ...action.payload },
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.error },
      };

    case APP_ACTIONS.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return { ...state, errors: newErrors };

    case APP_ACTIONS.SET_WORKOUT_TEMPLATES:
      return { ...state, workoutTemplates: action.payload };

    case APP_ACTIONS.ADD_WORKOUT_TEMPLATE:
      return {
        ...state,
        workoutTemplates: [...state.workoutTemplates, action.payload],
      };

    case APP_ACTIONS.UPDATE_WORKOUT_TEMPLATE:
      return {
        ...state,
        workoutTemplates: state.workoutTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      };

    case APP_ACTIONS.DELETE_WORKOUT_TEMPLATE:
      return {
        ...state,
        workoutTemplates: state.workoutTemplates.filter(
          template => template.id !== action.payload
        ),
      };

    case APP_ACTIONS.SET_EXERCISES:
      return { ...state, exercises: action.payload };

    case APP_ACTIONS.ADD_EXERCISE:
      return {
        ...state,
        exercises: [...state.exercises, action.payload],
      };

    case APP_ACTIONS.UPDATE_EXERCISE:
      return {
        ...state,
        exercises: state.exercises.map(exercise =>
          exercise.id === action.payload.id ? action.payload : exercise
        ),
      };

    case APP_ACTIONS.SET_CURRENT_WORKOUT:
      return { ...state, currentWorkout: action.payload };

    case APP_ACTIONS.UPDATE_CURRENT_WORKOUT:
      return {
        ...state,
        currentWorkout: { ...state.currentWorkout, ...action.payload },
      };

    case APP_ACTIONS.SET_DASHBOARD_STATS:
      return { ...state, dashboardStats: action.payload };

    case APP_ACTIONS.SET_BODY_FAT_HISTORY:
      return { ...state, bodyFatHistory: action.payload };

    case APP_ACTIONS.SET_PROGRESSION_DATA:
      return {
        ...state,
        progressionData: { ...state.progressionData, ...action.payload },
      };

    case APP_ACTIONS.UPDATE_CACHE:
      return {
        ...state,
        cache: { ...state.cache, ...action.payload },
      };

    default:
      return state;
  }
};

// Crear contexto
const AppContext = createContext();

// Provider del contexto
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Cargar configuraciones del usuario al autenticarse
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserPreferences();
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  // Cargar preferencias del usuario
  const loadUserPreferences = () => {
    if (user?.profile?.preferences) {
      const { units, language, notifications } = user.profile.preferences;
      
      dispatch({ type: APP_ACTIONS.SET_UNITS, payload: units || 'metric' });
      dispatch({ type: APP_ACTIONS.SET_LANGUAGE, payload: language || 'es' });
      dispatch({
        type: APP_ACTIONS.SET_PREFERENCES,
        payload: { notifications: notifications?.workoutReminders ?? true },
      });
    }
  };

  // Cargar datos iniciales
  const loadInitialData = async () => {
    await Promise.all([
      loadWorkoutTemplates(),
      loadExercises(),
      loadDashboardStats(),
    ]);
  };

  // Cambiar tema
  const setTheme = (theme) => {
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
    localStorage.setItem('asecgc_theme', theme);
    
    // Aplicar tema al DOM
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Cambiar unidades
  const setUnits = (units) => {
    dispatch({ type: APP_ACTIONS.SET_UNITS, payload: units });
    // Aquí podrías sincronizar con el backend
  };

  // Cambiar idioma
  const setLanguage = (language) => {
    dispatch({ type: APP_ACTIONS.SET_LANGUAGE, payload: language });
    // Aquí podrías cargar traducciones
  };

  // Actualizar preferencias
  const updatePreferences = (newPreferences) => {
    dispatch({
      type: APP_ACTIONS.SET_PREFERENCES,
      payload: newPreferences,
    });
    // Guardar en localStorage o sincronizar con backend
  };

  // Cargar plantillas de entrenamiento
  const loadWorkoutTemplates = async () => {
    try {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { templates: true } });
      
      const templates = await workoutService.getWorkoutTemplates();
      dispatch({ type: APP_ACTIONS.SET_WORKOUT_TEMPLATES, payload: templates });
      
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.SET_ERROR,
        payload: { key: 'templates', error: error.message },
      });
      toast.error('Error cargando plantillas de entrenamiento');
    } finally {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { templates: false } });
    }
  };

  // Crear plantilla de entrenamiento
  const createWorkoutTemplate = async (templateData) => {
    try {
      const newTemplate = await workoutService.createWorkoutTemplate(templateData);
      dispatch({ type: APP_ACTIONS.ADD_WORKOUT_TEMPLATE, payload: newTemplate });
      toast.success('Plantilla creada correctamente');
      return { success: true, template: newTemplate };
    } catch (error) {
      toast.error('Error creando plantilla');
      return { success: false, error: error.message };
    }
  };

  // Actualizar plantilla de entrenamiento
  const updateWorkoutTemplate = async (id, templateData) => {
    try {
      const updatedTemplate = await workoutService.updateWorkoutTemplate(id, templateData);
      dispatch({ type: APP_ACTIONS.UPDATE_WORKOUT_TEMPLATE, payload: updatedTemplate });
      toast.success('Plantilla actualizada correctamente');
      return { success: true, template: updatedTemplate };
    } catch (error) {
      toast.error('Error actualizando plantilla');
      return { success: false, error: error.message };
    }
  };

  // Eliminar plantilla de entrenamiento
  const deleteWorkoutTemplate = async (id) => {
    try {
      await workoutService.deleteWorkoutTemplate(id);
      dispatch({ type: APP_ACTIONS.DELETE_WORKOUT_TEMPLATE, payload: id });
      toast.success('Plantilla eliminada correctamente');
      return { success: true };
    } catch (error) {
      toast.error('Error eliminando plantilla');
      return { success: false, error: error.message };
    }
  };

  // Cargar ejercicios
  const loadExercises = async (category = '') => {
    try {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { exercises: true } });
      
      const exercises = await workoutService.getExercises(category);
      dispatch({ type: APP_ACTIONS.SET_EXERCISES, payload: exercises });
      
      dispatch({
        type: APP_ACTIONS.UPDATE_CACHE,
        payload: { exercises: Date.now() },
      });
      
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.SET_ERROR,
        payload: { key: 'exercises', error: error.message },
      });
      toast.error('Error cargando ejercicios');
    } finally {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { exercises: false } });
    }
  };

  // Crear ejercicio personalizado
  const createExercise = async (exerciseData) => {
    try {
      const newExercise = await workoutService.createExercise(exerciseData);
      dispatch({ type: APP_ACTIONS.ADD_EXERCISE, payload: newExercise });
      toast.success('Ejercicio creado correctamente');
      return { success: true, exercise: newExercise };
    } catch (error) {
      toast.error('Error creando ejercicio');
      return { success: false, error: error.message };
    }
  };

  // Iniciar entrenamiento
  const startWorkout = (template = null) => {
    const workout = {
      id: Date.now().toString(),
      templateId: template?.id || null,
      startTime: new Date(),
      exercises: template?.exercises || [],
      notes: '',
      completed: false,
    };
    
    dispatch({ type: APP_ACTIONS.SET_CURRENT_WORKOUT, payload: workout });
    return workout;
  };

  // Actualizar entrenamiento actual
  const updateCurrentWorkout = (updates) => {
    dispatch({ type: APP_ACTIONS.UPDATE_CURRENT_WORKOUT, payload: updates });
  };

  // Completar entrenamiento
  const completeWorkout = async () => {
    if (!state.currentWorkout) return { success: false, error: 'No hay entrenamiento activo' };

    try {
      const completedWorkout = {
        ...state.currentWorkout,
        endTime: new Date(),
        completed: true,
        duration: Math.round((new Date() - new Date(state.currentWorkout.startTime)) / 1000 / 60), // minutos
      };

      await workoutService.createWorkoutSession(completedWorkout);
      dispatch({ type: APP_ACTIONS.SET_CURRENT_WORKOUT, payload: null });
      
      toast.success('¡Entrenamiento completado!');
      return { success: true, workout: completedWorkout };
    } catch (error) {
      toast.error('Error guardando entrenamiento');
      return { success: false, error: error.message };
    }
  };

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async (timeframe = '30d') => {
    try {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { analytics: true } });
      
      const stats = await analyticsService.getDashboardStats(timeframe);
      dispatch({ type: APP_ACTIONS.SET_DASHBOARD_STATS, payload: stats });
      
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.SET_ERROR,
        payload: { key: 'analytics', error: error.message },
      });
    } finally {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { analytics: false } });
    }
  };

  // Cargar historial de grasa corporal
  const loadBodyFatHistory = async (timeframe = '6m') => {
    try {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { bodyFat: true } });
      
      const history = await analyticsService.getBodyCompositionTrends(timeframe);
      dispatch({ type: APP_ACTIONS.SET_BODY_FAT_HISTORY, payload: history });
      
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.SET_ERROR,
        payload: { key: 'bodyFat', error: error.message },
      });
    } finally {
      dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { bodyFat: false } });
    }
  };

  // Limpiar error específico
  const clearError = (errorKey) => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR, payload: errorKey });
  };

  // Convertir unidades
  const convertUnits = (value, from, to) => {
    if (from === to) return value;
    
    const conversions = {
      'kg-lb': (kg) => kg * 2.20462,
      'lb-kg': (lb) => lb / 2.20462,
      'cm-in': (cm) => cm / 2.54,
      'in-cm': (in_val) => in_val * 2.54,
    };
    
    const conversionKey = `${from}-${to}`;
    const converter = conversions[conversionKey];
    
    return converter ? converter(value) : value;
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Configuración
    setTheme,
    setUnits,
    setLanguage,
    updatePreferences,
    
    // Plantillas de entrenamiento
    loadWorkoutTemplates,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    
    // Ejercicios
    loadExercises,
    createExercise,
    
    // Entrenamientos
    startWorkout,
    updateCurrentWorkout,
    completeWorkout,
    
    // Analytics
    loadDashboardStats,
    loadBodyFatHistory,
    
    // Utilidades
    clearError,
    convertUnits,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook para usar el contexto
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  
  return context;
};

export default AppContext;