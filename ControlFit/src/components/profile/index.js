// components/profile/index.js
// Exportar todos los componentes de perfil

// Componentes principales de pestañas
export { default as MeasurementsTab } from './MeasurementsTab';
export { default as GoalsTab } from './GoalsTab';
export { default as AchievementsTab } from './AchievementsTab';

// Widgets y componentes auxiliares
export {
  QuickStatsWidget,
  GoalsProgressWidget,
  RecentAchievementsWidget,
  WorkoutConsistencyWidget,
  BodyMeasurementsWidget,
  ExportDataModal,
  WeeklyActivityHeatmap,
  ProgressComparisonWidget
} from './ProfileWidgets';

// Hook personalizado
export { default as useProfile } from '../hooks/useProfile';

// Tipos y constantes útiles
export const MEASUREMENT_TYPES = {
  WEIGHT: 'weight',
  BODY_FAT: 'bodyFat',
  MUSCLE_MASS: 'muscleMass',
  BMI: 'bmi',
  WAIST: 'waist',
  CHEST: 'chest',
  ARMS: 'arms',
  THIGHS: 'thighs',
  NECK: 'neck'
};

export const GOAL_CATEGORIES = {
  FITNESS: 'fitness',
  STRENGTH: 'strength',
  BODY: 'body',
  PERFORMANCE: 'performance',
  HABIT: 'habit'
};

export const GOAL_TYPES = {
  NUMERIC: 'numeric',
  BOOLEAN: 'boolean',
  TIME: 'time',
  PERCENTAGE: 'percentage'
};

export const ACHIEVEMENT_CATEGORIES = {
  MILESTONE: 'milestone',
  CONSISTENCY: 'consistency',
  STRENGTH: 'strength',
  ENDURANCE: 'endurance',
  PROGRESS: 'progress',
  SPECIAL: 'special'
};

export const ACHIEVEMENT_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  LEGENDARY: 'legendary'
};

