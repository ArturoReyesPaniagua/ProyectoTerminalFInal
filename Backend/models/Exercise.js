// backend/src/models/Exercise.js

/**
 * Modelo de Ejercicio para ASECGC
 * Define la estructura de datos de los ejercicios en Firestore
 */

class ExerciseModel {
  constructor(data = {}) {
    // Identificación básica
    this.id = data.id || null;
    this.name = data.name || '';
    this.alternativeNames = data.alternativeNames || []; // Nombres alternativos
    
    // Categorización
    this.category = data.category || 'strength'; // 'strength', 'cardio', 'flexibility', 'sports', 'functional'
    this.subcategory = data.subcategory || null; // Subcategoría específica
    this.muscleGroups = data.muscleGroups || []; // Grupos musculares principales
    this.secondaryMuscles = data.secondaryMuscles || []; // Músculos secundarios
    this.equipment = data.equipment || 'bodyweight'; // Equipamiento requerido
    
    // Descripción e instrucciones
    this.description = data.description || '';
    this.instructions = data.instructions || []; // Array de pasos
    this.tips = data.tips || []; // Consejos adicionales
    this.commonMistakes = data.commonMistakes || []; // Errores comunes
    
    // Características del ejercicio
    this.difficulty = data.difficulty || 'beginner'; // 'beginner', 'intermediate', 'advanced'
    this.type = data.type || 'compound'; // 'compound', 'isolation', 'cardio', 'stretching'
    this.forceType = data.forceType || 'push'; // 'push', 'pull', 'static', 'dynamic'
    this.plane = data.plane || 'sagittal'; // 'sagittal', 'frontal', 'transverse'
    
    // Configuración de entrenamiento
    this.defaultSets = data.defaultSets || 3;
    this.defaultReps = {
      min: data.defaultReps?.min || 8,
      max: data.defaultReps?.max || 12
    };
    this.defaultRestTime = data.defaultRestTime || 60; // segundos
    this.tempoRecommendation = data.tempoRecommendation || '2-1-2-1'; // eccentric-pause-concentric-pause
    
    // Métricas y seguimiento
    this.trackingMethods = data.trackingMethods || ['weight', 'reps']; // 'weight', 'reps', 'duration', 'distance', 'calories'
    this.progressionMethods = data.progressionMethods || ['weight', 'volume']; // Métodos de progresión
    this.personalRecordTypes = data.personalRecordTypes || ['1RM', 'volume', 'endurance']; // Tipos de récords
    
    // Variaciones y modificaciones
    this.variations = data.variations || []; // Array de variaciones del ejercicio
    this.modifications = {
      easier: data.modifications?.easier || [], // Versiones más fáciles
      harder: data.modifications?.harder || [], // Versiones más difíciles
      injuries: data.modifications?.injuries || [] // Modificaciones para lesiones
    };
    
    // Media y recursos
    this.media = {
      images: data.media?.images || [], // URLs de imágenes
      videos: data.media?.videos || [], // URLs de videos
      animations: data.media?.animations || [], // URLs de animaciones/GIFs
      thumbnails: data.media?.thumbnails || []
    };
    
    // Seguridad y precauciones
    this.safetyNotes = data.safetyNotes || [];
    this.contraindications = data.contraindications || []; // Contraindicaciones
    this.injuryRisk = data.injuryRisk || 'low'; // 'low', 'medium', 'high'
    this.requiredSkills = data.requiredSkills || []; // Habilidades prerequisito
    
    // Clasificación y filtros
    this.tags = data.tags || []; // Etiquetas para filtrado
    this.environment = data.environment || 'gym'; // 'gym', 'home', 'outdoor', 'pool'
    this.timeRequired = data.timeRequired || 'short'; // 'short', 'medium', 'long'
    this.spaceRequired = data.spaceRequired || 'minimal'; // 'minimal', 'moderate', 'large'
    
    // Metadatos del ejercicio
    this.isSystemExercise = data.isSystemExercise ?? true; // Ejercicio del sistema vs personalizado
    this.createdBy = data.createdBy || null; // UID del usuario que lo creó (si es personalizado)
    this.isPublic = data.isPublic ?? true; // Si puede ser usado por otros usuarios
    this.isVerified = data.isVerified ?? false; // Verificado por expertos
    this.popularity = data.popularity || 0; // Puntuación de popularidad
    this.rating = data.rating || 0; // Calificación promedio
    this.timesUsed = data.timesUsed || 0; // Veces que se ha usado
    
    // Fechas y versioning
    this.metadata = {
      createdAt: data.metadata?.createdAt || new Date(),
      updatedAt: data.metadata?.updatedAt || new Date(),
      version: data.metadata?.version || '1.0.0',
      source: data.metadata?.source || 'system', // 'system', 'user', 'import'
      language: data.metadata?.language || 'es'
    };

    // Estado del ejercicio
    this.status = {
      isActive: data.status?.isActive ?? true,
      isApproved: data.status?.isApproved ?? true,
      needsReview: data.status?.needsReview ?? false,
      reportCount: data.status?.reportCount || 0
    };
  }

