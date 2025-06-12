// hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

export const useProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [measurements, setMeasurements] = useState({
    current: {},
    history: [],
    goals: {}
  });
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});

  // Cargar datos del perfil
  const loadProfileData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [
        profileResponse,
        measurementsResponse,
        goalsResponse,
        achievementsResponse,
        statsResponse
      ] = await Promise.all([
        userService.getProfile(),
        userService.getMeasurements(),
        userService.getGoals(),
        userService.getAchievements(),
        userService.getStats()
      ]);

      setProfileData(profileResponse.data);
      setMeasurements({
        current: measurementsResponse.data.current || {},
        history: measurementsResponse.data.history || [],
        goals: measurementsResponse.data.goals || {}
      });
      setGoals(goalsResponse.data || []);
      setAchievements(achievementsResponse.data || []);
      setStats(statsResponse.data || {});

    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Actualizar perfil
  const updateProfile = useCallback(async (profileUpdates) => {
    try {
      const response = await userService.updateProfile(profileUpdates);
      setProfileData(prev => ({ ...prev, ...response.data }));
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, []);

  // Actualizar medidas actuales
  const updateMeasurements = useCallback(async (measurementUpdates) => {
    try {
      const response = await userService.updateMeasurements(measurementUpdates);
      setMeasurements(prev => ({
        ...prev,
        current: { ...prev.current, ...response.data },
        history: [...prev.history, response.data]
      }));
      
      // Verificar si se desbloquearon nuevos logros
      checkForNewAchievements(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error updating measurements:', error);
      throw error;
    }
  }, []);

  // Agregar nueva medición
  const addMeasurement = useCallback(async (measurementData) => {
    try {
      const response = await userService.addMeasurement(measurementData);
      setMeasurements(prev => ({
        ...prev,
        current: response.data,
        history: [...prev.history, response.data]
      }));
      
      checkForNewAchievements(response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding measurement:', error);
      throw error;
    }
  }, []);

  // Actualizar objetivos
  const updateGoals = useCallback(async (goalsUpdates) => {
    try {
      const response = await userService.updateGoals(goalsUpdates);
      setGoals(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating goals:', error);
      throw error;
    }
  }, []);

  // Agregar nuevo objetivo
  const addGoal = useCallback(async (goalData) => {
    try {
      const response = await userService.addGoal(goalData);
      setGoals(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  }, []);

  // Actualizar objetivo específico
  const updateGoal = useCallback(async (goalId, goalUpdates) => {
    try {
      const response = await userService.updateGoal(goalId, goalUpdates);
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...response.data } : goal
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }, []);

  // Eliminar objetivo
  const deleteGoal = useCallback(async (goalId) => {
    try {
      await userService.deleteGoal(goalId);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }, []);

  // Compartir logro
  const shareAchievement = useCallback(async (achievement) => {
    try {
      const response = await userService.shareAchievement(achievement.id);
      
      // Actualizar el logro como compartido
      setAchievements(prev => prev.map(a => 
        a.id === achievement.id ? { ...a, shared: true, sharedAt: new Date().toISOString() } : a
      ));
      
      return response.data;
    } catch (error) {
      console.error('Error sharing achievement:', error);
      throw error;
    }
  }, []);

  // Verificar nuevos logros basados en las medidas/stats
  const checkForNewAchievements = useCallback(async (newData) => {
    try {
      const response = await userService.checkAchievements(newData);
      
      if (response.data.newAchievements?.length > 0) {
        // Agregar nuevos logros
        setAchievements(prev => [
          ...prev,
          ...response.data.newAchievements.map(a => ({ ...a, isNew: true }))
        ]);
        
        // Mostrar notificación
        response.data.newAchievements.forEach(achievement => {
          toast.success(`¡Nuevo logro desbloqueado: ${achievement.title}!`, {
            duration: 5000,
            icon: '🏆'
          });
        });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, []);

  // Calcular progreso de objetivos
  const calculateGoalProgress = useCallback((goal) => {
    if (!goal.targetKey || !goal.targetValue) return 0;
    
    let currentValue = measurements.current[goal.targetKey] || stats[goal.targetKey] || 0;
    
    if (goal.type === 'time') {
      // Para objetivos de tiempo, menor es mejor
      return goal.currentValue ? Math.max(0, 100 - ((goal.currentValue - goal.targetValue) / goal.targetValue) * 100) : 0;
    }
    
    if (goal.isReduction) {
      // Para objetivos de reducción (peso, grasa corporal)
      const totalReduction = goal.startValue - goal.targetValue;
      const currentReduction = goal.startValue - currentValue;
      return totalReduction > 0 ? Math.min(100, (currentReduction / totalReduction) * 100) : 0;
    }
    
    // Para objetivos de incremento
    return goal.startValue ? Math.min(100, ((currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100) : 0;
  }, [measurements.current, stats]);

  // Obtener métricas de progreso
  const getProgressMetrics = useCallback(() => {
    const completedGoals = goals.filter(goal => calculateGoalProgress(goal) >= 100).length;
    const totalGoals = goals.length;
    const averageProgress = totalGoals > 0 
      ? goals.reduce((sum, goal) => sum + calculateGoalProgress(goal), 0) / totalGoals 
      : 0;

    const earnedAchievements = achievements.filter(a => a.earned).length;
    const totalAchievements = achievements.length;
    const achievementProgress = totalAchievements > 0 
      ? (earnedAchievements / totalAchievements) * 100 
      : 0;

    return {
      goals: {
        completed: completedGoals,
        total: totalGoals,
        averageProgress: Math.round(averageProgress)
      },
      achievements: {
        earned: earnedAchievements,
        total: totalAchievements,
        progress: Math.round(achievementProgress)
      },
      overall: {
        score: Math.round((averageProgress + achievementProgress) / 2)
      }
    };
  }, [goals, achievements, calculateGoalProgress]);

  // Obtener tendencias de medidas
  const getMeasurementTrends = useCallback(() => {
    if (measurements.history.length < 2) return {};

    const trends = {};
    const recent = measurements.history.slice(-30); // Últimos 30 registros
    
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      
      ['weight', 'bodyFat', 'muscleMass'].forEach(metric => {
        if (first[metric] && last[metric]) {
          const change = last[metric] - first[metric];
          const percentChange = (change / first[metric]) * 100;
          
          trends[metric] = {
            change,
            percentChange,
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
            isPositive: metric === 'bodyFat' ? change < 0 : change > 0
          };
        }
      });
    }
    
    return trends;
  }, [measurements.history]);

  // Exportar datos del perfil
  const exportProfileData = useCallback(async () => {
    try {
      const response = await userService.exportData();
      
      // Crear y descargar archivo
      const blob = new Blob([JSON.stringify({
        profile: profileData,
        measurements,
        goals,
        achievements,
        stats,
        exportDate: new Date().toISOString()
      }, null, 2)], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `controlfit-profile-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Datos exportados correctamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar los datos');
    }
  }, [profileData, measurements, goals, achievements, stats]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Marcar logros como vistos después de un tiempo
  useEffect(() => {
    const timer = setTimeout(() => {
      setAchievements(prev => prev.map(a => ({ ...a, isNew: false })));
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [achievements]);

  return {
    // Datos
    profileData,
    measurements,
    goals,
    achievements,
    stats,
    loading,
    
    // Métricas calculadas
    progressMetrics: getProgressMetrics(),
    measurementTrends: getMeasurementTrends(),
    
    // Acciones
    updateProfile,
    updateMeasurements,
    addMeasurement,
    updateGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    shareAchievement,
    calculateGoalProgress,
    exportProfileData,
    
    // Utilidades
    refreshData: loadProfileData
  };
};

export default useProfile;