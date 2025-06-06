// backend/src/utils/validators.js

/**
 * Validadores personalizados para ASECGC Backend
 */

class Validators {

  /**
   * Validar datos de usuario
   */
  static validateUserData(userData) {
    const errors = [];

    // Validar username
    if (!userData.username) {
      errors.push('Username es requerido');
    } else {
      if (userData.username.length < 3) {
        errors.push('Username debe tener al menos 3 caracteres');
      }
      if (userData.username.length > 30) {
        errors.push('Username debe tener máximo 30 caracteres');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
        errors.push('Username solo puede contener letras, números y guiones bajos');
      }
    }

    // Validar email
    if (!userData.email) {
      errors.push('Email es requerido');
    } else if (!this.isValidEmail(userData.email)) {
      errors.push('Email debe tener un formato válido');
    }

    // Validar fecha de nacimiento
    if (!userData.dateOfBirth) {
      errors.push('Fecha de nacimiento es requerida');
    } else {
      const age = this.calculateAge(userData.dateOfBirth);
      if (age < 13) {
        errors.push('Debes tener al menos 13 años para registrarte');
      }
      if (age > 120) {
        errors.push('Fecha de nacimiento no válida');
      }
    }

    // Validar género
    if (!userData.gender) {
      errors.push('Género es requerido');
    } else if (!['male', 'female', 'other'].includes(userData.gender)) {
      errors.push('Género debe ser: male, female o other');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar medidas corporales
   */
  static validateBodyMeasurements(measurements) {
    const errors = [];

    // Peso - obligatorio
    if (measurements.weight === undefined || measurements.weight === null) {
      errors.push('Peso es requerido');
    } else if (!this.isValidWeight(measurements.weight)) {
      errors.push('Peso debe estar entre 20 y 300 kg');
    }

    // Altura - obligatoria
    if (measurements.height === undefined || measurements.height === null) {
      errors.push('Altura es requerida');
    } else if (!this.isValidHeight(measurements.height)) {
      errors.push('Altura debe estar entre 100 y 250 cm');
    }

    // Medidas opcionales pero validadas si se proporcionan
    if (measurements.waist !== undefined && measurements.waist !== null) {
      if (!this.isValidMeasurement(measurements.waist, 40, 200)) {
        errors.push('Cintura debe estar entre 40 y 200 cm');
      }
    }

    if (measurements.neck !== undefined && measurements.neck !== null) {
      if (!this.isValidMeasurement(measurements.neck, 20, 60)) {
        errors.push('Cuello debe estar entre 20 y 60 cm');
      }
    }

    if (measurements.hip !== undefined && measurements.hip !== null) {
      if (!this.isValidMeasurement(measurements.hip, 50, 200)) {
        errors.push('Cadera debe estar entre 50 y 200 cm');
      }
    }

    if (measurements.chest !== undefined && measurements.chest !== null) {
      if (!this.isValidMeasurement(measurements.chest, 50, 200)) {
        errors.push('Pecho debe estar entre 50 y 200 cm');
      }
    }

    if (measurements.abdomen !== undefined && measurements.abdomen !== null) {
      if (!this.isValidMeasurement(measurements.abdomen, 40, 200)) {
        errors.push('Abdomen debe estar entre 40 y 200 cm');
      }
    }

    if (measurements.thigh !== undefined && measurements.thigh !== null) {
      if (!this.isValidMeasurement(measurements.thigh, 30, 100)) {
        errors.push('Muslo debe estar entre 30 y 100 cm');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar ejercicio
   */
  static validateExercise(exerciseData) {
    const errors = [];

    // Nombre - obligatorio
    if (!exerciseData.name || exerciseData.name.trim().length === 0) {
      errors.push('Nombre del ejercicio es requerido');
    } else if (exerciseData.name.length > 100) {
      errors.push('Nombre del ejercicio debe tener máximo 100 caracteres');
    }

    // Categoría - obligatoria
    if (!exerciseData.category) {
      errors.push('Categoría es requerida');
    } else if (!this.isValidExerciseCategory(exerciseData.category)) {
      errors.push('Categoría debe ser: strength, cardio, flexibility, sports o functional');
    }

    // Grupos musculares - obligatorios
    if (!exerciseData.muscleGroups || !Array.isArray(exerciseData.muscleGroups) || exerciseData.muscleGroups.length === 0) {
      errors.push('Debe especificar al menos un grupo muscular');
    } else {
      const invalidMuscleGroups = exerciseData.muscleGroups.filter(group => !this.isValidMuscleGroup(group));
      if (invalidMuscleGroups.length > 0) {
        errors.push(`Grupos musculares no válidos: ${invalidMuscleGroups.join(', ')}`);
      }
    }

    // Descripción - opcional pero validada
    if (exerciseData.description && exerciseData.description.length > 500) {
      errors.push('Descripción debe tener máximo 500 caracteres');
    }

    // Dificultad - opcional pero validada
    if (exerciseData.difficulty && !['beginner', 'intermediate', 'advanced'].includes(exerciseData.difficulty)) {
      errors.push('Dificultad debe ser: beginner, intermediate o advanced');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar plantilla de entrenamiento
   */
  static validateWorkoutTemplate(templateData) {
    const errors = [];

    // Nombre - obligatorio
    if (!templateData.name || templateData.name.trim().length === 0) {
      errors.push('Nombre de la plantilla es requerido');
    } else if (templateData.name.length > 100) {
      errors.push('Nombre debe tener máximo 100 caracteres');
    }

    // Descripción - opcional pero validada
    if (templateData.description && templateData.description.length > 500) {
      errors.push('Descripción debe tener máximo 500 caracteres');
    }

    // Ejercicios - obligatorios
    if (!templateData.exercises || !Array.isArray(templateData.exercises) || templateData.exercises.length === 0) {
      errors.push('Debe incluir al menos un ejercicio');
    } else {
      // Validar cada ejercicio
      templateData.exercises.forEach((exercise, index) => {
        const exerciseErrors = this.validateExerciseInTemplate(exercise);
        if (exerciseErrors.length > 0) {
          errors.push(`Ejercicio ${index + 1}: ${exerciseErrors.join(', ')}`);
        }
      });
    }

    // Duración estimada - opcional pero validada
    if (templateData.estimatedDuration !== undefined) {
      if (!this.isValidDuration(templateData.estimatedDuration)) {
        errors.push('Duración estimada debe estar entre 5 y 480 minutos');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar ejercicio dentro de plantilla
   */
  static validateExerciseInTemplate(exerciseData) {
    const errors = [];

    // ID del ejercicio - obligatorio
    if (!exerciseData.exerciseId) {
      errors.push('ID de ejercicio es requerido');
    }

    // Series - obligatorias
    if (!exerciseData.sets || !Array.isArray(exerciseData.sets) || exerciseData.sets.length === 0) {
      errors.push('Debe incluir al menos una serie');
    } else {
      // Validar cada serie
      exerciseData.sets.forEach((set, index) => {
        const setErrors = this.validateSet(set);
        if (setErrors.length > 0) {
          errors.push(`Serie ${index + 1}: ${setErrors.join(', ')}`);
        }
      });
    }

    // Tiempo de descanso - opcional pero validado
    if (exerciseData.restTime !== undefined) {
      if (!this.isValidRestTime(exerciseData.restTime)) {
        errors.push('Tiempo de descanso debe estar entre 0 y 600 segundos');
      }
    }

    return errors;
  }

  /**
   * Validar serie de ejercicio
   */
  static validateSet(setData) {
    const errors = [];

    // Tipo de serie
    if (setData.type && !['normal', 'warmup', 'dropset', 'rest_pause', 'timed'].includes(setData.type)) {
      errors.push('Tipo de serie no válido');
    }

    // Repeticiones (para series normales)
    if (setData.type !== 'timed' && setData.reps !== undefined) {
      if (!this.isValidReps(setData.reps)) {
        errors.push('Repeticiones deben estar entre 1 y 100');
      }
    }

    // Peso - opcional pero validado
    if (setData.weight !== undefined) {
      if (!this.isValidWeight(setData.weight, 0)) {
        errors.push('Peso debe ser mayor o igual a 0');
      }
    }

    // Duración (para series por tiempo)
    if (setData.type === 'timed' && setData.duration !== undefined) {
      if (!this.isValidDuration(setData.duration, 1, 3600)) {
        errors.push('Duración debe estar entre 1 y 3600 segundos');
      }
    }

    // RPE - opcional pero validado
    if (setData.rpe !== undefined) {
      if (!this.isValidRPE(setData.rpe)) {
        errors.push('RPE debe estar entre 1 y 10');
      }
    }

    return errors;
  }

  /**
   * Validar sesión de entrenamiento
   */
  static validateWorkoutSession(sessionData) {
    const errors = [];

    // Nombre - obligatorio
    if (!sessionData.name || sessionData.name.trim().length === 0) {
      errors.push('Nombre de la sesión es requerido');
    } else if (sessionData.name.length > 100) {
      errors.push('Nombre debe tener máximo 100 caracteres');
    }

    // Ejercicios - obligatorios
    if (!sessionData.exercises || !Array.isArray(sessionData.exercises)) {
      errors.push('Ejercicios deben ser un array');
    }

    // Duración - opcional pero validada
    if (sessionData.duration !== undefined) {
      if (!this.isValidDuration(sessionData.duration, 0)) {
        errors.push('Duración debe ser mayor o igual a 0');
      }
    }

    // Notas - opcional pero validada
    if (sessionData.notes && sessionData.notes.length > 1000) {
      errors.push('Notas deben tener máximo 1000 caracteres');
    }

    // Estado completado - obligatorio
    if (typeof sessionData.completed !== 'boolean') {
      errors.push('Estado completado debe ser booleano');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar cálculo de 1RM
   */
  static validateOneRMCalculation(data) {
    const errors = [];

    // Peso - obligatorio
    if (data.weight === undefined || data.weight === null) {
      errors.push('Peso es requerido');
    } else if (!this.isValidWeight(data.weight, 0.5, 1000)) {
      errors.push('Peso debe estar entre 0.5 y 1000 kg');
    }

    // Repeticiones - obligatorias
    if (data.reps === undefined || data.reps === null) {
      errors.push('Repeticiones son requeridas');
    } else if (!this.isValidReps(data.reps, 1, 50)) {
      errors.push('Repeticiones deben estar entre 1 y 50');
    }

    // Método - opcional pero validado
    if (data.method && !this.isValidOneRMMethod(data.method)) {
      errors.push('Método de cálculo no válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Métodos auxiliares de validación

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidWeight(weight, min = 20, max = 300) {
    return typeof weight === 'number' && weight >= min && weight <= max;
  }

  static isValidHeight(height, min = 100, max = 250) {
    return typeof height === 'number' && height >= min && height <= max;
  }

  static isValidMeasurement(measurement, min, max) {
    return typeof measurement === 'number' && measurement >= min && measurement <= max;
  }

  static isValidReps(reps, min = 1, max = 100) {
    return Number.isInteger(reps) && reps >= min && reps <= max;
  }

  static isValidDuration(duration, min = 5, max = 480) {
    return Number.isInteger(duration) && duration >= min && duration <= max;
  }

  static isValidRestTime(restTime, min = 0, max = 600) {
    return Number.isInteger(restTime) && restTime >= min && restTime <= max;
  }

  static isValidRPE(rpe, min = 1, max = 10) {
    return typeof rpe === 'number' && rpe >= min && rpe <= max;
  }

  static isValidExerciseCategory(category) {
    const validCategories = ['strength', 'cardio', 'flexibility', 'sports', 'functional'];
    return validCategories.includes(category);
  }

  static isValidMuscleGroup(muscleGroup) {
    const validMuscleGroups = [
      'chest', 'back', 'shoulders', 'arms', 'biceps', 'triceps', 
      'forearms', 'legs', 'quadriceps', 'hamstrings', 'glutes', 
      'calves', 'core', 'abs', 'obliques'
    ];
    return validMuscleGroups.includes(muscleGroup);
  }

  static isValidOneRMMethod(method) {
    const validMethods = ['composite', 'epley', 'brzycki', 'lander', 'lombardi', 'mcglothin', 'oconner', 'wathen'];
    return validMethods.includes(method);
  }

  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validar estructura de datos anidados
   */
  static validateNestedData(data, schema) {
    const errors = [];

    const validateValue = (value, rules, path = '') => {
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${path} es requerido`);
        return;
      }

      if (value === undefined || value === null) {
        return; // Campo opcional vacío
      }

      if (rules.type) {
        const expectedType = rules.type;
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (actualType !== expectedType) {
          errors.push(`${path} debe ser de tipo ${expectedType}`);
          return;
        }
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${path} debe tener al menos ${rules.minLength} elementos/caracteres`);
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${path} debe tener máximo ${rules.maxLength} elementos/caracteres`);
      }

      if (rules.min && value < rules.min) {
        errors.push(`${path} debe ser mayor o igual a ${rules.min}`);
      }

      if (rules.max && value > rules.max) {
        errors.push(`${path} debe ser menor o igual a ${rules.max}`);
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${path} debe ser uno de: ${rules.enum.join(', ')}`);
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${path} no tiene el formato correcto`);
      }

      if (rules.custom && typeof rules.custom === 'function') {
        const customResult = rules.custom(value);
        if (customResult !== true) {
          errors.push(`${path}: ${customResult}`);
        }
      }

      // Validar propiedades anidadas
      if (rules.properties && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, nestedRules] of Object.entries(rules.properties)) {
          validateValue(value[key], nestedRules, path ? `${path}.${key}` : key);
        }
      }

      // Validar elementos de array
      if (rules.items && Array.isArray(value)) {
        value.forEach((item, index) => {
          validateValue(item, rules.items, `${path}[${index}]`);
        });
      }
    };

    for (const [key, rules] of Object.entries(schema)) {
      validateValue(data[key], rules, key);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar datos de carga de archivos
   */
  static validateFileUpload(file, options = {}) {
    const errors = [];
    const {
      maxSize = 5 * 1024 * 1024, // 5MB por defecto
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
    } = options;

    if (!file) {
      errors.push('Archivo es requerido');
      return { isValid: false, errors };
    }

    // Validar tamaño
    if (file.size > maxSize) {
      errors.push(`Archivo debe ser menor a ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Validar tipo MIME
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`);
    }

    // Validar extensión
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`Extensión no permitida. Extensiones válidas: ${allowedExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar rango de fechas
   */
  static validateDateRange(startDate, endDate, options = {}) {
    const errors = [];
    const {
      maxRangeDays = 365,
      allowFuture = false,
      allowPast = true
    } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Validar fechas válidas
    if (isNaN(start.getTime())) {
      errors.push('Fecha de inicio no válida');
    }

    if (isNaN(end.getTime())) {
      errors.push('Fecha de fin no válida');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Validar orden
    if (start > end) {
      errors.push('Fecha de inicio debe ser anterior a fecha de fin');
    }

    // Validar rango máximo
    const diffDays = Math.abs((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > maxRangeDays) {
      errors.push(`Rango de fechas no puede exceder ${maxRangeDays} días`);
    }

    // Validar fechas futuras
    if (!allowFuture && (start > now || end > now)) {
      errors.push('No se permiten fechas futuras');
    }

    // Validar fechas pasadas
    if (!allowPast && (start < now || end < now)) {
      errors.push('No se permiten fechas pasadas');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;