export const EXPERIENCE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Utilidades y helpers
export const profileUtils = {
  /**
   * Calcular la edad a partir de la fecha de nacimiento
   */
  calculateAge: (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  },

  /**
   * Calcular IMC
   */
  calculateBMI: (weight, height) => {
    if (!weight || !height) return null;
    const heightInM = height / 100;
    return parseFloat((weight / (heightInM * heightInM)).toFixed(1));
  },

  /**
   * Clasificar IMC
   */
  classifyBMI: (bmi) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-600 bg-blue-100', risk: 'low' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600 bg-green-100', risk: 'normal' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600 bg-yellow-100', risk: 'moderate' };
    return { label: 'Obesidad', color: 'text-red-600 bg-red-100', risk: 'high' };
  },

  /**
   * Obtener color para nivel de experiencia
   */
  getExperienceLevelColor: (level) => {
    switch (level) {
      case EXPERIENCE_LEVELS.BEGINNER: 
        return 'bg-green-100 text-green-800';
      case EXPERIENCE_LEVELS.INTERMEDIATE: 
        return 'bg-yellow-100 text-yellow-800';
      case EXPERIENCE_LEVELS.ADVANCED: 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Formatear medida con unidad
   */
  formatMeasurement: (value, type) => {
    if (value === null || value === undefined) return '—';
    
    const units = {
      [MEASUREMENT_TYPES.WEIGHT]: 'kg',
      [MEASUREMENT_TYPES.BODY_FAT]: '%',
      [MEASUREMENT_TYPES.MUSCLE_MASS]: 'kg',
      [MEASUREMENT_TYPES.BMI]: '',
      [MEASUREMENT_TYPES.WAIST]: 'cm',
      [MEASUREMENT_TYPES.CHEST]: 'cm',
      [MEASUREMENT_TYPES.ARMS]: 'cm',
      [MEASUREMENT_TYPES.THIGHS]: 'cm',
      [MEASUREMENT_TYPES.NECK]: 'cm'
    };
    
    return `${value}${units[type] || ''}`;
  },

  /**
   * Calcular progreso de objetivo
   */
  calculateGoalProgress: (goal, currentValue) => {
    if (!goal.targetValue || currentValue === null || currentValue === undefined) return 0;
    
    if (goal.type === GOAL_TYPES.TIME) {
      // Para objetivos de tiempo, menor es mejor
      return currentValue ? Math.max(0, 100 - ((currentValue - goal.targetValue) / goal.targetValue) * 100) : 0;
    }
    
    if (goal.isReduction) {
      // Para objetivos de reducción (peso, grasa corporal)
      const totalReduction = goal.startValue - goal.targetValue;
      const currentReduction = goal.startValue - currentValue;
      return totalReduction > 0 ? Math.min(100, (currentReduction / totalReduction) * 100) : 0;
    }
    
    // Para objetivos de incremento
    if (goal.startValue) {
      return Math.min(100, ((currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100);
    }
    
    return Math.min(100, (currentValue / goal.targetValue) * 100);
  },

  /**
   * Obtener estado del objetivo
   */
  getGoalStatus: (goal, currentValue) => {
    const progress = profileUtils.calculateGoalProgress(goal, currentValue);
    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    
    if (progress >= 100) return { 
      label: 'Completado', 
      color: 'bg-green-100 text-green-700', 
      priority: 'high' 
    };
    if (daysLeft !== null && daysLeft < 0) return { 
      label: 'Vencido', 
      color: 'bg-red-100 text-red-700', 
      priority: 'urgent' 
    };
    if (daysLeft !== null && daysLeft <= 7) return { 
      label: 'Urgente', 
      color: 'bg-orange-100 text-orange-700', 
      priority: 'high' 
    };
    if (progress >= 75) return { 
      label: 'Casi listo', 
      color: 'bg-blue-100 text-blue-700', 
      priority: 'medium' 
    };
    return { 
      label: 'En progreso', 
      color: 'bg-gray-100 text-gray-700', 
      priority: 'low' 
    };
  },

  /**
   * Validar datos de mediciones
   */
  validateMeasurementData: (data) => {
    const errors = {};
    
    if (data.weight && (data.weight < 30 || data.weight > 300)) {
      errors.weight = 'El peso debe estar entre 30 y 300 kg';
    }
    
    if (data.height && (data.height < 100 || data.height > 250)) {
      errors.height = 'La altura debe estar entre 100 y 250 cm';
    }
    
    if (data.bodyFat && (data.bodyFat < 3 || data.bodyFat > 50)) {
      errors.bodyFat = 'El porcentaje de grasa debe estar entre 3% y 50%';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Generar recomendaciones basadas en datos
   */
  generateRecommendations: (profile, measurements, goals, achievements) => {
    const recommendations = [];
    
    // Recomendaciones basadas en IMC
    if (measurements.current.weight && measurements.current.height) {
      const bmi = profileUtils.calculateBMI(measurements.current.weight, measurements.current.height);
      const classification = profileUtils.classifyBMI(bmi);
      
      if (classification.risk !== 'normal') {
        recommendations.push({
          type: 'health',
          priority: classification.risk === 'high' ? 'urgent' : 'medium',
          title: 'Revisar composición corporal',
          message: `Tu IMC indica ${classification.label.toLowerCase()}. Considera consultar con un profesional.`,
          action: 'Ver objetivos de peso'
        });
      }
    }
    
    // Recomendaciones basadas en objetivos
    const staleGoals = goals.filter(goal => {
      const daysSinceUpdate = Math.floor((new Date() - new Date(goal.updatedAt)) / (1000 * 60 * 60 * 24));
      return daysSinceUpdate > 30;
    });
    
    if (staleGoals.length > 0) {
      recommendations.push({
        type: 'goals',
        priority: 'medium',
        title: 'Actualizar objetivos',
        message: `Tienes ${staleGoals.length} objetivo(s) sin actualizar en más de 30 días.`,
        action: 'Revisar objetivos'
      });
    }
    
    // Recomendaciones basadas en mediciones
    const daysSinceLastMeasurement = measurements.current.lastUpdated 
      ? Math.floor((new Date() - new Date(measurements.current.lastUpdated)) / (1000 * 60 * 60 * 24))
      : Infinity;
    
    if (daysSinceLastMeasurement > 14) {
      recommendations.push({
        type: 'measurements',
        priority: 'low',
        title: 'Actualizar medidas',
        message: 'Han pasado más de 2 semanas desde tu última medición.',
        action: 'Agregar medición'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
};

// Configuraciones por defecto
export const DEFAULT_MEASUREMENT_CONFIG = {
  weight: { min: 30, max: 300, step: 0.1, required: true },
  height: { min: 100, max: 250, step: 1, required: true },
  bodyFat: { min: 3, max: 50, step: 0.1, required: false },
  muscleMass: { min: 10, max: 100, step: 0.1, required: false },
  waist: { min: 50, max: 150, step: 0.5, required: false },
  chest: { min: 60, max: 200, step: 0.5, required: false },
  arms: { min: 20, max: 60, step: 0.5, required: false },
  thighs: { min: 30, max: 100, step: 0.5, required: false },
  neck: { min: 25, max: 60, step: 0.5, required: false }
};

export const DEFAULT_GOAL_TEMPLATES = [
  {
    id: 'weight_loss',
    title: 'Perder Peso',
    category: GOAL_CATEGORIES.BODY,
    type: GOAL_TYPES.NUMERIC,
    unit: 'kg',
    isReduction: true,
    description: 'Reducir peso corporal de forma saludable'
  },
  {
    id: 'muscle_gain',
    title: 'Ganar Masa Muscular',
    category: GOAL_CATEGORIES.BODY,
    type: GOAL_TYPES.NUMERIC,
    unit: 'kg',
    isReduction: false,
    description: 'Incrementar masa muscular magra'
  },
  {
    id: 'body_fat_reduction',
    title: 'Reducir Grasa Corporal',
    category: GOAL_CATEGORIES.BODY,
    type: GOAL_TYPES.NUMERIC,
    unit: '%',
    isReduction: true,
    description: 'Disminuir porcentaje de grasa corporal'
  },
  {
    id: 'workout_frequency',
    title: 'Frecuencia de Entrenamiento',
    category: GOAL_CATEGORIES.FITNESS,
    type: GOAL_TYPES.NUMERIC,
    unit: 'días/semana',
    isReduction: false,
    description: 'Mantener consistencia en el entrenamiento'
  }
];

// Configuración de logros predefinidos
export const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first_workout',
    title: 'Primera Sesión',
    description: 'Completaste tu primer entrenamiento',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    level: ACHIEVEMENT_LEVELS.BRONZE,
    criteria: { workouts: 1 },
    points: 10
  },
  {
    id: 'week_streak',
    title: 'Racha Semanal',
    description: '7 días consecutivos entrenando',
    category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
    level: ACHIEVEMENT_LEVELS.SILVER,
    criteria: { streak: 7 },
    points: 25
  },
  {
    id: 'first_pr',
    title: 'Primer Récord',
    description: 'Tu primer récord personal',
    category: ACHIEVEMENT_CATEGORIES.STRENGTH,
    level: ACHIEVEMENT_LEVELS.BRONZE,
    criteria: { personalRecords: 1 },
    points: 15
  },
  {
    id: 'centurion',
    title: 'Centurión',
    description: '100 entrenamientos completados',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    level: ACHIEVEMENT_LEVELS.GOLD,
    criteria: { workouts: 100 },
    points: 100
  }
];

export default {
  MeasurementsTab,
  GoalsTab,
  AchievementsTab,
  useProfile,
  profileUtils,
  MEASUREMENT_TYPES,
  GOAL_CATEGORIES,
  GOAL_TYPES,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_LEVELS,
  EXPERIENCE_LEVELS,
  DEFAULT_MEASUREMENT_CONFIG,
  DEFAULT_GOAL_TEMPLATES,
  DEFAULT_ACHIEVEMENTS
};