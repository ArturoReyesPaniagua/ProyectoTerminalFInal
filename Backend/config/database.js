// backend/src/config/database.js
const { db } = require('./firebase');

/**
 * Configuración y utilidades para la base de datos Firestore
 */

class DatabaseConfig {
  
  /**
   * Inicializar colecciones y índices necesarios
   */
  static async initialize() {
    try {
      console.log('🔧 Inicializando configuración de base de datos...');
      
      // Verificar conexión
      await this.testConnection();
      
      // Crear índices si es necesario
      await this.createIndexes();
      
      // Inicializar datos del sistema si es necesario
      await this.initializeSystemData();
      
      console.log('✅ Base de datos configurada correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      throw error;
    }
  }

  /**
   * Verificar conexión a Firestore
   */
  static async testConnection() {
    try {
      // Hacer una consulta simple para verificar la conexión
      const testDoc = await db.collection('_test').doc('connection').get();
      console.log('🟢 Conexión a Firestore establecida');
      return true;
    } catch (error) {
      console.error('🔴 Error conectando a Firestore:', error);
      throw error;
    }
  }

  /**
   * Crear índices compuestos necesarios
   * Nota: En Firestore, los índices se crean automáticamente para consultas simples,
   * pero los índices compuestos deben crearse manualmente
   */
  static async createIndexes() {
    console.log('📊 Verificando índices de Firestore...');
    
    // Los índices compuestos se crean a través de la consola de Firebase
    // o mediante consultas que requieren el índice
    const indexesNeeded = [
      {
        collection: 'users/{userId}/workoutSessions',
        fields: [
          { field: 'completed', order: 'ASCENDING' },
          { field: 'date', order: 'DESCENDING' }
        ]
      },
      {
        collection: 'users/{userId}/workoutSessions',
        fields: [
          { field: 'completed', order: 'ASCENDING' },
          { field: 'date', order: 'ASCENDING' }
        ]
      },
      {
        collection: 'users/{userId}/measurements',
        fields: [
          { field: 'bodyFat', order: 'ASCENDING' },
          { field: 'date', order: 'ASCENDING' }
        ]
      },
      {
        collection: 'users/{userId}/measurements',
        fields: [
          { field: 'date', order: 'DESCENDING' }
        ]
      }
    ];

    console.log(`ℹ️  Se requieren ${indexesNeeded.length} índices compuestos`);
    console.log('📝 Los índices se crearán automáticamente cuando se ejecuten las consultas correspondientes');
    
    return indexesNeeded;
  }

  /**
   * Inicializar datos del sistema (ejercicios predefinidos, etc.)
   */
  static async initializeSystemData() {
    console.log('🏋️ Inicializando datos del sistema...');
    
    try {
      // Verificar si ya existen ejercicios del sistema
      const systemExercisesQuery = await db.collection('systemExercises').limit(1).get();
      
      if (systemExercisesQuery.empty) {
        console.log('📝 Creando ejercicios del sistema...');
        await this.createSystemExercises();
      } else {
        console.log('✅ Ejercicios del sistema ya existen');
      }

      // Verificar configuraciones del sistema
      await this.initializeSystemSettings();
      
    } catch (error) {
      console.error('❌ Error inicializando datos del sistema:', error);
      throw error;
    }
  }

  /**
   * Crear ejercicios predefinidos del sistema
   */
  static async createSystemExercises() {
    const ExerciseModel = require('../models/Exercise');
    
    const systemExercises = [
      {
        name: 'Press de Banca',
        alternativeNames: ['Bench Press', 'Press Plano'],
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: 'barbell',
        description: 'Ejercicio básico para desarrollo del pecho',
        instructions: [
          'Acuéstate en el banco con los pies firmemente apoyados en el suelo',
          'Agarra la barra con las manos separadas al ancho de los hombros',
          'Baja la barra hasta el pecho de forma controlada',
          'Empuja la barra hacia arriba hasta extender completamente los brazos'
        ],
        difficulty: 'intermediate',
        type: 'compound',
        defaultSets: 3,
        defaultReps: { min: 8, max: 12 },
        tags: ['pecho', 'fuerza', 'básico']
      },
      {
        name: 'Sentadillas',
        alternativeNames: ['Squats', 'Sentadilla con Barra'],
        category: 'strength',
        muscleGroups: ['legs', 'glutes', 'core'],
        equipment: 'barbell',
        description: 'Ejercicio fundamental para el tren inferior',
        instructions: [
          'Coloca la barra sobre los trapecios',
          'Separa los pies al ancho de los hombros',
          'Baja como si fueras a sentarte manteniendo la espalda recta',
          'Desciende hasta que los muslos estén paralelos al suelo',
          'Sube de forma explosiva hasta la posición inicial'
        ],
        difficulty: 'intermediate',
        type: 'compound',
        defaultSets: 3,
        defaultReps: { min: 8, max: 15 },
        tags: ['piernas', 'glúteos', 'fuerza', 'básico']
      },
      {
        name: 'Peso Muerto',
        alternativeNames: ['Deadlift', 'Peso Muerto Convencional'],
        category: 'strength',
        muscleGroups: ['back', 'legs', 'glutes', 'core'],
        equipment: 'barbell',
        description: 'Ejercicio completo para múltiples grupos musculares',
        instructions: [
          'Colócate frente a la barra con los pies al ancho de las caderas',
          'Agarra la barra con las manos fuera de las piernas',
          'Mantén la espalda recta y el pecho alto',
          'Levanta la barra extendiendo caderas y rodillas simultáneamente',
          'Mantén la barra cerca del cuerpo durante todo el movimiento'
        ],
        difficulty: 'advanced',
        type: 'compound',
        defaultSets: 3,
        defaultReps: { min: 5, max: 8 },
        tags: ['espalda', 'piernas', 'fuerza', 'básico']
      },
      {
        name: 'Dominadas',
        alternativeNames: ['Pull-ups', 'Jalones'],
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        equipment: 'bodyweight',
        description: 'Ejercicio de peso corporal para la espalda',
        instructions: [
          'Cuelga de la barra con agarre prono',
          'Activa el core y mantén el cuerpo recto',
          'Tira del cuerpo hacia arriba hasta que el mentón pase la barra',
          'Baja de forma controlada hasta extender completamente los brazos'
        ],
        difficulty: 'intermediate',
        type: 'compound',
        defaultSets: 3,
        defaultReps: { min: 5, max: 12 },
        tags: ['espalda', 'bíceps', 'peso corporal']
      },
      {
        name: 'Press Militar',
        alternativeNames: ['Overhead Press', 'Press de Hombros'],
        category: 'strength',
        muscleGroups: ['shoulders', 'triceps', 'core'],
        equipment: 'barbell',
        description: 'Ejercicio para desarrollo de hombros',
        instructions: [
          'Párate con los pies al ancho de los hombros',
          'Agarra la barra a la altura de los hombros',
          'Mantén el core activado',
          'Presiona la barra hacia arriba hasta extender los brazos',
          'Baja la barra de forma controlada'
        ],
        difficulty: 'intermediate',
        type: 'compound',
        defaultSets: 3,
        defaultReps: { min: 8, max: 12 },
        tags: ['hombros', 'tríceps', 'fuerza']
      }
    ];

    const batch = db.batch();
    
    systemExercises.forEach(exerciseData => {
      const exercise = ExerciseModel.createSystemExercise(exerciseData);
      const docRef = db.collection('systemExercises').doc();
      batch.set(docRef, exercise.toFirestore());
    });

    await batch.commit();
    console.log(`✅ Creados ${systemExercises.length} ejercicios del sistema`);
  }

  /**
   * Inicializar configuraciones del sistema
   */
  static async initializeSystemSettings() {
    const settingsRef = db.collection('systemSettings').doc('general');
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      const defaultSettings = {
        version: '1.0.0',
        maintenanceMode: false,
        features: {
          bodyFatCalculation: true,
          oneRepMaxCalculation: true,
          progressiveOverload: true,
          analytics: true,
          notifications: true
        },
        limits: {
          maxWorkoutTemplates: 50,
          maxCustomExercises: 100,
          maxSessionsPerDay: 5,
          maxMeasurementsPerDay: 3
        },
        defaults: {
          restTime: 60,
          sets: 3,
          reps: { min: 8, max: 12 },
          workoutDuration: 60,
          weeklyGoal: 3
        },
        updatedAt: new Date(),
        createdAt: new Date()
      };

      await settingsRef.set(defaultSettings);
      console.log('✅ Configuraciones del sistema inicializadas');
    }
  }

