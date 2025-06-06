// backend/src/routes/analytics.js
const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');
const { timeframeValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Obtener estadísticas del dashboard
 * @access  Private
 */
router.get('/dashboard', timeframeValidation, AnalyticsController.getDashboardStats);

/**
 * @route   POST /api/analytics/progression
 * @desc    Obtener análisis de progresión
 * @access  Private
 */
router.post('/progression', [
  require('express-validator').body('exerciseIds')
    .isArray({ min: 1 })
    .withMessage('Se requiere al menos un ID de ejercicio'),
  require('express-validator').body('exerciseIds.*')
    .notEmpty()
    .withMessage('ID de ejercicio no puede estar vacío'),
  require('express-validator').body('timeframe')
    .optional()
    .isIn(['3m', '6m', '1y'])
    .withMessage('Timeframe debe ser: 3m, 6m o 1y'),
  handleValidationErrors
], AnalyticsController.getProgressionAnalytics);

/**
 * @route   GET /api/analytics/body-composition
 * @desc    Obtener tendencias de composición corporal
 * @access  Private
 */
router.get('/body-composition', timeframeValidation, AnalyticsController.getBodyCompositionTrends);

/**
 * @route   GET /api/analytics/consistency
 * @desc    Obtener análisis de consistencia
 * @access  Private
 */
router.get('/consistency', timeframeValidation, AnalyticsController.getWorkoutConsistency);

/**
 * @route   GET /api/analytics/strength/:exerciseId
 * @desc    Obtener análisis de fuerza para ejercicio específico
 * @access  Private
 */
router.get('/strength/:exerciseId', [
  require('express-validator').param('exerciseId')
    .notEmpty()
    .withMessage('Exercise ID es requerido'),
  timeframeValidation,
  handleValidationErrors
], async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const exerciseId = req.params.exerciseId;
    const timeframe = req.query.timeframe || '6m';

    // Calcular fecha de inicio
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
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
        startDate.setMonth(now.getMonth() - 6);
    }

    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .where('date', '>=', startDate)
      .orderBy('date', 'asc')
      .get();

    const strengthData = [];
    const OneRepMaxCalculator = require('../services/oneRepMaxCalculator');
    
    sessionsQuery.docs.forEach(doc => {
      const session = doc.data();
      const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
      
      if (exercise && exercise.sets.length > 0) {
        // Encontrar el mejor set (mayor peso * reps)
        const bestSet = exercise.sets.reduce((best, set) => {
          if (!set.completed) return best;
          
          const currentScore = (set.weight || 0) * (set.reps || 1);
          const bestScore = best ? (best.weight || 0) * (best.reps || 1) : 0;
          
          return currentScore > bestScore ? set : best;
        }, null);

        if (bestSet) {
          const estimatedOneRM = OneRepMaxCalculator.calculate(bestSet.weight, bestSet.reps);
          
          strengthData.push({
            date: session.date.toDate().toISOString(),
            weight: bestSet.weight,
            reps: bestSet.reps,
            estimatedOneRM: estimatedOneRM,
            volume: exercise.sets.reduce((total, set) => total + ((set.weight || 0) * (set.reps || 0)), 0),
            totalSets: exercise.sets.length
          });
        }
      }
    });

    // Análisis de tendencias
    let analysis = null;
    if (strengthData.length > 1) {
      const first = strengthData[0];
      const last = strengthData[strengthData.length - 1];
      
      analysis = {
        strengthGain: last.estimatedOneRM - first.estimatedOneRM,
        strengthGainPercentage: ((last.estimatedOneRM - first.estimatedOneRM) / first.estimatedOneRM) * 100,
        volumeGain: last.volume - first.volume,
        volumeGainPercentage: ((last.volume - first.volume) / first.volume) * 100,
        averageOneRM: strengthData.reduce((sum, data) => sum + data.estimatedOneRM, 0) / strengthData.length,
        peakOneRM: Math.max(...strengthData.map(data => data.estimatedOneRM)),
        totalSessions: strengthData.length,
        trend: last.estimatedOneRM > first.estimatedOneRM ? 'improving' : 'declining'
      };
    }

    res.json({
      exerciseId,
      timeframe,
      strengthData,
      analysis
    });

  } catch (error) {
    console.error('Error obteniendo análisis de fuerza:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/analytics/volume-progression
 * @desc    Obtener progresión de volumen
 * @access  Private
 */
router.get('/volume-progression', timeframeValidation, async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const timeframe = req.query.timeframe || '30d';
    const exerciseId = req.query.exerciseId;

    // Calcular fecha de inicio
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
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    let query = db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .where('date', '>=', startDate)
      .orderBy('date', 'asc');

    const sessionsQuery = await query.get();
    const volumeData = [];

    sessionsQuery.docs.forEach(doc => {
      const session = doc.data();
      const sessionDate = session.date.toDate().toISOString().split('T')[0];
      
      if (exerciseId) {
        // Volumen para ejercicio específico
        const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
        if (exercise) {
          const exerciseVolume = exercise.sets.reduce((total, set) => {
            return total + ((set.weight || 0) * (set.reps || 0));
          }, 0);
          
          volumeData.push({
            date: sessionDate,
            volume: exerciseVolume,
            exerciseId: exerciseId
          });
        }
      } else {
        // Volumen total de la sesión
        const totalVolume = session.metrics?.totalVolume || 0;
        volumeData.push({
          date: sessionDate,
          volume: totalVolume
        });
      }
    });

    // Agrupar por fecha y sumar volúmenes del mismo día
    const groupedData = volumeData.reduce((acc, curr) => {
      const existing = acc.find(item => item.date === curr.date);
      if (existing) {
        existing.volume += curr.volume;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    res.json({
      timeframe,
      exerciseId: exerciseId || null,
      volumeProgression: groupedData.sort((a, b) => a.date.localeCompare(b.date))
    });

  } catch (error) {
    console.error('Error obteniendo progresión de volumen:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

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

/**
 * @route   GET /api/analytics/weekly-summary
 * @desc    Obtener resumen semanal
 * @access  Private
 */
router.get('/weekly-summary', async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const { startOfWeek, endOfWeek } = require('date-fns');

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Lunes
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // Domingo

    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .where('date', '>=', weekStart)
      .where('date', '<=', weekEnd)
      .orderBy('date', 'asc')
      .get();

    const sessions = sessionsQuery.docs.map(doc => doc.data());

    const summary = {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((total, session) => total + (session.duration || 0), 0),
      totalVolume: sessions.reduce((total, session) => total + (session.metrics?.totalVolume || 0), 0),
      averageDuration: sessions.length > 0 ? sessions.reduce((total, session) => total + (session.duration || 0), 0) / sessions.length : 0,
      sessionsByDay: sessions.reduce((acc, session) => {
        const dayName = session.date.toDate().toLocaleDateString('es-ES', { weekday: 'long' });
        acc[dayName] = (acc[dayName] || 0) + 1;
        return acc;
      }, {}),
      topExercises: this.getTopExercisesFromSessions(sessions),
      weeklyGoal: 5, // Podría ser configurable
      goalProgress: (sessions.length / 5) * 100
    };

    res.json(summary);

  } catch (error) {
    console.error('Error obteniendo resumen semanal:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/analytics/monthly-trends
 * @desc    Obtener tendencias mensuales
 * @access  Private
 */
router.get('/monthly-trends', async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const { subMonths, startOfMonth, endOfMonth } = require('date-fns');

    const months = parseInt(req.query.months) || 6;
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const sessionsQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .where('completed', '==', true)
        .where('date', '>=', monthStart)
        .where('date', '<=', monthEnd)
        .get();

      const sessions = sessionsQuery.docs.map(doc => doc.data());

      trends.push({
        month: monthDate.toISOString().slice(0, 7), // YYYY-MM
        monthName: monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        totalSessions: sessions.length,
        totalDuration: sessions.reduce((total, session) => total + (session.duration || 0), 0),
        totalVolume: sessions.reduce((total, session) => total + (session.metrics?.totalVolume || 0), 0),
        averageSessionDuration: sessions.length > 0 ? sessions.reduce((total, session) => total + (session.duration || 0), 0) / sessions.length : 0
      });
    }

    res.json({
      monthlyTrends: trends,
      period: `${months} meses`
    });

  } catch (error) {
    console.error('Error obteniendo tendencias mensuales:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/analytics/personal-records
 * @desc    Obtener récords personales
 * @access  Private
 */
router.get('/personal-records', async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const userId = req.user.uid;
    const OneRepMaxCalculator = require('../services/oneRepMaxCalculator');

    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .orderBy('date', 'desc')
      .get();

    const personalRecords = new Map();

    sessionsQuery.docs.forEach(doc => {
      const session = doc.data();
      
      session.exercises.forEach(exercise => {
        const exerciseId = exercise.exerciseId;
        
        exercise.sets.forEach(set => {
          if (!set.completed) return;
          
          const weight = set.weight || 0;
          const reps = set.reps || 0;
          const volume = weight * reps;
          
          // Calcular 1RM estimado
          let estimatedOneRM = 0;
          if (reps > 0 && weight > 0) {
            try {
              estimatedOneRM = OneRepMaxCalculator.calculate(weight, reps);
            } catch (error) {
              estimatedOneRM = weight; // Fallback
            }
          }

          const current = personalRecords.get(exerciseId) || {
            exerciseId,
            maxWeight: { weight: 0, reps: 0, date: null },
            maxReps: { weight: 0, reps: 0, date: null },
            maxVolume: { weight: 0, reps: 0, volume: 0, date: null },
            maxOneRM: { weight: 0, reps: 0, estimatedOneRM: 0, date: null }
          };

          const sessionDate = session.date.toDate();

          // Récord de peso máximo
          if (weight > current.maxWeight.weight) {
            current.maxWeight = { weight, reps, date: sessionDate };
          }

          // Récord de repeticiones máximas (con el mismo peso o mayor)
          if (reps > current.maxReps.reps || 
              (reps === current.maxReps.reps && weight > current.maxReps.weight)) {
            current.maxReps = { weight, reps, date: sessionDate };
          }

          // Récord de volumen máximo en una serie
          if (volume > current.maxVolume.volume) {
            current.maxVolume = { weight, reps, volume, date: sessionDate };
          }

          // Récord de 1RM estimado
          if (estimatedOneRM > current.maxOneRM.estimatedOneRM) {
            current.maxOneRM = { weight, reps, estimatedOneRM, date: sessionDate };
          }

          personalRecords.set(exerciseId, current);
        });
      });
    });

    // Convertir Map a Array y añadir información del ejercicio
    const records = Array.from(personalRecords.values()).map(record => ({
      ...record,
      maxWeight: {
        ...record.maxWeight,
        date: record.maxWeight.date?.toISOString()
      },
      maxReps: {
        ...record.maxReps,
        date: record.maxReps.date?.toISOString()
      },
      maxVolume: {
        ...record.maxVolume,
        date: record.maxVolume.date?.toISOString()
      },
      maxOneRM: {
        ...record.maxOneRM,
        date: record.maxOneRM.date?.toISOString()
      }
    }));

    res.json({
      personalRecords: records,
      totalExercises: records.length
    });

  } catch (error) {
    console.error('Error obteniendo récords personales:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Función auxiliar para obtener ejercicios más realizados
function getTopExercisesFromSessions(sessions) {
  const exerciseCount = {};
  
  sessions.forEach(session => {
    session.exercises.forEach(exercise => {
      exerciseCount[exercise.exerciseId] = (exerciseCount[exercise.exerciseId] || 0) + 1;
    });
  });

  return Object.entries(exerciseCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([exerciseId, count]) => ({ exerciseId, count }));
}

module.exports = router;