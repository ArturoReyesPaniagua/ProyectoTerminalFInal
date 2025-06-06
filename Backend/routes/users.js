// backend/src/routes/users.js
const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');

const router = express.Router();

// Validaciones para medidas corporales
const bodyMeasurementsValidation = [
  body('weight')
    .isFloat({ min: 20, max: 300 })
    .withMessage('Peso debe estar entre 20 y 300 kg'),
  body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Altura debe estar entre 100 y 250 cm'),
  body('waist')
    .optional()
    .isFloat({ min: 40, max: 200 })
    .withMessage('Cintura debe estar entre 40 y 200 cm'),
  body('neck')
    .optional()
    .isFloat({ min: 20, max: 60 })
    .withMessage('Cuello debe estar entre 20 y 60 cm'),
  body('hip')
    .optional()
    .isFloat({ min: 50, max: 200 })
    .withMessage('Cadera debe estar entre 50 y 200 cm')
];

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario
 * @access  Private
 */
router.get('/profile', UserController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
router.put('/profile', UserController.updateProfile);

/**
 * @route   POST /api/users/body-measurements
 * @desc    Registrar medidas corporales
 * @access  Private
 */
router.post('/body-measurements', bodyMeasurementsValidation, UserController.updateBodyMeasurements);

/**
 * @route   GET /api/users/body-measurements
 * @desc    Obtener historial de medidas corporales
 * @access  Private
 */
router.get('/body-measurements', UserController.getBodyMeasurements);

/**
 * @route   POST /api/users/calculate-body-fat
 * @desc    Calcular porcentaje de grasa corporal
 * @access  Private
 */
router.post('/calculate-body-fat', UserController.calculateBodyFat);

/**
 * @route   GET /api/users/body-fat-history
 * @desc    Obtener historial de grasa corporal
 * @access  Private
 */
router.get('/body-fat-history', UserController.getBodyFatHistory);

/**
 * @route   DELETE /api/users/profile
 * @desc    Eliminar cuenta de usuario
 * @access  Private
 */
router.delete('/profile', UserController.deleteAccount);

/**
 * @route   GET /api/users/export-data
 * @desc    Exportar datos del usuario
 * @access  Private
 */
router.get('/export-data', UserController.exportData);

module.exports = router;

// backend/src/routes/workouts.js
const express = require('express');
const { body } = require('express-validator');
const WorkoutController = require('../controllers/workoutController');

const router = express.Router();

// Validaciones para plantillas de entrenamiento
const templateValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre es requerido y debe tener máximo 100 caracteres'),
  body('exercises')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un ejercicio'),
  body('exercises.*.exerciseId')
    .notEmpty()
    .withMessage('ID de ejercicio es requerido'),
  body('exercises.*.sets')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos una serie por ejercicio')
];

// Validaciones para sesiones de entrenamiento
const sessionValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre es requerido'),
  body('exercises')
    .isArray()
    .withMessage('Ejercicios debe ser un array'),
  body('completed')
    .isBoolean()
    .withMessage('Completado debe ser booleano')
];

// Validaciones para ejercicios personalizados
const exerciseValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre es requerido'),
  body('category')
    .isIn(['strength', 'cardio', 'flexibility', 'sports'])
    .withMessage('Categoría debe ser válida'),
  body('muscleGroups')
    .isArray({ min: 1 })
    .withMessage('Debe especificar al menos un grupo muscular')
];

// Plantillas de entrenamiento
router.get('/templates', WorkoutController.getWorkoutTemplates);
router.post('/templates', templateValidation, WorkoutController.createWorkoutTemplate);
router.put('/templates/:id', templateValidation, WorkoutController.updateWorkoutTemplate);
router.delete('/templates/:id', WorkoutController.deleteWorkoutTemplate);

// Sesiones de entrenamiento
router.get('/sessions', WorkoutController.getWorkoutSessions);
router.get('/sessions/:id', WorkoutController.getWorkoutSession);
router.post('/sessions', sessionValidation, WorkoutController.createWorkoutSession);
router.put('/sessions/:id', WorkoutController.updateWorkoutSession);
router.delete('/sessions/:id', WorkoutController.deleteWorkoutSession);

// Ejercicios
router.get('/exercises', WorkoutController.getExercises);
router.post('/exercises', exerciseValidation, WorkoutController.createExercise);
router.put('/exercises/:id', WorkoutController.updateExercise);

// Progresión y cálculos
router.post('/calculate-progression', [
  body('exerciseId').notEmpty().withMessage('ID de ejercicio requerido'),
  body('userLevel').optional().isIn(['beginner', 'intermediate', 'advanced'])
], WorkoutController.calculateProgression);

router.post('/calculate-1rm', [
  body('weight').isFloat({ min: 0.5 }).withMessage('Peso debe ser mayor a 0.5'),
  body('reps').isInt({ min: 1, max: 50 }).withMessage('Repeticiones entre 1 y 50'),
  body('method').optional().isIn(['composite', 'epley', 'brzycki', 'lander'])
], WorkoutController.calculate1RM);

router.get('/1rm-history/:exerciseId', WorkoutController.get1RMHistory);
router.get('/progression-history/:exerciseId', WorkoutController.get1RMHistory);

module.exports = router;

// backend/src/routes/analytics.js
const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Obtener estadísticas del dashboard
 * @access  Private
 */
router.get('/dashboard', AnalyticsController.getDashboardStats);

/**
 * @route   POST /api/analytics/progression
 * @desc    Obtener análisis de progresión
 * @access  Private
 */
router.post('/progression', AnalyticsController.getProgressionAnalytics);

/**
 * @route   GET /api/analytics/body-composition
 * @desc    Obtener tendencias de composición corporal
 * @access  Private
 */
router.get('/body-composition', AnalyticsController.getBodyCompositionTrends);

/**
 * @route   GET /api/analytics/consistency
 * @desc    Obtener análisis de consistencia
 * @access  Private
 */
router.get('/consistency', AnalyticsController.getWorkoutConsistency);

/**
 * @route   GET /api/analytics/strength/:exerciseId
 * @desc    Obtener análisis de fuerza para ejercicio específico
 * @access  Private
 */
router.get('/strength/:exerciseId', AnalyticsController.getProgressionAnalytics);

/**
 * @route   GET /api/analytics/volume-progression
 * @desc    Obtener progresión de volumen
 * @access  Private
 */
router.get('/volume-progression', AnalyticsController.getDashboardStats);

/**
 * @route   GET /api/analytics/recommendations
 * @desc    Obtener recomendaciones personalizadas
 * @access  Private
 */
router.get('/recommendations', AnalyticsController.getRecommendations);

/**
 * @route   GET /api/analytics/achievements
 * @desc    Obtener logros del usuario
 * @access  Private
 */
router.get('/achievements', AnalyticsController.getAchievements);

module.exports = router;