  /**
   * Obtener configuraciones del sistema
   */
  static async getSystemSettings() {
    try {
      const settingsDoc = await db.collection('systemSettings').doc('general').get();
      
      if (settingsDoc.exists) {
        return settingsDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo configuraciones del sistema:', error);
      return null;
    }
  }

  /**
   * Actualizar configuraciones del sistema
   */
  static async updateSystemSettings(updates) {
    try {
      const settingsRef = db.collection('systemSettings').doc('general');
      
      await settingsRef.update({
        ...updates,
        updatedAt: new Date()
      });
      
      console.log('✅ Configuraciones del sistema actualizadas');
      return true;
    } catch (error) {
      console.error('Error actualizando configuraciones del sistema:', error);
      return false;
    }
  }

  /**
   * Limpiar datos de prueba y temporales
   */
  static async cleanup() {
    console.log('🧹 Limpiando datos temporales...');
    
    try {
      // Limpiar documentos de prueba
      const testCollection = db.collection('_test');
      const testDocs = await testCollection.get();
      
      const batch = db.batch();
      testDocs.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (!testDocs.empty) {
        await batch.commit();
        console.log(`🗑️  Eliminados ${testDocs.size} documentos de prueba`);
      }
      
      // Aquí podrías añadir más lógica de limpieza
      console.log('✅ Limpieza completada');
      
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error);
    }
  }