  // Métodos de validación
  isValid() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Nombre del ejercicio es requerido');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Nombre del ejercicio debe tener máximo 100 caracteres');
    }

    if (!this.category) {
      errors.push('Categoría es requerida');
    }

    if (!this.isValidCategory(this.category)) {
      errors.push('Categoría debe ser válida');
    }

    if (!this.muscleGroups || this.muscleGroups.length === 0) {
      errors.push('Debe especificar al menos un grupo muscular');
    }

    if (this.description && this.description.length > 500) {
      errors.push('Descripción debe tener máximo 500 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidCategory(category) {
    const validCategories = ['strength', 'cardio', 'flexibility', 'sports', 'functional'];
    return validCategories.includes(category);
  }

  isValidMuscleGroup(muscleGroup) {
    const validMuscleGroups = [
      'chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps', 
      'forearms', 'legs', 'quadriceps', 'hamstrings', 'glutes', 
      'calves', 'core', 'abs', 'obliques'
    ];
    return validMuscleGroups.includes(muscleGroup);
  }

  // Métodos de utilidad
  isPrimaryMuscleGroup(muscleGroup) {
    return this.muscleGroups.includes(muscleGroup);
  }

  isSecondaryMuscleGroup(muscleGroup) {
    return this.secondaryMuscles.includes(muscleGroup);
  }

  requiresEquipment() {
    return this.equipment !== 'bodyweight';
  }

  isCompound() {
    return this.type === 'compound';
  }

  isSuitableForLevel(level) {
    const levelHierarchy = { beginner: 1, intermediate: 2, advanced: 3 };
    const exerciseLevel = levelHierarchy[this.difficulty] || 1;
    const userLevel = levelHierarchy[level] || 1;
    
    // Permitir ejercicios del mismo nivel o hasta un nivel superior
    return exerciseLevel <= userLevel + 1;
  }

  canBePerformedAt(environment) {
    if (this.environment === 'any') return true;
    if (Array.isArray(this.environment)) {
      return this.environment.includes(environment);
    }
    return this.environment === environment;
  }

  getDuration() {
    // Estimar duración basada en configuración por defecto
    const setDuration = 30; // segundos promedio por serie
    const totalSetTime = this.defaultSets * setDuration;
    const totalRestTime = (this.defaultSets - 1) * this.defaultRestTime;
    return totalSetTime + totalRestTime; // en segundos
  }

  getCaloriesBurned(weight, duration) {
    // Estimación muy básica de calorías quemadas
    const met = this.getMET();
    const durationHours = duration / 3600; // convertir segundos a horas
    return met * weight * durationHours;
  }

  getMET() {
    // Valores MET aproximados por categoría
    const metValues = {
      'strength': 3.5,
      'cardio': 6.0,
      'flexibility': 2.5,
      'sports': 5.0,
      'functional': 4.0
    };
    return metValues[this.category] || 3.0;
  }

  // Métodos para preparar datos
  toFirestore() {
    const data = { ...this };
    if (data.id) delete data.id; // Firestore maneja el ID por separado
    return data;
  }

  toPublic() {
    // Versión pública del ejercicio (sin datos sensibles)
    return {
      id: this.id,
      name: this.name,
      alternativeNames: this.alternativeNames,
      category: this.category,
      subcategory: this.subcategory,
      muscleGroups: this.muscleGroups,
      secondaryMuscles: this.secondaryMuscles,
      equipment: this.equipment,
      description: this.description,
      instructions: this.instructions,
      tips: this.tips,
      difficulty: this.difficulty,
      type: this.type,
      defaultSets: this.defaultSets,
      defaultReps: this.defaultReps,
      defaultRestTime: this.defaultRestTime,
      media: this.media,
      tags: this.tags,
      environment: this.environment,
      isSystemExercise: this.isSystemExercise,
      popularity: this.popularity,
      rating: this.rating
    };
  }

  toSearchIndex() {
    // Datos para indexación y búsqueda
    return {
      id: this.id,
      name: this.name.toLowerCase(),
      alternativeNames: this.alternativeNames.map(name => name.toLowerCase()),
      category: this.category,
      muscleGroups: this.muscleGroups,
      equipment: this.equipment,
      tags: this.tags.map(tag => tag.toLowerCase()),
      difficulty: this.difficulty,
      searchTerms: [
        this.name,
        ...this.alternativeNames,
        ...this.muscleGroups,
        this.category,
        this.equipment,
        ...this.tags
      ].map(term => term.toLowerCase())
    };
  }

  // Métodos estáticos
  static getValidCategories() {
    return [
      { id: 'strength', name: 'Fuerza', description: 'Ejercicios con pesas y resistencia' },
      { id: 'cardio', name: 'Cardio', description: 'Ejercicios cardiovasculares' },
      { id: 'flexibility', name: 'Flexibilidad', description: 'Estiramientos y movilidad' },
      { id: 'sports', name: 'Deportes', description: 'Actividades deportivas específicas' },
      { id: 'functional', name: 'Funcional', description: 'Movimientos funcionales' }
    ];
  }

  static getValidMuscleGroups() {
    return [
      { id: 'chest', name: 'Pecho', category: 'upper' },
      { id: 'back', name: 'Espalda', category: 'upper' },
      { id: 'shoulders', name: 'Hombros', category: 'upper' },
      { id: 'arms', name: 'Brazos', category: 'upper' },
      { id: 'biceps', name: 'Bíceps', category: 'upper' },
      { id: 'triceps', name: 'Tríceps', category: 'upper' },
      { id: 'forearms', name: 'Antebrazos', category: 'upper' },
      { id: 'legs', name: 'Piernas', category: 'lower' },
      { id: 'quadriceps', name: 'Cuádriceps', category: 'lower' },
      { id: 'hamstrings', name: 'Isquiotibiales', category: 'lower' },
      { id: 'glutes', name: 'Glúteos', category: 'lower' },
      { id: 'calves', name: 'Pantorrillas', category: 'lower' },
      { id: 'core', name: 'Core', category: 'core' },
      { id: 'abs', name: 'Abdominales', category: 'core' },
      { id: 'obliques', name: 'Oblicuos', category: 'core' }
    ];
  }

  static getValidEquipment() {
    return [
      { id: 'bodyweight', name: 'Peso corporal', requiresGym: false },
      { id: 'barbell', name: 'Barra', requiresGym: true },
      { id: 'dumbbell', name: 'Mancuernas', requiresGym: false },
      { id: 'kettlebell', name: 'Pesa rusa', requiresGym: false },
      { id: 'machine', name: 'Máquina', requiresGym: true },
      { id: 'cable', name: 'Poleas', requiresGym: true },
      { id: 'resistance_band', name: 'Banda elástica', requiresGym: false },
      { id: 'suspension', name: 'Suspensión (TRX)', requiresGym: false },
      { id: 'medicine_ball', name: 'Balón medicinal', requiresGym: false },
      { id: 'stability_ball', name: 'Pelota de estabilidad', requiresGym: false }
    ];
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new ExerciseModel({
      id: doc.id,
      ...data
    });
  }

  static createSystemExercise(exerciseData) {
    return new ExerciseModel({
      ...exerciseData,
      isSystemExercise: true,
      createdBy: null,
      isPublic: true,
      isVerified: true,
      status: {
        isActive: true,
        isApproved: true,
        needsReview: false
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'system'
      }
    });
  }

  static createUserExercise(exerciseData, userId) {
    return new ExerciseModel({
      ...exerciseData,
      isSystemExercise: false,
      createdBy: userId,
      isPublic: false,
      isVerified: false,
      status: {
        isActive: true,
        isApproved: false,
        needsReview: true
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'user'
      }
    });
  }
}

module.exports = ExerciseModel;