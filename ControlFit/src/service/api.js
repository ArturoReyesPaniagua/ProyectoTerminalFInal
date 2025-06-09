// frontend/src/services/api.js
import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      tokenUtils.removeToken();
      userUtils.removeUser();
      window.location.href = '/login';
    }
    
    // Formatear error para uso consistente
    const formattedError = {
      message: error.response?.data?.error || error.message || 'Error desconocido',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
    
    return Promise.reject(formattedError);
  }
);

// ===============================
// UTILIDADES DE TOKEN
// ===============================
export const tokenUtils = {
  getToken: () => localStorage.getItem('asecgc_token'),
  
  setToken: (token) => localStorage.setItem('asecgc_token', token),
  
  removeToken: () => localStorage.removeItem('asecgc_token'),
  
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },
};

// ===============================
// UTILIDADES DE USUARIO
// ===============================
export const userUtils = {
  getUser: () => {
    const user = localStorage.getItem('asecgc_user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user) => localStorage.setItem('asecgc_user', JSON.stringify(user)),
  
  removeUser: () => localStorage.removeItem('asecgc_user'),
};

// ===============================
// SERVICIOS DE AUTENTICACIÓN
// ===============================
export const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return await api.post('/auth/reset-password', { token, newPassword });
  },

  verifyToken: async () => {
    return await api.get('/auth/verify-token');
  },

  changePassword: async (currentPassword, newPassword) => {
    return await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  refreshToken: async () => {
    return await api.post('/auth/refresh-token');
  },
};

// ===============================
// SERVICIOS DE USUARIO
// ===============================
export const userService = {
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  updateBodyMeasurements: async (measurements) => {
    return await api.post('/users/body-measurements', measurements);
  },

  getBodyMeasurements: async (limit = 10) => {
    return await api.get(`/users/body-measurements?limit=${limit}`);
  },

  calculateBodyFat: async (measurements, method = 'composite') => {
    return await api.post('/users/calculate-body-fat', { measurements, method });
  },

  getBodyFatHistory: async (timeframe = '6m') => {
    return await api.get(`/users/body-fat-history?timeframe=${timeframe}`);
  },

  deleteAccount: async () => {
    return await api.delete('/users/account');
  },

  exportData: async () => {
    const response = await api.get('/users/export-data', {
      responseType: 'blob',
    });
    return response;
  },
};

// ===============================
// SERVICIOS DE ENTRENAMIENTOS
// ===============================
export const workoutService = {
  // Plantillas
  getWorkoutTemplates: async () => {
    return await api.get('/workouts/templates');
  },

  getWorkoutTemplate: async (id) => {
    return await api.get(`/workouts/templates/${id}`);
  },

  createWorkoutTemplate: async (templateData) => {
    return await api.post('/workouts/templates', templateData);
  },

  updateWorkoutTemplate: async (id, templateData) => {
    return await api.put(`/workouts/templates/${id}`, templateData);
  },

  deleteWorkoutTemplate: async (id) => {
    return await api.delete(`/workouts/templates/${id}`);
  },

  duplicateWorkoutTemplate: async (id) => {
    return await api.post(`/workouts/templates/${id}/duplicate`);
  },

  // Sesiones
  getWorkoutSessions: async (page = 1, limit = 20) => {
    return await api.get(`/workouts/sessions?page=${page}&limit=${limit}`);
  },

  getWorkoutSession: async (id) => {
    return await api.get(`/workouts/sessions/${id}`);
  },

  createWorkoutSession: async (sessionData) => {
    return await api.post('/workouts/sessions', sessionData);
  },

  updateWorkoutSession: async (id, sessionData) => {
    return await api.put(`/workouts/sessions/${id}`, sessionData);
  },

  deleteWorkoutSession: async (id) => {
    return await api.delete(`/workouts/sessions/${id}`);
  },

  getRecentSessions: async (limit = 5) => {
    return await api.get(`/workouts/sessions/recent?limit=${limit}`);
  },

  // Ejercicios
  getExercises: async (category = '', muscleGroup = '') => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (muscleGroup) params.append('muscleGroup', muscleGroup);
    
    return await api.get(`/workouts/exercises?${params}`);
  },

  createExercise: async (exerciseData) => {
    return await api.post('/workouts/exercises', exerciseData);
  },

  updateExercise: async (id, exerciseData) => {
    return await api.put(`/workouts/exercises/${id}`, exerciseData);
  },

  deleteExercise: async (id) => {
    return await api.delete(`/workouts/exercises/${id}`);
  },

  getExerciseCategories: async () => {
    return await api.get('/workouts/exercises/categories');
  },

  getMuscleGroups: async () => {
    return await api.get('/workouts/exercises/muscle-groups');
  },

  // Progresión y cálculos
  calculateProgression: async (exerciseId, userLevel = 'intermediate') => {
    return await api.post('/workouts/calculate-progression', {
      exerciseId,
      userLevel,
    });
  },

  calculate1RM: async (weight, reps, method = 'composite') => {
    return await api.post('/workouts/calculate-1rm', {
      weight,
      reps,
      method,
    });
  },

  get1RMHistory: async (exerciseId) => {
    return await api.get(`/workouts/1rm-history/${exerciseId}`);
  },

  getProgressionHistory: async (exerciseId, timeframe = '3m') => {
    return await api.get(`/workouts/progression-history/${exerciseId}?timeframe=${timeframe}`);
  },

  // Estadísticas
  getWorkoutStats: async (timeframe = '30d') => {
    return await api.get(`/workouts/stats?timeframe=${timeframe}`);
  },
};

