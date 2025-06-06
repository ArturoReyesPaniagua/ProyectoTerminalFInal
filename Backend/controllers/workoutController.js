// backend/src/controllers/workoutController.js
const { validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const ProgressiveOverload = require('../services/progressiveOverload');
const OneRepMaxCalculator = require('../services/oneRepMaxCalculator');

class WorkoutController {

  /**
   * Obtener plantillas de entrenamiento del usuario
   */
  static async getWorkoutTemplates(req, res) {
    try {
      const userId = req.user.uid;

      const templatesQuery = await db.collection('users').doc(userId)
        .collection('workoutTemplates')
        .orderBy('createdAt', 'desc')
        .get();

      const templates = templatesQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      }));

      res.json({
        templates: templates
      });

    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nueva plantilla de entrenamiento
   */
  static async createWorkoutTemplate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.uid;
      const { name, description, exercises, tags, estimatedDuration } = req.body;

      const templateData = {
        name,
        description,
        exercises,
        tags: tags || [],
        estimatedDuration: estimatedDuration || 60,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        timesUsed: 0
      };

      const templateRef = await db.collection('users').doc(userId)
        .collection('workoutTemplates')
        .add(templateData);

      const newTemplate = {
        id: templateRef.id,
        ...templateData,
        createdAt: templateData.createdAt.toISOString(),
        updatedAt: templateData.updatedAt.toISOString()
      };

      res.status(201).json({
        message: 'Plantilla creada correctamente',
        template: newTemplate
      });

    } catch (error) {
      console.error('Error creando plantilla:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar plantilla de entrenamiento
   */
  static async updateWorkoutTemplate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.uid;
      const templateId = req.params.id;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      await db.collection('users').doc(userId)
        .collection('workoutTemplates')
        .doc(templateId)
        .update(updateData);

      // Obtener la plantilla actualizada
      const updatedTemplate = await db.collection('users').doc(userId)
        .collection('workoutTemplates')
        .doc(templateId)
        .get();

      if (!updatedTemplate.exists) {
        return res.status(404).json({
          error: 'Plantilla no encontrada'
        });
      }

      const templateData = updatedTemplate.data();

      res.json({
        message: 'Plantilla actualizada correctamente',
        template: {
          id: templateId,
          ...templateData,
          createdAt: templateData.createdAt.toDate().toISOString(),
          updatedAt: templateData.updatedAt.toDate().toISOString()
        }
      });

    } catch (error) {
      console.error('Error actualizando plantilla:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar plantilla de entrenamiento
   */
  static async deleteWorkoutTemplate(req, res) {
    try {
      const userId = req.user.uid;
      const templateId = req.params.id;

      await db.collection('users').doc(userId)
        .collection('workoutTemplates')
        .doc(templateId)
        .delete();

      res.json({
        message: 'Plantilla eliminada correctamente'
      });

    } catch (error) {
      console.error('Error eliminando plantilla:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener sesiones de entrenamiento
   */
  static async getWorkoutSessions(req, res) {
    try {
      const userId = req.user.uid;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const sessionsQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .orderBy('date', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const sessions = sessionsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toISOString(),
        startTime: doc.data().startTime?.toDate().toISOString(),
        endTime: doc.data().endTime?.toDate().toISOString()
      }));

      // Contar total de sesiones para paginación
      const totalQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .get();

      res.json({
        sessions: sessions,
        pagination: {
          page: page,
          limit: limit,
          total: totalQuery.size,
          totalPages: Math.ceil(totalQuery.size / limit)
        }
      });

    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener sesión específica
   */
  static async getWorkoutSession(req, res) {
    try {
      const userId = req.user.uid;
      const sessionId = req.params.id;

      const sessionDoc = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .doc(sessionId)
        .get();

      if (!sessionDoc.exists) {
        return res.status(404).json({
          error: 'Sesión no encontrada'
        });
      }

      const sessionData = sessionDoc.data();

      res.json({
        session: {
          id: sessionId,
          ...sessionData,
          date: sessionData.date.toDate().toISOString(),
          startTime: sessionData.startTime?.toDate().toISOString(),
          endTime: sessionData.endTime?.toDate().toISOString()
        }
      });

    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nueva sesión de entrenamiento
   */
  static async createWorkoutSession(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.uid;
      const {
        name,
        templateId,
        exercises,
        notes,
        duration,
        startTime,
        endTime,
        completed
      } = req.body;

      // Calcular métricas de la sesión
      const totalVolume = exercises.reduce((total, exercise) => {
        const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight * set.reps * (set.completed ? 1 : 0));
        }, 0);
        return total + exerciseVolume;
      }, 0);

      const completedSets = exercises.reduce((total, exercise) => {
        return total + exercise.sets.filter(set => set.completed).length;
      }, 0);

      const totalSets = exercises.reduce((total, exercise) => {
        return total + exercise.sets.length;
      }, 0);

      const sessionData = {
        name,
        templateId,
        exercises,
        notes: notes || '',
        duration: duration || 0,
        date: new Date(),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
        completed: completed || false,
        metrics: {
          totalVolume,
          completedSets,
          totalSets,
          completionRate: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
          exercisesCompleted: exercises.filter(ex => 
            ex.sets.some(set => set.completed)
          ).length
        },
        createdAt: new Date()
      };

      const sessionRef = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .add(sessionData);

      // Actualizar contador de uso de plantilla si se usó una
      if (templateId) {
        try {
          await db.collection('users').doc(userId)
            .collection('workoutTemplates')
            .doc(templateId)
            .update({
              timesUsed: db.FieldValue.increment(1),
              lastUsed: new Date()
            });
        } catch (templateError) {
          console.warn('Error actualizando contador de plantilla:', templateError);
        }
      }

      const newSession = {
        id: sessionRef.id,
        ...sessionData,
        date: sessionData.date.toISOString(),
        startTime: sessionData.startTime.toISOString(),
        endTime: sessionData.endTime?.toISOString(),
        createdAt: sessionData.createdAt.toISOString()
      };

      res.status(201).json({
        message: 'Sesión guardada correctamente',
        session: newSession
      });

    } catch (error) {
      console.error('Error creando sesión:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar sesión de entrenamiento
   */
  static async updateWorkoutSession(req, res) {
    try {
      const userId = req.user.uid;
      const sessionId = req.params.id;
      
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      // Recalcular métricas si se actualizaron ejercicios
      if (updateData.exercises) {
        const totalVolume = updateData.exercises.reduce((total, exercise) => {
          const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
            return setTotal + (set.weight * set.reps * (set.completed ? 1 : 0));
          }, 0);
          return total + exerciseVolume;
        }, 0);

        const completedSets = updateData.exercises.reduce((total, exercise) => {
          return total + exercise.sets.filter(set => set.completed).length;
        }, 0);

        const totalSets = updateData.exercises.reduce((total, exercise) => {
          return total + exercise.sets.length;
        }, 0);

        updateData.metrics = {
          totalVolume,
          completedSets,
          totalSets,
          completionRate: totalSets > 0 ? (completedSets / totalSets) * 100 : 0,
          exercisesCompleted: updateData.exercises.filter(ex => 
            ex.sets.some(set => set.completed)
          ).length
        };
      }

      await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .doc(sessionId)
        .update(updateData);

      res.json({
        message: 'Sesión actualizada correctamente'
      });

    } catch (error) {
      console.error('Error actualizando sesión:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar sesión de entrenamiento
   */
  static async deleteWorkoutSession(req, res) {
    try {
      const userId = req.user.uid;
      const sessionId = req.params.id;

      await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .doc(sessionId)
        .delete();

      res.json({
        message: 'Sesión eliminada correctamente'
      });

    } catch (error) {
      console.error('Error eliminando sesión:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener ejercicios disponibles
   */
  static async getExercises(req, res) {
    try {
      const category = req.query.category;
      const muscleGroup = req.query.muscleGroup;

      // Ejercicios predefinidos del sistema
      let exercises = [
        {
          id: 'bench-press',
          name: 'Press de Banca',
          category: 'strength',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          equipment: 'barbell',
          description: 'Ejercicio básico para desarrollo del pecho',
          instructions: [
            'Acuéstate en el banco con los pies en el suelo',
            'Agarra la barra con las manos separadas al ancho de hombros',
            'Baja la barra hasta el pecho de forma controlada',
            'Empuja la barra hacia arriba hasta extender completamente los brazos'
          ],
          targetMuscles: ['pectorales', 'deltoides anterior', 'tríceps'],
          isSystemExercise: true
        },
        {
          id: 'squat',
          name: 'Sentadillas',
          category: 'strength',
          muscleGroups: ['legs', 'glutes'],
          equipment: 'barbell',
          description: 'Ejercicio fundamental para el tren inferior',
          instructions: [
            'Coloca la barra sobre los trapecios',
            'Baja como si fueras a sentarte manteniendo la espalda recta',
            'Desciende hasta que los muslos estén paralelos al suelo',
            'Sube de forma explosiva hasta la posición inicial'
          ],
          targetMuscles: ['cuádriceps', 'glúteos', 'isquiotibiales'],
          isSystemExercise: true
        },
        {
          id: 'deadlift',
          name: 'Peso Muerto',
          category: 'strength',
          muscleGroups: ['back', 'legs', 'glutes'],
          equipment: 'barbell',
          description: 'Ejercicio completo para múltiples grupos musculares',
          instructions: [
            'Colócate frente a la barra con los pies al ancho de hombros',
            'Agarra la barra con las manos fuera de las piernas',
            'Mantén la espalda recta y levanta la barra',
            'Extiende caderas y rodillas simultáneamente'
          ],
          targetMuscles: ['dorsales', 'trapecios', 'glúteos', 'isquiotibiales'],
          isSystemExercise: true
        },
        {
          id: 'pull-ups',
          name: 'Dominadas',
          category: 'strength',
          muscleGroups: ['back', 'biceps'],
          equipment: 'bodyweight',
          description: 'Ejercicio de peso corporal para la espalda',
          instructions: [
            'Cuelga de la barra con agarre prono',
            'Tira del cuerpo hacia arriba hasta que el mentón pase la barra',
            'Baja de forma controlada hasta extender completamente los brazos',
            'Mantén el core activado durante todo el movimiento'
          ],
          targetMuscles: ['dorsales', 'romboides', 'bíceps'],
          isSystemExercise: true
        },
        {
          id: 'overhead-press',
          name: 'Press Militar',
          category: 'strength',
          muscleGroups: ['shoulders', 'triceps'],
          equipment: 'barbell',
          description: 'Ejercicio para desarrollo de hombros',
          instructions: [
            'Párate con los pies al ancho de hombros',
            'Agarra la barra a la altura de hombros',
            'Presiona la barra hacia arriba hasta extender los brazos',
            'Baja la barra de forma controlada'
          ],
          targetMuscles: ['deltoides', 'tríceps', 'core'],
          isSystemExercise: true
        }
      ];

      // Obtener ejercicios personalizados del usuario
      const userId = req.user.uid;
      const customExercisesQuery = await db.collection('users').doc(userId)
        .collection('customExercises')
        .get();

      const customExercises = customExercisesQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isSystemExercise: false,
        createdAt: doc.data().createdAt.toDate().toISOString()
      }));

      exercises = [...exercises, ...customExercises];

      // Filtrar por categoría si se especifica
      if (category) {
        exercises = exercises.filter(ex => ex.category === category);
      }

      // Filtrar por grupo muscular si se especifica
      if (muscleGroup) {
        exercises = exercises.filter(ex => 
          ex.muscleGroups.includes(muscleGroup)
        );
      }

      res.json({
        exercises: exercises
      });

    } catch (error) {
      console.error('Error obteniendo ejercicios:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear ejercicio personalizado
   */
  static async createExercise(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.uid;
      const {
        name,
        category,
        muscleGroups,
        equipment,
        description,
        instructions,
        targetMuscles
      } = req.body;

      const exerciseData = {
        name,
        category,
        muscleGroups,
        equipment,
        description,
        instructions: instructions || [],
        targetMuscles: targetMuscles || [],
        createdAt: new Date(),
        isActive: true
      };

      const exerciseRef = await db.collection('users').doc(userId)
        .collection('customExercises')
        .add(exerciseData);

      const newExercise = {
        id: exerciseRef.id,
        ...exerciseData,
        isSystemExercise: false,
        createdAt: exerciseData.createdAt.toISOString()
      };

      res.status(201).json({
        message: 'Ejercicio creado correctamente',
        exercise: newExercise
      });

    } catch (error) {
      console.error('Error creando ejercicio:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar ejercicio personalizado
   */
  static async updateExercise(req, res) {
    try {
      const userId = req.user.uid;
      const exerciseId = req.params.id;

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      await db.collection('users').doc(userId)
        .collection('customExercises')
        .doc(exerciseId)
        .update(updateData);

      res.json({
        message: 'Ejercicio actualizado correctamente'
      });

    } catch (error) {
      console.error('Error actualizando ejercicio:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Calcular progresión para ejercicio
   */
  static async calculateProgression(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.uid;
      const { exerciseId, userLevel = 'intermediate' } = req.body;

      // Obtener historial del ejercicio
      const sessionsQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .where('completed', '==', true)
        .orderBy('date', 'desc')
        .limit(10)
        .get();

      const recentSessions = sessionsQuery.docs.map(doc => doc.data());
      
      // Encontrar datos del ejercicio específico
      const exerciseHistory = [];
      recentSessions.forEach(session => {
        const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
        if (exercise) {
          exerciseHistory.push({
            date: session.date.toDate(),
            ...exercise
          });
        }
      });

      if (exerciseHistory.length === 0) {
        return res.status(404).json({
          error: 'No se encontró historial para este ejercicio'
        });
      }

      const lastPerformance = exerciseHistory[0];
      
      // Calcular progresión usando el servicio
      const progressiveOverload = new ProgressiveOverload();
      const progression = progressiveOverload.calculateProgression(
        {
          lastPerformance: {
            weight: lastPerformance.sets[0]?.weight || 0,
            reps: lastPerformance.sets[0]?.reps || 0,
            sets: lastPerformance.sets.length,
            rpe: lastPerformance.sets[0]?.rpe || 7
          },
          targets: {
            targetReps: { min: 8, max: 12 },
            targetSets: { min: 3, max: 5 },
            targetRPE: 8
          }
        },
        userLevel,
        recentSessions
      );

      res.json({
        progression: progression,
        exerciseHistory: exerciseHistory.slice(0, 5).map(hist => ({
          date: hist.date.toISOString(),
          sets: hist.sets
        }))
      });

    } catch (error) {
      console.error('Error calculando progresión:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Calcular 1RM
   */
  static async calculate1RM(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { weight, reps, method = 'composite' } = req.body;

      const oneRM = OneRepMaxCalculator.calculate(weight, reps, method);
      const percentageTable = OneRepMaxCalculator.getPercentageTable(oneRM);

      res.json({
        oneRM: oneRM,
        percentageTable: percentageTable,
        method: method,
        input: { weight, reps }
      });

    } catch (error) {
      console.error('Error calculando 1RM:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de 1RM para un ejercicio
   */
  static async get1RMHistory(req, res) {
    try {
      const userId = req.user.uid;
      const exerciseId = req.params.exerciseId;

      const sessionsQuery = await db.collection('users').doc(userId)
        .collection('workoutSessions')
        .where('completed', '==', true)
        .orderBy('date', 'desc')
        .get();

      const oneRMHistory = [];
      
      sessionsQuery.docs.forEach(doc => {
        const session = doc.data();
        const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
        
        if (exercise && exercise.sets.length > 0) {
          // Encontrar el set con mayor peso/reps para estimar 1RM
          const bestSet = exercise.sets.reduce((best, set) => {
            if (!set.completed) return best;
            
            const currentEstimate = OneRepMaxCalculator.calculate(set.weight, set.reps);
            const bestEstimate = best ? OneRepMaxCalculator.calculate(best.weight, best.reps) : 0;
            
            return currentEstimate > bestEstimate ? set : best;
          }, null);

          if (bestSet) {
            const estimatedOneRM = OneRepMaxCalculator.calculate(bestSet.weight, bestSet.reps);
            oneRMHistory.push({
              date: session.date.toDate().toISOString(),
              oneRM: estimatedOneRM,
              actualWeight: bestSet.weight,
              actualReps: bestSet.reps
            });
          }
        }
      });

      // Analizar progresión
      const progression = oneRMHistory.length > 1 ? 
        OneRepMaxCalculator.analyzeStrengthProgression(oneRMHistory, exerciseId) : null;

      res.json({
        history: oneRMHistory,
        progression: progression
      });

    } catch (error) {
      console.error('Error obteniendo historial 1RM:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = WorkoutController;