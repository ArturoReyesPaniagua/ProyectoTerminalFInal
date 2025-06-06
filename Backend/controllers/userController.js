// backend/src/controllers/userController.js
const { validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const BodyFatCalculator = require('../services/bodyFatCalculator');

class UserController {
  
  /**
   * Obtener perfil del usuario
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.uid;

      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      const userData = userDoc.data();
      
      // No enviar datos sensibles
      const { hashedPassword, resetToken, resetTokenExpiry, ...safeUserData } = userData;

      res.json({
        user: safeUserData
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(req, res) {
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
        profile: profileUpdates,
        preferences: preferencesUpdates 
      } = req.body;

      const updateData = {
        updatedAt: new Date()
      };

      if (profileUpdates) {
        updateData['profile'] = profileUpdates;
      }

      if (preferencesUpdates) {
        updateData['profile.preferences'] = preferencesUpdates;
      }

      await db.collection('users').doc(userId).update(updateData);

      // Obtener datos actualizados
      const updatedUser = await db.collection('users').doc(userId).get();
      const userData = updatedUser.data();
      const { hashedPassword, resetToken, resetTokenExpiry, ...safeUserData } = userData;

      res.json({
        message: 'Perfil actualizado correctamente',
        user: safeUserData
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Registrar medidas corporales
   */
  static async updateBodyMeasurements(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.uid;
      const { weight, height, waist, neck, hip, chest, abdomen, thigh } = req.body;

      // Obtener datos del usuario para cálculos
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      const measurements = {
        weight,
        height,
        waist,
        neck,
        hip,
        chest,
        abdomen,
        thigh,
        date: new Date(),
        bmi: weight / Math.pow(height / 100, 2)
      };

      // Calcular grasa corporal si tenemos los datos necesarios
      try {
        const bodyFatResult = BodyFatCalculator.composite(
          measurements,
          userData.profile.gender,
          this.calculateAge(userData.profile.dateOfBirth),
          weight,
          height
        );

        measurements.bodyFat = bodyFatResult.bodyFatPercentage;
        measurements.bodyFatMethods = bodyFatResult.methods;
        measurements.reliability = bodyFatResult.reliability;
        measurements.classification = BodyFatCalculator.classifyBodyFat(
          bodyFatResult.bodyFatPercentage,
          userData.profile.gender,
          this.calculateAge(userData.profile.dateOfBirth)
        );
      } catch (bodyFatError) {
        console.warn('No se pudo calcular grasa corporal:', bodyFatError.message);
        measurements.bodyFat = null;
      }

      // Guardar medidas en el historial
      const measurementRef = db.collection('users').doc(userId)
        .collection('measurements').doc();
      
      await measurementRef.set(measurements);

      // Actualizar medidas actuales en el perfil del usuario
      await db.collection('users').doc(userId).update({
        'metrics.current': measurements,
        updatedAt: new Date()
      });

      res.json({
        message: 'Medidas registradas correctamente',
        measurements: measurements
      });

    } catch (error) {
      console.error('Error registrando medidas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de medidas corporales
   */
  static async getBodyMeasurements(req, res) {
    try {
      const userId = req.user.uid;
      const limit = parseInt(req.query.limit) || 10;

      const measurementsQuery = await db.collection('users').doc(userId)
        .collection('measurements')
        .orderBy('date', 'desc')
        .limit(limit)
        .get();

      const measurements = measurementsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toISOString()
      }));

      res.json({
        measurements: measurements
      });

    } catch (error) {
      console.error('Error obteniendo medidas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Calcular grasa corporal
   */
  static async calculateBodyFat(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const userId = req.user.uid;
      const { measurements, method = 'composite' } = req.body;

      // Obtener datos del usuario
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      const gender = userData.profile.gender;
      const age = this.calculateAge(userData.profile.dateOfBirth);

      let result;

      if (method === 'composite') {
        result = BodyFatCalculator.composite(
          measurements,
          gender,
          age,
          measurements.weight,
          measurements.height
        );
      } else if (method === 'usNavy') {
        const bodyFatPercentage = BodyFatCalculator.usNavy(measurements, gender);
        result = {
          bodyFatPercentage,
          methods: ['US Navy'],
          reliability: 85
        };
      } else if (method === 'bmiEstimate') {
        const bodyFatPercentage = BodyFatCalculator.bmiEstimate(
          measurements.weight,
          measurements.height,
          age,
          gender
        );
        result = {
          bodyFatPercentage,
          methods: ['BMI Estimate'],
          reliability: 60
        };
      } else {
        return res.status(400).json({
          error: 'Método de cálculo no válido'
        });
      }

      // Añadir clasificación y recomendaciones
      result.classification = BodyFatCalculator.classifyBodyFat(
        result.bodyFatPercentage,
        gender,
        age
      );

      result.recommendations = BodyFatCalculator.generateRecommendations(
        result.bodyFatPercentage,
        gender,
        userData.profile.goals?.[0] || 'health'
      );

      res.json(result);

    } catch (error) {
      console.error('Error calculando grasa corporal:', error);
      res.status(500).json({
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de grasa corporal
   */
  static async getBodyFatHistory(req, res) {
    try {
      const userId = req.user.uid;
      const timeframe = req.query.timeframe || '6m';

      // Calcular fecha de inicio basada en timeframe
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
          startDate.setMonth(now.getMonth() - 6);
      }

      const measurementsQuery = await db.collection('users').doc(userId)
        .collection('measurements')
        .where('date', '>=', startDate)
        .where('bodyFat', '!=', null)
        .orderBy('date', 'asc')
        .get();

      const bodyFatHistory = measurementsQuery.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date.toDate().toISOString(),
          bodyFat: data.bodyFat,
          weight: data.weight,
          classification: data.classification
        };
      });

      res.json({
        history: bodyFatHistory,
        timeframe: timeframe
      });

    } catch (error) {
      console.error('Error obteniendo historial de grasa corporal:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar cuenta de usuario
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.uid;

      // Eliminar subcolecciones
      const batch = db.batch();

      // Eliminar medidas
      const measurementsQuery = await db.collection('users').doc(userId)
        .collection('measurements').get();
      
      measurementsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Eliminar entrenamientos
      const workoutsQuery = await db.collection('users').doc(userId)
        .collection('workouts').get();
      
      workoutsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Eliminar usuario principal
      batch.delete(db.collection('users').doc(userId));

      await batch.commit();

      res.json({
        message: 'Cuenta eliminada correctamente'
      });

    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Exportar datos del usuario
   */
  static async exportData(req, res) {
    try {
      const userId = req.user.uid;

      // Obtener datos del usuario
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      // Obtener medidas
      const measurementsQuery = await db.collection('users').doc(userId)
        .collection('measurements').orderBy('date', 'desc').get();
      
      const measurements = measurementsQuery.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date.toDate().toISOString()
      }));

      // Obtener entrenamientos
      const workoutsQuery = await db.collection('users').doc(userId)
        .collection('workouts').orderBy('date', 'desc').get();
      
      const workouts = workoutsQuery.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date.toDate().toISOString()
      }));

      const exportData = {
        user: {
          username: userData.username,
          email: userData.email,
          profile: userData.profile,
          createdAt: userData.createdAt.toDate().toISOString(),
          exportedAt: new Date().toISOString()
        },
        measurements: measurements,
        workouts: workouts
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="asecgc-data-${userId}.json"`);
      res.json(exportData);

    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

module.exports = UserController;