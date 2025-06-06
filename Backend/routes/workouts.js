// backend/src/routes/workouts.js
const express = require('express');
const WorkoutController = require('../controllers/workoutController');
const {
  workoutTemplateValidation,
  workoutSessionValidation,
  exerciseValidation,
  oneRMValidation,
  progressionValidation,
  idParamValidation,
  paginationValidation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// ============================================
// PLANTILLAS DE ENTRENAMIENTO
// ============================================

/**
 * @route   GET /api/workouts/templates
 * @desc    Obtener plantillas de entrenamiento del usuario
 * @access  Private
 */
router.get('/templates', paginationValidation, WorkoutController.getWorkoutTemplates);

/**
 * @route   POST /api/workouts/templates
 * @desc    Crear nueva plantilla de entrenamiento
 * @access  Private
 */
router.post('/templates', workoutTemplateValidation, WorkoutController.createWorkoutTemplate);

/**
 * @route   GET /api/workouts/templates/:id
 * @desc    Obtener plantilla específica
 * @access  Private
 */
router.get('/templates/:id', idParamValidation, async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const templateId = req.params.id;

    const templateDoc = await db.collection('users').doc(userId)
      .collection('workoutTemplates')
      .doc(templateId)
      .get();

    if (!templateDoc.exists) {
      return res.status(404).json({
        error: 'Plantilla no encontrada'
      });
    }

    const templateData = templateDoc.data();

    res.json({
      template: {
        id: templateId,
        ...templateData,
        createdAt: templateData.createdAt.toDate().toISOString(),
        updatedAt: templateData.updatedAt?.toDate().toISOString()
      }
    });

  } catch (error) {
    console.error('Error obteniendo plantilla:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   PUT /api/workouts/templates/:id
 * @desc    Actualizar plantilla de entrenamiento
 * @access  Private
 */
router.put('/templates/:id', 
  idParamValidation, 
  workoutTemplateValidation, 
  WorkoutController.updateWorkoutTemplate
);

/**
 * @route   DELETE /api/workouts/templates/:id
 * @desc    Eliminar plantilla de entrenamiento
 * @access  Private
 */
router.delete('/templates/:id', idParamValidation, WorkoutController.deleteWorkoutTemplate);

/**
 * @route   POST /api/workouts/templates/:id/duplicate
 * @desc    Duplicar plantilla de entrenamiento
 * @access  Private
 */
router.post('/templates/:id/duplicate', idParamValidation, async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const templateId = req.params.id;

    // Obtener plantilla original
    const originalTemplate = await db.collection('users').doc(userId)
      .collection('workoutTemplates')
      .doc(templateId)
      .get();

    if (!originalTemplate.exists) {
      return res.status(404).json({
        error: 'Plantilla no encontrada'
      });
    }

    const originalData = originalTemplate.data();

    // Crear copia
    const duplicateData = {
      ...originalData,
      name: `${originalData.name} (Copia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      timesUsed: 0
    };

    const duplicateRef = await db.collection('users').doc(userId)
      .collection('workoutTemplates')
      .add(duplicateData);

    res.status(201).json({
      message: 'Plantilla duplicada correctamente',
      template: {
        id: duplicateRef.id,
        ...duplicateData,
        createdAt: duplicateData.createdAt.toISOString(),
        updatedAt: duplicateData.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error duplicando plantilla:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// ============================================
// SESIONES DE ENTRENAMIENTO
// ============================================

/**
 * @route   GET /api/workouts/sessions
 * @desc    Obtener sesiones de entrenamiento
 * @access  Private
 */
router.get('/sessions', paginationValidation, WorkoutController.getWorkoutSessions);

/**
 * @route   GET /api/workouts/sessions/:id
 * @desc    Obtener sesión específica
 * @access  Private
 */
router.get('/sessions/:id', idParamValidation, WorkoutController.getWorkoutSession);

/**
 * @route   POST /api/workouts/sessions
 * @desc    Crear nueva sesión de entrenamiento
 * @access  Private
 */
router.post('/sessions', workoutSessionValidation, WorkoutController.createWorkoutSession);

/**
 * @route   PUT /api/workouts/sessions/:id
 * @desc    Actualizar sesión de entrenamiento
 * @access  Private
 */
router.put('/sessions/:id', 
  idParamValidation, 
  workoutSessionValidation, 
  WorkoutController.updateWorkoutSession
);

/**
 * @route   DELETE /api/workouts/sessions/:id
 * @desc    Eliminar sesión de entrenamiento
 * @access  Private
 */
router.delete('/sessions/:id', idParamValidation, WorkoutController.deleteWorkoutSession);

/**
 * @route   GET /api/workouts/sessions/recent
 * @desc    Obtener sesiones recientes
 * @access  Private
 */
router.get('/sessions/recent', async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 5;

    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .orderBy('date', 'desc')
      .limit(limit)
      .get();

    const recentSessions = sessionsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString(),
      startTime: doc.data().startTime?.toDate().toISOString(),
      endTime: doc.data().endTime?.toDate().toISOString()
    }));

    res.json({
      sessions: recentSessions
    });

  } catch (error) {
    console.error('Error obteniendo sesiones recientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// ============================================
// EJERCICIOS
// ============================================

/**
 * @route   GET /api/workouts/exercises
 * @desc    Obtener ejercicios disponibles
 * @access  Private
 */
router.get('/exercises', WorkoutController.getExercises);

/**
 * @route   POST /api/workouts/exercises
 * @desc    Crear ejercicio personalizado
 * @access  Private
 */
router.post('/exercises', exerciseValidation, WorkoutController.createExercise);

/**
 * @route   PUT /api/workouts/exercises/:id
 * @desc    Actualizar ejercicio personalizado
 * @access  Private
 */
router.put('/exercises/:id', 
  idParamValidation, 
  exerciseValidation, 
  WorkoutController.updateExercise
);

/**
 * @route   DELETE /api/workouts/exercises/:id
 * @desc    Eliminar ejercicio personalizado
 * @access  Private
 */
router.delete('/exercises/:id', idParamValidation, async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const exerciseId = req.params.id;

    await db.collection('users').doc(userId)
      .collection('customExercises')
      .doc(exerciseId)
      .delete();

    res.json({
      message: 'Ejercicio eliminado correctamente'
    });

  } catch (error) {
    console.error('Error eliminando ejercicio:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/workouts/exercises/categories
 * @desc    Obtener categorías de ejercicios
 * @access  Private
 */
router.get('/exercises/categories', (req, res) => {
  const categories = [
    {
      id: 'strength',
      name: 'Fuerza',
      description: 'Ejercicios con pesas y resistencia',
      icon: '🏋️'
    },
    {
      id: 'cardio',
      name: 'Cardio',
      description: 'Ejercicios cardiovasculares',
      icon: '🏃'
    },
    {
      id: 'flexibility',
      name: 'Flexibilidad',
      description: 'Estiramientos y movilidad',
      icon: '🧘'
    },
    {
      id: 'sports',
      name: 'Deportes',
      description: 'Actividades deportivas específicas',
      icon: '⚽'
    },
    {
      id: 'functional',
      name: 'Funcional',
      description: 'Movimientos funcionales',
      icon: '💪'
    }
  ];

  res.json({ categories });
});

/**
 * @route   GET /api/workouts/exercises/muscle-groups
 * @desc    Obtener grupos musculares
 * @access  Private
 */
router.get('/exercises/muscle-groups', (req, res) => {
  const muscleGroups = [
    { id: 'chest', name: 'Pecho', icon: '💪' },
    { id: 'back', name: 'Espalda', icon: '🔙' },
    { id: 'shoulders', name: 'Hombros', icon: '🤷' },
    { id: 'arms', name: 'Brazos', icon: '💪' },
    { id: 'legs', name: 'Piernas', icon: '🦵' },
    { id: 'core', name: 'Core', icon: '🏋️' },
    { id: 'glutes', name: 'Glúteos', icon: '🍑' },
    { id: 'calves', name: 'Pantorrillas', icon: '🦵' },
    { id: 'forearms', name: 'Antebrazos', icon: '💪' }
  ];

  res.json({ muscleGroups });
});

// ============================================
// PROGRESIÓN Y CÁLCULOS
// ============================================

/**
 * @route   POST /api/workouts/calculate-progression
 * @desc    Calcular progresión para ejercicio
 * @access  Private
 */
router.post('/calculate-progression', progressionValidation, WorkoutController.calculateProgression);

/**
 * @route   POST /api/workouts/calculate-1rm
 * @desc    Calcular 1RM
 * @access  Private
 */
router.post('/calculate-1rm', oneRMValidation, WorkoutController.calculate1RM);

/**
 * @route   GET /api/workouts/1rm-history/:exerciseId
 * @desc    Obtener historial de 1RM para ejercicio
 * @access  Private
 */
router.get('/1rm-history/:exerciseId', 
  [require('express-validator').param('exerciseId').notEmpty().withMessage('Exercise ID es requerido'), handleValidationErrors],
  WorkoutController.get1RMHistory
);

/**
 * @route   GET /api/workouts/progression-history/:exerciseId
 * @desc    Obtener historial de progresión para ejercicio
 * @access  Private
 */
router.get('/progression-history/:exerciseId', 
  [require('express-validator').param('exerciseId').notEmpty().withMessage('Exercise ID es requerido'), handleValidationErrors],
  async (req, res) => {
    try {
      const { db } = require('../config/firebase');
      const userId = req.user.uid;
      const exerciseId = req.params.exerciseId;
      const timeframe = req.query.timeframe || '3m';

      // Calcular fecha de inicio
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '1m':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 3);
      }

      const sessionsQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .where('completed', '==', true)
        .where('date', '>=', startDate)
        .orderBy('date', 'asc')
        .get();

      const progressionHistory = [];
      
      sessionsQuery.docs.forEach(doc => {
        const session = doc.data();
        const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
        
        if (exercise && exercise.sets.length > 0) {
          const maxVolume = exercise.sets.reduce((max, set) => {
            const volume = (set.weight || 0) * (set.reps || 0);
            return volume > max ? volume : max;
          }, 0);

          const maxWeight = exercise.sets.reduce((max, set) => {
            return (set.weight || 0) > max ? (set.weight || 0) : max;
          }, 0);

          const totalVolume = exercise.sets.reduce((total, set) => {
            return total + ((set.weight || 0) * (set.reps || 0));
          }, 0);

          progressionHistory.push({
            date: session.date.toDate().toISOString(),
            maxWeight: maxWeight,
            maxVolume: maxVolume,
            totalVolume: totalVolume,
            totalSets: exercise.sets.length,
            totalReps: exercise.sets.reduce((total, set) => total + (set.reps || 0), 0)
          });
        }
      });

      res.json({
        exerciseId,
        timeframe,
        history: progressionHistory,
        summary: progressionHistory.length > 1 ? {
          startWeight: progressionHistory[0]?.maxWeight || 0,
          endWeight: progressionHistory[progressionHistory.length - 1]?.maxWeight || 0,
          weightGain: (progressionHistory[progressionHistory.length - 1]?.maxWeight || 0) - (progressionHistory[0]?.maxWeight || 0),
          startVolume: progressionHistory[0]?.totalVolume || 0,
          endVolume: progressionHistory[progressionHistory.length - 1]?.totalVolume || 0,
          totalSessions: progressionHistory.length
        } : null
      });

    } catch (error) {
      console.error('Error obteniendo historial de progresión:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
);

// ============================================
// ESTADÍSTICAS Y RESÚMENES
// ============================================

/**
 * @route   GET /api/workouts/stats
 * @desc    Obtener estadísticas generales de entrenamientos
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const timeframe = req.query.timeframe || '30d';

    // Calcular fechas
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Obtener sesiones del período
    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .where('date', '>=', startDate)
      .orderBy('date', 'desc')
      .get();

    const sessions = sessionsQuery.docs.map(doc => doc.data());

    // Calcular estadísticas
    const stats = {
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((total, session) => total + (session.duration || 0), 0),
      totalVolume: sessions.reduce((total, session) => total + (session.metrics?.totalVolume || 0), 0),
      averageDuration: sessions.length > 0 ? sessions.reduce((total, session) => total + (session.duration || 0), 0) / sessions.length : 0,
      averageVolume: sessions.length > 0 ? sessions.reduce((total, session) => total + (session.metrics?.totalVolume || 0), 0) / sessions.length : 0,
      exercisesPerformed: new Set(sessions.flatMap(session => session.exercises.map(ex => ex.exerciseId))).size,
      timeframe
    };

    res.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;