  /**
   * Realizar backup de datos críticos
   */
  static async backup(userId = null) {
    console.log('💾 Iniciando backup de datos...');
    
    try {
      const timestamp = new Date().toISOString();
      const backupRef = db.collection('backups').doc(timestamp);
      
      let backupData = {
        timestamp,
        type: userId ? 'user' : 'system',
        createdAt: new Date()
      };

      if (userId) {
        // Backup de datos de usuario específico
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          backupData.userData = userDoc.data();
        }
      } else {
        // Backup de configuraciones del sistema
        const systemSettings = await this.getSystemSettings();
        backupData.systemSettings = systemSettings;
      }

      await backupRef.set(backupData);
      console.log(`✅ Backup creado: ${timestamp}`);
      
      return timestamp;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  static async getStats() {
    try {
      const stats = {
        users: 0,
        workoutSessions: 0,
        systemExercises: 0,
        customExercises: 0,
        templates: 0,
        measurements: 0
      };

      // Contar usuarios
      const usersSnapshot = await db.collection('users').get();
      stats.users = usersSnapshot.size;

      // Contar ejercicios del sistema
      const systemExercisesSnapshot = await db.collection('systemExercises').get();
      stats.systemExercises = systemExercisesSnapshot.size;

      // Para conteos más detallados, sería necesario usar Cloud Functions
      // debido a las limitaciones de Firestore para consultas agregadas

      console.log('📊 Estadísticas de la base de datos:', stats);
      return stats;
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Verificar integridad de datos
   */
  static async checkIntegrity() {
    console.log('🔍 Verificando integridad de datos...');
    
    const issues = [];
    
    try {
      // Verificar usuarios sin datos básicos
      const usersSnapshot = await db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        if (!userData.username || !userData.email) {
          issues.push({
            type: 'incomplete_user',
            userId: userDoc.id,
            message: 'Usuario sin username o email'
          });
        }
        
        if (!userData.profile || !userData.profile.dateOfBirth) {
          issues.push({
            type: 'incomplete_profile',
            userId: userDoc.id,
            message: 'Perfil incompleto'
          });
        }
      }

      if (issues.length > 0) {
        console.warn(`⚠️  Se encontraron ${issues.length} problemas de integridad`);
        return { valid: false, issues };
      } else {
        console.log('✅ Integridad de datos verificada');
        return { valid: true, issues: [] };
      }
      
    } catch (error) {
      console.error('Error verificando integridad:', error);
      return { valid: false, issues: [{ type: 'check_error', message: error.message }] };
    }
  }
}

module.exports = DatabaseConfig;