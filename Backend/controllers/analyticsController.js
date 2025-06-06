// backend/src/controllers/analyticsController.js
const { db } = require('../config/firebase');
const { startOfWeek, endOfWeek, subDays, subMonths, subYears } = require('date-fns');

class AnalyticsController {

  /**
   * Obtener estadísticas del dashboard
   */
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user.uid;
      const timeframe = req.query.timeframe || '30d';

      // Calcular fechas basadas en timeframe
      const now = new Date();
      let startDate = new Date();

      switch (timeframe) {
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '90d':
          startDate = subDays(now, 90);
          break;
        case '1y':
          startDate = subYears(now, 1);
          break;
        default:
          startDate = subDays(now, 30);
      }

      // Obtener sesiones de entrenamiento del período
      const sessionsQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .where('date', '>=', startDate)
        .where('completed', '==', true)
        .orderBy('date', 'desc')
        .get();

      const sessions = sessionsQuery.docs.map(doc => doc.data());

      // Calcular estadísticas de la semana actual
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      
      const thisWeekSessions = sessions.filter(session => {
        const sessionDate = session.date.toDate();
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      // Semana anterior para comparación
      const lastWeekStart = subDays(weekStart, 7);
      const lastWeekEnd = subDays(weekEnd, 7);
      
      const lastWeekSessions = sessions.filter(session => {
        const sessionDate = session.date.toDate();
        return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
      });

      // Calcular métricas principales
      const workoutsThisWeek = thisWeekSessions.length;
      const workoutsLastWeek = lastWeekSessions.length;
      const weeklyChange = lastWeekSessions.length > 0 
        ? ((workoutsThisWeek - workoutsLastWeek) / workoutsLastWeek) * 100 
        : 0;

      // Calcular racha actual
      const currentStreak = await this.calculateCurrentStreak(userId);

      // Volumen semanal
      const weeklyVolume = thisWeekSessions.reduce((total, session) => {
        return total + (session.metrics?.totalVolume || 0);
      }, 0);

      const lastWeekVolume = lastWeekSessions.reduce((total, session) => {
        return total + (session.metrics?.totalVolume || 0);
      }, 0);

      const volumeChange = lastWeekVolume > 0 
        ? ((weeklyVolume - lastWeekVolume) / lastWeekVolume) * 100 
        : 0;

      // Obtener última medición de grasa corporal
      const latestBodyFat = await this.getLatestBodyFat(userId);

      // Historial de volumen para gráficos
      const volumeHistory = await this.getVolumeHistory(userId, timeframe);

      // Estadísticas semanales detalladas
      const weeklyStats = {
        totalWorkouts: workoutsThisWeek,
        totalDuration: thisWeekSessions.reduce((total, session) => total + (session.duration || 0), 0),
        exercisesCompleted: thisWeekSessions.reduce((total, session) => {
          return total + (session.metrics?.exercisesCompleted || 0);
        }, 0),
        personalRecords: await this.countPersonalRecords(userId, weekStart, weekEnd)
      };

      const dashboardStats = {
        workoutsThisWeek,
        weeklyGoal: 5, // Podría ser configurable por usuario
        weeklyChange,
        currentStreak: currentStreak.days,
        streakChange: currentStreak.change,
        weeklyVolume,
        volumeChange,
        latestBodyFat: latestBodyFat.value,
        bodyFatChange: latestBodyFat.change,
        volumeHistory,
        weeklyStats,
        timeframe
      };

      res.json(dashboardStats);

    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener análisis de progresión
   */
  static async getProgressionAnalytics(req, res) {
    try {
      const userId = req.user.uid;
      const { exerciseIds, timeframe = '6m' } = req.body;

      const analytics = {};

      for (const exerciseId of exerciseIds) {
        const progression = await this.analyzeExerciseProgression(userId, exerciseId, timeframe);
        analytics[exerciseId] = progression;
      }

      res.json({
        analytics,
        timeframe
      });

    } catch (error) {
      console.error('Error obteniendo analytics de progresión:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener tendencias de composición corporal
   */
  static async getBodyCompositionTrends(req, res) {
    try {
      const userId = req.user.uid;
      const timeframe = req.query.timeframe || '6m';

      // Calcular fecha de inicio
      const now = new Date();
      let startDate = new Date();

      switch (timeframe) {
        case '3m':
          startDate = subMonths(now, 3);
          break;
        case '6m':
          startDate = subMonths(now, 6);
          break;
        case '1y':
          startDate = subYears(now, 1);
          break;
        default:
          startDate = subMonths(now, 6);
      }

      const measurementsQuery = await db.collection('users').doc(userId)
        .collection('measurements')
        .where('date', '>=', startDate)
        .orderBy('date', 'asc')
        .get();

      const trends = measurementsQuery.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date.toDate().toISOString(),
          bodyFat: data.bodyFat,
          weight: data.weight,
          bmi: data.bmi,
          classification: data.classification
        };
      }).filter(measurement => measurement.bodyFat !== null);

      // Calcular tendencias
      const analysis = {
        trends,
        summary: trends.length > 1 ? {
          startValue: trends[0].bodyFat,
          endValue: trends[trends.length - 1].bodyFat,
          change: trends[trends.length - 1].bodyFat - trends[0].bodyFat,
          changePercentage: ((trends[trends.length - 1].bodyFat - trends[0].bodyFat) / trends[0].bodyFat) * 100,
          trend: trends[trends.length - 1].bodyFat < trends[0].bodyFat ? 'decreasing' : 'increasing'
        } : null
      };

      res.json(analysis);

    } catch (error) {
      console.error('Error obteniendo tendencias de composición corporal:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener análisis de consistencia
   */
  static async getWorkoutConsistency(req, res) {
    try {
      const userId = req.user.uid;
      const timeframe = req.query.timeframe || '3m';

      const now = new Date();
      let startDate = subMonths(now, 3);

      if (timeframe === '6m') startDate = subMonths(now, 6);
      if (timeframe === '1y') startDate = subYears(now, 1);

      const sessionsQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .where('date', '>=', startDate)
        .where('completed', '==', true)
        .orderBy('date', 'asc')
        .get();

      const sessions = sessionsQuery.docs.map(doc => ({
        date: doc.data().date.toDate(),
        duration: doc.data().duration || 0
      }));

      // Analizar consistencia por semanas
      const weeklyConsistency = this.analyzeWeeklyConsistency(sessions, startDate, now);

      res.json({
        weeklyConsistency,
        summary: {
          totalWorkouts: sessions.length,
          averagePerWeek: weeklyConsistency.reduce((sum, week) => sum + week.workouts, 0) / weeklyConsistency.length,
          mostActiveWeek: weeklyConsistency.reduce((max, week) => week.workouts > max.workouts ? week : max, weeklyConsistency[0]),
          consistencyScore: this.calculateConsistencyScore(weeklyConsistency)
        }
      });

    } catch (error) {
      console.error('Error obteniendo análisis de consistencia:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener recomendaciones personalizadas
   */
  static async getRecommendations(req, res) {
    try {
      const userId = req.user.uid;
      const recommendations = [];

      // Obtener datos del usuario
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      // Análizar consistencia reciente
      const recentSessions = await this.getRecentSessions(userId, 14); // Últimas 2 semanas
      
      if (recentSessions.length < 3) {
        recommendations.push({
          id: 'consistency_low',
          type: 'consistency',
          title: 'Mejora tu consistencia',
          message: `Has entrenado solo ${recentSessions.length} veces en las últimas 2 semanas. Intenta mantener al menos 4 sesiones semanales.`,
          priority: 'high',
          icon: 'clock'
        });
      }

      // Analizar progresión estancada
      const stagnantExercises = await this.findStagnantExercises(userId);
      if (stagnantExercises.length > 0) {
        recommendations.push({
          id: 'progression_stagnant',
          type: 'progression',
          title: 'Varía tu entrenamiento',
          message: `Algunos ejercicios no han progresado en 3+ semanas: ${stagnantExercises.slice(0, 2).join(', ')}`,
          priority: 'medium',
          icon: 'trending-up'
        });
      }

      // Verificar sobreentrenamiento
      const consecutiveDays = await this.getConsecutiveTrainingDays(userId);
      if (consecutiveDays >= 6) {
        recommendations.push({
          id: 'recovery_needed',
          type: 'recovery',
          title: 'Considera un día de descanso',
          message: `Has entrenado ${consecutiveDays} días consecutivos. Un día de descanso podría beneficiarte.`,
          priority: 'medium',
          icon: 'alert'
        });
      }

      // Recomendaciones de mediciones
      const lastMeasurement = await this.getLastMeasurementDate(userId);
      const daysSinceLastMeasurement = lastMeasurement ? 
        Math.floor((new Date() - lastMeasurement) / (1000 * 60 * 60 * 24)) : 999;

      if (daysSinceLastMeasurement > 30) {
        recommendations.push({
          id: 'measurements_update',
          type: 'measurements',
          title: 'Actualiza tus medidas',
          message: 'Han pasado más de 30 días desde tu última medición corporal.',
          priority: 'low',
          icon: 'ruler'
        });
      }

      res.json(recommendations);

    } catch (error) {
      console.error('Error obteniendo recomendaciones:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener logros del usuario
   */
  static async getAchievements(req, res) {
    try {
      const userId = req.user.uid;
      const achievements = [];

      // Logros de consistencia
      const streak = await this.calculateCurrentStreak(userId);
      if (streak.days >= 7) {
        achievements.push({
          id: 'streak_week',
          title: 'Racha Semanal',
          description: `${streak.days} días consecutivos entrenando`,
          type: 'consistency',
          level: streak.days >= 30 ? 'gold' : streak.days >= 14 ? 'silver' : 'bronze',
          unlockedAt: new Date().toISOString()
        });
      }

      // Logros de volumen
      const totalVolume = await this.calculateTotalVolume(userId);
      if (totalVolume >= 100000) {
        achievements.push({
          id: 'volume_100k',
          title: 'Guerrero del Hierro',
          description: `${Math.round(totalVolume).toLocaleString()} kg de volumen total`,
          type: 'volume',
          level: totalVolume >= 500000 ? 'gold' : totalVolume >= 250000 ? 'silver' : 'bronze',
          unlockedAt: new Date().toISOString()
        });
      }

      // Logros de entrenamientos completados
      const totalWorkouts = await this.getTotalWorkouts(userId);
      const workoutMilestones = [10, 25, 50, 100, 250, 500];
      const highestMilestone = workoutMilestones.reverse().find(milestone => totalWorkouts >= milestone);
      
      if (highestMilestone) {
        achievements.push({
          id: `workouts_${highestMilestone}`,
          title: `${highestMilestone} Entrenamientos`,
          description: `Has completado ${totalWorkouts} entrenamientos`,
          type: 'milestones',
          level: highestMilestone >= 250 ? 'gold' : highestMilestone >= 50 ? 'silver' : 'bronze',
          unlockedAt: new Date().toISOString()
        });
      }

      res.json({
        achievements,
        summary: {
          total: achievements.length,
          gold: achievements.filter(a => a.level === 'gold').length,
          silver: achievements.filter(a => a.level === 'silver').length,
          bronze: achievements.filter(a => a.level === 'bronze').length
        }
      });

    } catch (error) {
      console.error('Error obteniendo logros:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  // Métodos auxiliares

  static async calculateCurrentStreak(userId) {
    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .orderBy('date', 'desc')
      .limit(90)
      .get();

    const sessions = sessionsQuery.docs.map(doc => doc.data().date.toDate());
    
    if (sessions.length === 0) return { days: 0, change: 0 };

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);

    for (const sessionDate of sessions) {
      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        if (daysDiff === streak || daysDiff === streak + 1) {
          streak = daysDiff + 1;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return { days: streak, change: 0 }; // Cambio requeriría comparar con período anterior
  }

  static async getLatestBodyFat(userId) {
    const measurementQuery = await db.collection('users').doc(userId)
      .collection('measurements')
      .where('bodyFat', '!=', null)
      .orderBy('date', 'desc')
      .limit(2)
      .get();

    const measurements = measurementQuery.docs.map(doc => doc.data());
    
    if (measurements.length === 0) return { value: 0, change: 0 };
    
    const latest = measurements[0];
    const previous = measurements[1];
    
    const change = previous ? 
      ((latest.bodyFat - previous.bodyFat) / previous.bodyFat) * 100 : 0;

    return { value: latest.bodyFat, change };
  }

  static async getVolumeHistory(userId, timeframe) {
    const now = new Date();
    let startDate = subDays(now, 30);

    if (timeframe === '7d') startDate = subDays(now, 7);
    if (timeframe === '90d') startDate = subDays(now, 90);
    if (timeframe === '1y') startDate = subYears(now, 1);

    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('date', '>=', startDate)
      .where('completed', '==', true)
      .orderBy('date', 'asc')
      .get();

    const sessions = sessionsQuery.docs.map(doc => ({
      date: doc.data().date.toDate().toISOString().split('T')[0],
      volume: doc.data().metrics?.totalVolume || 0
    }));

    // Agrupar por fecha y sumar volumen
    const volumeByDate = sessions.reduce((acc, session) => {
      const date = session.date;
      acc[date] = (acc[date] || 0) + session.volume;
      return acc;
    }, {});

    return Object.entries(volumeByDate).map(([date, volume]) => ({
      date,
      volume
    }));
  }

  static async countPersonalRecords(userId, startDate, endDate) {
    // Implementación simplificada - en producción sería más compleja
    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .where('completed', '==', true)
      .get();

    // Por ahora retornamos un número simulado
    return Math.floor(Math.random() * 3);
  }

  static analyzeWeeklyConsistency(sessions, startDate, endDate) {
    const weeks = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      const weekSessions = sessions.filter(session => 
        session.date >= weekStart && session.date <= weekEnd
      );

      weeks.push({
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        workouts: weekSessions.length,
        totalDuration: weekSessions.reduce((sum, s) => sum + s.duration, 0)
      });

      currentDate = new Date(weekEnd);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeks;
  }

  static calculateConsistencyScore(weeklyData) {
    if (weeklyData.length === 0) return 0;
    
    const targetWorkoutsPerWeek = 4;
    const scores = weeklyData.map(week => 
      Math.min(week.workouts / targetWorkoutsPerWeek, 1) * 100
    );
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  static async getRecentSessions(userId, days) {
    const startDate = subDays(new Date(), days);
    
    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('date', '>=', startDate)
      .where('completed', '==', true)
      .get();

    return sessionsQuery.docs.map(doc => doc.data());
  }

  static async findStagnantExercises(userId) {
    // Implementación simplificada
    return ['Press Banca', 'Sentadillas'];
  }

  static async getConsecutiveTrainingDays(userId) {
    // Implementación simplificada
    return Math.floor(Math.random() * 8);
  }

  static async getLastMeasurementDate(userId) {
    const measurementQuery = await db.collection('users').doc(userId)
      .collection('measurements')
      .orderBy('date', 'desc')
      .limit(1)
      .get();

    if (measurementQuery.empty) return null;
    
    return measurementQuery.docs[0].data().date.toDate();
  }

  static async calculateTotalVolume(userId) {
    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .get();

    return sessionsQuery.docs.reduce((total, doc) => {
      return total + (doc.data().metrics?.totalVolume || 0);
    }, 0);
  }

  static async getTotalWorkouts(userId) {
    const sessionsQuery = await db.collection('users').doc(userId)
      .collection('workoutSessions')
      .where('completed', '==', true)
      .get();

    return sessionsQuery.size;
  }
}

module.exports = AnalyticsController;