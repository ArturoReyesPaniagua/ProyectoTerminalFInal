// backend/src/models/Workout.js



class WorkoutTemplateModel {
  constructor(data = {}) {
    // Identificación básica
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.createdBy = data.createdBy || null; // UID del usuario
    
    // Configuración de la plantilla
    this.exercises = data.exercises || []; // Array de ExerciseInTemplate
    this.tags = data.tags || []; // Etiquetas para categorización
    this.difficulty = data.difficulty || 'beginner'; // 'beginner', 'intermediate', 'advanced'
    this.category = data.category || 'general'; // 'strength', 'cardio', 'mixed', 'sport_specific', etc.
    this.focus = data.focus || []; // Áreas de enfoque: ['upper_body', 'lower_body', 'full_body', 'core']
    
    // Estimaciones y configuración
    this.estimatedDuration = data.estimatedDuration || 60; // minutos
    this.estimatedCalories = data.estimatedCalories || null;
    this.recommendedFrequency = data.recommendedFrequency || 'weekly'; // 'daily', 'weekly', 'biweekly'
    this.restBetweenExercises = data.restBetweenExercises || 60; // segundos
    
    // Configuración de progresión
    this.progressionScheme = data.progressionScheme || 'linear'; // 'linear', 'undulating', 'block'
    this.autoProgression = data.autoProgression ?? true;
    this.progressionRate = data.progressionRate || 'normal'; // 'slow', 'normal', 'fast'
    
    // Equipamiento requerido
    this.requiredEquipment = data.requiredEquipment || []; // Array de equipamiento necesario
    this.environment = data.environment || 'gym'; // 'gym', 'home', 'outdoor'
    this.spaceRequired = data.spaceRequired || 'medium'; // 'small', 'medium', 'large'
    
    // Metadatos de uso
    this.timesUsed = data.timesUsed || 0;
    this.averageRating = data.averageRating || 0;
    this.totalRatings = data.totalRatings || 0;
    this.lastUsed = data.lastUsed || null;
    
    // Estado y configuración
    this.isActive = data.isActive ?? true;
    this.isPublic = data.isPublic ?? false;
    this.isSystemTemplate = data.isSystemTemplate ?? false;
    this.isVerified = data.isVerified ?? false;
    
    // Metadatos
    this.metadata = {
      createdAt: data.metadata?.createdAt || new Date(),
      updatedAt: data.metadata?.updatedAt || new Date(),
      version: data.metadata?.version || '1.0.0',
      source: data.metadata?.source || 'user'
    };
  }