// ===============================
// SERVICIOS DE ANALYTICS
// ===============================
export const analyticsService = {
  getDashboardStats: async (timeframe = '30d') => {
    return await api.get(`/analytics/dashboard?timeframe=${timeframe}`);
  },

  getProgressionAnalytics: async (exerciseIds, timeframe = '6m') => {
    return await api.post('/analytics/progression', {
      exerciseIds,
      timeframe,
    });
  },

  getBodyCompositionTrends: async (timeframe = '6m') => {
    return await api.get(`/analytics/body-composition?timeframe=${timeframe}`);
  },

  getWorkoutConsistency: async (timeframe = '3m') => {
    return await api.get(`/analytics/consistency?timeframe=${timeframe}`);
  },

  getStrengthAnalysis: async (exerciseId, timeframe = '6m') => {
    return await api.get(`/analytics/strength/${exerciseId}?timeframe=${timeframe}`);
  },

  getVolumeProgression: async (timeframe = '30d', exerciseId = null) => {
    const params = new URLSearchParams({ timeframe });
    if (exerciseId) params.append('exerciseId', exerciseId);
    
    return await api.get(`/analytics/volume-progression?${params}`);
  },

  getRecommendations: async () => {
    return await api.get('/analytics/recommendations');
  },

  getAchievements: async () => {
    return await api.get('/analytics/achievements');
  },

  getWeeklySummary: async () => {
    return await api.get('/analytics/weekly-summary');
  },

  getMonthlyTrends: async (months = 6) => {
    return await api.get(`/analytics/monthly-trends?months=${months}`);
  },

  getPersonalRecords: async () => {
    return await api.get('/analytics/personal-records');
  },
};

// ===============================
// UTILIDADES DE CONVERSIÓN
// ===============================
export const conversionUtils = {
  kgToLb: (kg) => kg * 2.20462,
  lbToKg: (lb) => lb / 2.20462,
  cmToIn: (cm) => cm / 2.54,
  inToCm: (inches) => inches * 2.54,
  cmToFt: (cm) => cm / 30.48,
  ftToCm: (ft) => ft * 30.48,

  formatWeight: (weight, unit = 'kg') => {
    if (!weight) return '0';
    const formatted = weight.toFixed(1);
    return `${formatted} ${unit}`;
  },

  formatHeight: (height, unit = 'cm') => {
    if (!height) return '0';
    if (unit === 'ft') {
      const feet = Math.floor(height / 30.48);
      const inches = Math.round((height % 30.48) / 2.54);
      return `${feet}'${inches}"`;
    }
    return `${height.toFixed(0)} ${unit}`;
  },

  formatDuration: (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  },
};

// ===============================
// UTILIDADES DE FECHA
// ===============================
export const dateUtils = {
  formatDate: (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };
    
    return new Date(date).toLocaleDateString('es-ES', defaultOptions);
  },

  formatDateTime: (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  formatTimeAgo: (date) => {
    if (!date) return '';
    
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return dateUtils.formatDate(date);
  },

  getWeekRange: (date = new Date()) => {
    const currentDate = new Date(date);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Lunes
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
    
    return { start: startOfWeek, end: endOfWeek };
  },

  isToday: (date) => {
    const today = new Date();
    const compareDate = new Date(date);
    
    return today.toDateString() === compareDate.toDateString();
  },

  isSameWeek: (date1, date2) => {
    const week1 = dateUtils.getWeekRange(date1);
    const week2 = dateUtils.getWeekRange(date2);
    
    return week1.start.getTime() === week2.start.getTime();
  },
};

// ===============================
// UTILIDADES DE VALIDACIÓN
// ===============================
export const validationUtils = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  },

  isValidWeight: (weight, min = 20, max = 300) => {
    const num = parseFloat(weight);
    return !isNaN(num) && num >= min && num <= max;
  },

  isValidHeight: (height, min = 100, max = 250) => {
    const num = parseFloat(height);
    return !isNaN(num) && num >= min && num <= max;
  },

  isValidAge: (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    
    return age >= 13 && age <= 120;
  },
};

// ===============================
// CONFIGURACIÓN DE DESARROLLO
// ===============================
if (import.meta.env.DEV) {
  // Habilitar logging en desarrollo
  api.interceptors.request.use(
    (config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
      return config;
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response);
      return response;
    },
    (error) => {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
      return Promise.reject(error);
    }
  );
}

export default api;