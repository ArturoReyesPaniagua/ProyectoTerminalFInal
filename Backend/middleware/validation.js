// backend/src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para autenticación
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos')
    .trim(),
  
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Fecha de nacimiento debe ser una fecha válida')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      
      if (age < 13) {
        throw new Error('Debes tener al menos 13 años');
      }
      if (age > 120) {
        throw new Error('Edad no válida');
      }
      return true;
    }),
  
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Género debe ser: male, female o other'),
  
  handleValidationErrors
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Usuario o email es requerido')
    .trim(),
  
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida'),
  
  handleValidationErrors
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  handleValidationErrors
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token es requerido'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo'),
  
  handleValidationErrors
];

// Validaciones para medidas corporales
const bodyMeasurementsValidation = [
  body('weight')
    .isFloat({ min: 20, max: 300 })
    .withMessage('El peso debe estar entre 20 y 300 kg'),
  
  body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('La altura debe estar entre 100 y 250 cm'),
  
  body('waist')
    .optional()
    .isFloat({ min: 40, max: 200 })
    .withMessage('La cintura debe estar entre 40 y 200 cm'),
  
  body('neck')
    .optional()
    .isFloat({ min: 20, max: 60 })
    .withMessage('El cuello debe estar entre 20 y 60 cm'),
  
  body('hip')
    .optional()
    .isFloat({ min: 50, max: 200 })
    .withMessage('La cadera debe estar entre 50 y 200 cm'),
  
  body('chest')
    .optional()
    .isFloat({ min: 50, max: 200 })
    .withMessage('El pecho debe estar entre 50 y 200 cm'),
  
  body('abdomen')
    .optional()
    .isFloat({ min: 40, max: 200 })
    .withMessage('El abdomen debe estar entre 40 y 200 cm'),
  
  body('thigh')
    .optional()
    .isFloat({ min: 30, max: 100 })
    .withMessage('El muslo debe estar entre 30 y 100 cm'),
  
  handleValidationErrors
];

// Validaciones para ejercicios
const exerciseValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del ejercicio es requerido y debe tener máximo 100 caracteres')
    .trim(),
  
  body('category')
    .isIn(['strength', 'cardio', 'flexibility', 'sports', 'functional'])
    .withMessage('Categoría debe ser: strength, cardio, flexibility, sports o functional'),
  
  body('muscleGroups')
    .isArray({ min: 1 })
    .withMessage('Debe especificar al menos un grupo muscular'),
  
  body('muscleGroups.*')
    .isIn(['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'calves', 'forearms'])
    .withMessage('Grupo muscular no válido'),
  
  body('equipment')
    .optional()
    .isString()
    .withMessage('Equipamiento debe ser una cadena'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción debe tener máximo 500 caracteres')
    .trim(),
  
  body('instructions')
    .optional()
    .isArray()
    .withMessage('Las instrucciones deben ser un array'),
  
  body('instructions.*')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cada instrucción debe tener máximo 200 caracteres'),
  
  handleValidationErrors
];

// Validaciones para plantillas de entrenamiento
const workoutTemplateValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre de la plantilla es requerido y debe tener máximo 100 caracteres')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción debe tener máximo 500 caracteres')
    .trim(),
  
  body('exercises')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un ejercicio'),
  
  body('exercises.*.exerciseId')
    .notEmpty()
    .withMessage('ID de ejercicio es requerido'),
  
  body('exercises.*.sets')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos una serie por ejercicio'),
  
  body('exercises.*.sets.*.reps')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Las repeticiones deben estar entre 1 y 100'),
  
  body('exercises.*.sets.*.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El peso debe ser mayor o igual a 0'),
  
  body('exercises.*.sets.*.duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La duración debe ser mayor a 0 segundos'),
  
  body('exercises.*.restTime')
    .optional()
    .isInt({ min: 0, max: 600 })
    .withMessage('El tiempo de descanso debe estar entre 0 y 600 segundos'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('La duración estimada debe estar entre 5 y 480 minutos'),
  
  handleValidationErrors
];

// Validaciones para sesiones de entrenamiento
const workoutSessionValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre de la sesión es requerido')
    .trim(),
  
  body('exercises')
    .isArray()
    .withMessage('Los ejercicios deben ser un array'),
  
  body('exercises.*.exerciseId')
    .notEmpty()
    .withMessage('ID de ejercicio es requerido'),
  
  body('exercises.*.sets.*.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El peso debe ser mayor o igual a 0'),
  
  body('exercises.*.sets.*.reps')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Las repeticiones deben estar entre 0 y 200'),
  
  body('exercises.*.sets.*.rpe')
    .optional()
    .isFloat({ min: 1, max: 10 })
    .withMessage('El RPE debe estar entre 1 y 10'),
  
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La duración debe ser mayor o igual a 0'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas deben tener máximo 1000 caracteres')
    .trim(),
  
  body('completed')
    .isBoolean()
    .withMessage('Completado debe ser un booleano'),
  
  handleValidationErrors
];

// Validaciones para cálculos
const oneRMValidation = [
  body('weight')
    .isFloat({ min: 0.5, max: 1000 })
    .withMessage('El peso debe estar entre 0.5 y 1000 kg'),
  
  body('reps')
    .isInt({ min: 1, max: 50 })
    .withMessage('Las repeticiones deben estar entre 1 y 50'),
  
  body('method')
    .optional()
    .isIn(['composite', 'epley', 'brzycki', 'lander', 'lombardi', 'mcglothin', 'oconner', 'wathen'])
    .withMessage('Método de cálculo no válido'),
  
  handleValidationErrors
];

const progressionValidation = [
  body('exerciseId')
    .notEmpty()
    .withMessage('ID de ejercicio es requerido'),
  
  body('userLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Nivel de usuario debe ser: beginner, intermediate o advanced'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ruta
const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID es requerido')
    .isLength({ min: 1 })
    .withMessage('ID no puede estar vacío'),
  
  handleValidationErrors
];

// Validaciones para query parameters
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  handleValidationErrors
];

const timeframeValidation = [
  query('timeframe')
    .optional()
    .isIn(['7d', '30d', '90d', '6m', '1y'])
    .withMessage('Timeframe debe ser: 7d, 30d, 90d, 6m o 1y'),
  
  handleValidationErrors
];

module.exports = {
  // Manejo de errores
  handleValidationErrors,
  
  // Autenticación
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  
  // Usuario y medidas
  bodyMeasurementsValidation,
  
  // Ejercicios
  exerciseValidation,
  
  // Entrenamientos
  workoutTemplateValidation,
  workoutSessionValidation,
  
  // Cálculos
  oneRMValidation,
  progressionValidation,
  
  // Parámetros
  idParamValidation,
  paginationValidation,
  timeframeValidation
};