  // Métodos de validación
  isValid() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Nombre de la plantilla es requerido');
    }
    
    if (this.name && this.name.length > 100) {
      errors.push('Nombre debe tener máximo 100 caracteres');
    }
    
    if (!this.exercises || this.exercises.length === 0) {
      errors.push('Debe incluir al menos un ejercicio');
    }
    
    // Validar cada ejercicio
    this.exercises.forEach((exercise, index) => {
      const exerciseErrors = ExerciseInTemplateModel.validate(exercise);
      if (exerciseErrors.length > 0) {
        errors.push(`Ejercicio ${index + 1}: ${exerciseErrors.join(', ')}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Métodos de utilidad
  getTotalEstimatedTime() {
    const exerciseTime = this.exercises.reduce((total, exercise) => {
      const setTime = exercise.sets.length * 30; // 30 segundos promedio por serie
      const restTime = (exercise.sets.length - 1) * (exercise.restTime || 60);
      return total + setTime + restTime;
    }, 0);
    
    const betweenExerciseRest = (this.exercises.length - 1) * this.restBetweenExercises;
    return Math.round((exerciseTime + betweenExerciseRest) / 60); // convertir a minutos
  }

  getMuscleGroupsWorked() {
    const muscleGroups = new Set();
    this.exercises.forEach(exercise => {
      if (exercise.muscleGroups) {
        exercise.muscleGroups.forEach(group => muscleGroups.add(group));
      }
    });
    return Array.from(muscleGroups);
  }

  getRequiredEquipment() {
    const equipment = new Set();
    this.exercises.forEach(exercise => {
      if (exercise.equipment) {
        equipment.add(exercise.equipment);
      }
    });
    return Array.from(equipment);
  }

  canBePerformedAt(environment) {
    if (this.environment === 'any') return true;
    return this.environment === environment;
  }

  // Métodos para preparar datos
  toFirestore() {
    const data = { ...this };
    if (data.id) delete data.id;
    return data;
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    return new WorkoutTemplateModel({
      id: doc.id,
      ...doc.data()
    });
  }
}

class ExerciseInTemplateModel {
  constructor(data = {}) {
    this.exerciseId = data.exerciseId || '';
    this.name = data.name || ''; // Cache del nombre para mostrar
    this.order = data.order || 0; // Orden en la rutina
    this.sets = data.sets || []; // Array de SetTemplate
    this.restTime = data.restTime || 60; // segundos entre series
    this.notes = data.notes || '';
    this.superset = data.superset || null; // ID del superset si aplica
    this.tempo = data.tempo || null; // Tempo específico: "2-1-2-1"
    this.rpe = data.rpe || null; // RPE objetivo
    this.muscleGroups = data.muscleGroups || []; // Cache de grupos musculares
    this.equipment = data.equipment || ''; // Cache de equipamiento
  }

  static validate(exercise) {
    const errors = [];
    
    if (!exercise.exerciseId) {
      errors.push('ID de ejercicio es requerido');
    }
    
    if (!exercise.sets || exercise.sets.length === 0) {
      errors.push('Debe incluir al menos una serie');
    }
    
    exercise.sets?.forEach((set, index) => {
      if (set.type === 'normal' && (!set.reps || set.reps < 1)) {
        errors.push(`Serie ${index + 1}: repeticiones debe ser mayor a 0`);
      }
      
      if (set.type === 'timed' && (!set.duration || set.duration < 1)) {
        errors.push(`Serie ${index + 1}: duración debe ser mayor a 0`);
      }
    });
    
    return errors;
  }
}

class SetTemplateModel {
  constructor(data = {}) {
    this.type = data.type || 'normal'; // 'normal', 'warmup', 'dropset', 'rest_pause', 'timed'
    this.reps = data.reps || null; // número de repeticiones
    this.weight = data.weight || null; // peso en kg
    this.duration = data.duration || null; // duración en segundos (para ejercicios por tiempo)
    this.distance = data.distance || null; // distancia en metros (para cardio)
    this.intensity = data.intensity || null; // intensidad del 1-10
    this.rpe = data.rpe || null; // RPE específico para esta serie
    this.percentage1RM = data.percentage1RM || null; // porcentaje del 1RM
    this.isWarmup = data.isWarmup ?? false;
    this.notes = data.notes || '';
  }
}

class WorkoutSessionModel {
  constructor(data = {}) {
    // Identificación básica
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.name = data.name || '';
    this.templateId = data.templateId || null; // ID de la plantilla usada (si aplica)
    
    // Información de la sesión
    this.date = data.date || new Date();
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.duration = data.duration || 0; // minutos
    this.location = data.location || ''; // ubicación donde se realizó
    
    // Ejercicios realizados
    this.exercises = data.exercises || []; // Array de ExerciseInSession
    this.notes = data.notes || '';
    this.mood = data.mood || null; // estado de ánimo 1-10
    this.energy = data.energy || null; // nivel de energía 1-10
    this.motivation = data.motivation || null; // motivación 1-10
    
    // Estado de la sesión
    this.completed = data.completed ?? false;
    this.abandoned = data.abandoned ?? false;
    this.pausedAt = data.pausedAt || null;
    this.resumedAt = data.resumedAt || null;
    
    // Métricas calculadas
    this.metrics = {
      totalVolume: data.metrics?.totalVolume || 0,
      totalSets: data.metrics?.totalSets || 0,
      completedSets: data.metrics?.completedSets || 0,
      totalReps: data.metrics?.totalReps || 0,
      averageRPE: data.metrics?.averageRPE || 0,
      exercisesCompleted: data.metrics?.exercisesCompleted || 0,
      completionRate: data.metrics?.completionRate || 0,
      estimatedCalories: data.metrics?.estimatedCalories || 0,
      personalRecords: data.metrics?.personalRecords || []
    };
    
    // Condiciones ambientales y contexto
    this.environment = {
      temperature: data.environment?.temperature || null,
      humidity: data.environment?.humidity || null,
      crowdLevel: data.environment?.crowdLevel || null, // qué tan lleno estaba el gym
      equipmentAvailability: data.environment?.equipmentAvailability || null
    };
    
    // Metadatos
    this.metadata = {
      createdAt: data.metadata?.createdAt || new Date(),
      updatedAt: data.metadata?.updatedAt || new Date(),
      deviceUsed: data.metadata?.deviceUsed || null,
      appVersion: data.metadata?.appVersion || '1.0.0'
    };
  }

  // Métodos de cálculo
  calculateMetrics() {
    let totalVolume = 0;
    let totalSets = 0;
    let completedSets = 0;
    let totalReps = 0;
    let totalRPE = 0;
    let rpeCount = 0;
    let exercisesCompleted = 0;

    this.exercises.forEach(exercise => {
      let exerciseHasCompletedSets = false;
      
      exercise.sets.forEach(set => {
        totalSets++;
        
        if (set.completed) {
          completedSets++;
          exerciseHasCompletedSets = true;
          
          if (set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
            totalReps += set.reps;
          }
          
          if (set.rpe) {
            totalRPE += set.rpe;
            rpeCount++;
          }
        }
      });
      
      if (exerciseHasCompletedSets) {
        exercisesCompleted++;
      }
    });

    this.metrics = {
      totalVolume,
      totalSets,
      completedSets,
      totalReps,
      averageRPE: rpeCount > 0 ? totalRPE / rpeCount : 0,
      exercisesCompleted,
      completionRate: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
      estimatedCalories: this.estimateCalories(),
      personalRecords: this.metrics.personalRecords || []
    };

    return this.metrics;
  }

  estimateCalories() {
    // Estimación básica basada en duración y tipo de entrenamiento
    const baseMET = 3.5; // MET promedio para entrenamiento de fuerza
    const averageWeight = 70; // kg (podría obtenerse del perfil del usuario)
    const durationHours = this.duration / 60;
    
    return Math.round(baseMET * averageWeight * durationHours);
  }

  getDuration() {
    if (this.startTime && this.endTime) {
      return Math.round((new Date(this.endTime) - new Date(this.startTime)) / 1000 / 60);
    }
    return this.duration;
  }

  isActive() {
    return this.startTime && !this.endTime && !this.abandoned;
  }

  isPaused() {
    return this.pausedAt && !this.resumedAt;
  }

  // Métodos de validación
  isValid() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Nombre de la sesión es requerido');
    }
    
    if (!this.exercises || this.exercises.length === 0) {
      errors.push('Debe incluir al menos un ejercicio');
    }
    
    if (this.completed && (!this.startTime || !this.endTime)) {
      errors.push('Sesión completada debe tener tiempo de inicio y fin');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Métodos para preparar datos
  toFirestore() {
    const data = { ...this };
    if (data.id) delete data.id;
    return data;
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    return new WorkoutSessionModel({
      id: doc.id,
      ...doc.data()
    });
  }
}

class ExerciseInSessionModel {
  constructor(data = {}) {
    this.exerciseId = data.exerciseId || '';
    this.name = data.name || '';
    this.order = data.order || 0;
    this.sets = data.sets || []; // Array de SetInSession
    this.restTime = data.restTime || 60;
    this.notes = data.notes || '';
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.completed = data.completed ?? false;
    this.skipped = data.skipped ?? false;
    this.skipReason = data.skipReason || '';
    this.personalRecord = data.personalRecord ?? false;
    this.prType = data.prType || null; // 'weight', 'reps', 'volume', '1rm'
    this.previousBest = data.previousBest || null;
  }
}

class SetInSessionModel {
  constructor(data = {}) {
    this.type = data.type || 'normal';
    this.targetReps = data.targetReps || null;
    this.targetWeight = data.targetWeight || null;
    this.targetDuration = data.targetDuration || null;
    
    // Valores realizados
    this.actualReps = data.actualReps || null;
    this.actualWeight = data.actualWeight || null;
    this.actualDuration = data.actualDuration || null;
    this.rpe = data.rpe || null;
    
    // Estado de la serie
    this.completed = data.completed ?? false;
    this.failed = data.failed ?? false;
    this.failurePoint = data.failurePoint || null; // en qué repetición falló
    this.assistanceUsed = data.assistanceUsed ?? false;
    this.formBreakdown = data.formBreakdown ?? false;
    
    // Tiempos
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.restTimeUsed = data.restTimeUsed || null;
    
    this.notes = data.notes || '';
  }

  // Propiedades calculadas
  get reps() {
    return this.actualReps || this.targetReps;
  }

  get weight() {
    return this.actualWeight || this.targetWeight;
  }

  get duration() {
    return this.actualDuration || this.targetDuration;
  }

  get volume() {
    if (this.weight && this.reps) {
      return this.weight * this.reps;
    }
    return 0;
  }

  wasTargetMet() {
    if (this.targetReps && this.actualReps) {
      return this.actualReps >= this.targetReps;
    }
    if (this.targetDuration && this.actualDuration) {
      return this.actualDuration >= this.targetDuration;
    }
    return this.completed;
  }
}

// Modelo para el estado actual del entrenamiento (en memoria)
class ActiveWorkoutModel {
  constructor(data = {}) {
    this.sessionId = data.sessionId || null;
    this.templateId = data.templateId || null;
    this.name = data.name || '';
    this.startTime = data.startTime || new Date();
    this.currentExerciseIndex = data.currentExerciseIndex || 0;
    this.currentSetIndex = data.currentSetIndex || 0;
    this.exercises = data.exercises || [];
    this.restTimer = data.restTimer || null;
    this.isPaused = data.isPaused ?? false;
    this.notes = data.notes || '';
    
    // Estado del timer
    this.timerState = {
      isActive: data.timerState?.isActive ?? false,
      timeRemaining: data.timerState?.timeRemaining || 0,
      type: data.timerState?.type || 'rest', // 'rest', 'exercise', 'warmup'
      startedAt: data.timerState?.startedAt || null
    };
  }

  getCurrentExercise() {
    return this.exercises[this.currentExerciseIndex] || null;
  }

  getCurrentSet() {
    const exercise = this.getCurrentExercise();
    if (!exercise) return null;
    return exercise.sets[this.currentSetIndex] || null;
  }

  moveToNextSet() {
    const exercise = this.getCurrentExercise();
    if (!exercise) return false;

    if (this.currentSetIndex < exercise.sets.length - 1) {
      this.currentSetIndex++;
      return true;
    } else if (this.currentExerciseIndex < this.exercises.length - 1) {
      this.currentExerciseIndex++;
      this.currentSetIndex = 0;
      return true;
    }
    
    return false; // Entrenamiento completado
  }

  getProgress() {
    const totalSets = this.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const completedSets = this.exercises.reduce((completed, ex, exIndex) => {
      if (exIndex < this.currentExerciseIndex) {
        return completed + ex.sets.filter(set => set.completed).length;
      } else if (exIndex === this.currentExerciseIndex) {
        return completed + ex.sets.slice(0, this.currentSetIndex).filter(set => set.completed).length;
      }
      return completed;
    }, 0);

    return {
      completedSets,
      totalSets,
      percentage: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
      currentExercise: this.currentExerciseIndex + 1,
      totalExercises: this.exercises.length
    };
  }
}

module.exports = {
  WorkoutTemplateModel,
  ExerciseInTemplateModel,
  SetTemplateModel,
  WorkoutSessionModel,
  ExerciseInSessionModel,
  SetInSessionModel,
  ActiveWorkoutModel
};