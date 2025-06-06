// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { db, auth } = require('../config/firebase');

class AuthController {
  
  /**
   * Registro de nuevo usuario
   */
  static async register(req, res) {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { username, email, password, dateOfBirth, gender } = req.body;

      // Verificar si el usuario ya existe
      const existingUserQuery = await db.collection('users')
        .where('email', '==', email)
        .get();

      if (!existingUserQuery.empty) {
        return res.status(409).json({
          error: 'El email ya está registrado'
        });
      }

      // Verificar username único
      const existingUsernameQuery = await db.collection('users')
        .where('username', '==', username)
        .get();

      if (!existingUsernameQuery.empty) {
        return res.status(409).json({
          error: 'El nombre de usuario ya existe'
        });
      }

      // Crear usuario en Firebase Auth
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: username
      });

      // Hash de la contraseña para almacenamiento adicional
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear perfil de usuario en Firestore
      const userProfile = {
        uid: userRecord.uid,
        username: username,
        email: email,
        hashedPassword: hashedPassword,
        profile: {
          dateOfBirth: dateOfBirth,
          gender: gender,
          experienceLevel: 'beginner',
          goals: [],
          preferences: {
            units: 'metric',
            language: 'es',
            notifications: {
              workoutReminders: true,
              progressUpdates: true
            }
          }
        },
        metrics: {
          current: {},
          history: []
        },
        workouts: {
          templates: [],
          sessions: []
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        emailVerified: false
      };

      await db.collection('users').doc(userRecord.uid).set(userProfile);

      // Generar JWT token
      const token = jwt.sign(
        { 
          uid: userRecord.uid,
          email: email,
          username: username
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Enviar email de verificación (simulado)
      await this.sendVerificationEmail(email, username);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          uid: userRecord.uid,
          username: username,
          email: email,
          emailVerified: false
        },
        token: token
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Inicio de sesión
   */
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { username, password } = req.body;

      // Buscar usuario por username o email
      let userQuery = await db.collection('users')
        .where('username', '==', username)
        .get();

      if (userQuery.empty) {
        userQuery = await db.collection('users')
          .where('email', '==', username)
          .get();
      }

      if (userQuery.empty) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, userData.hashedPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Verificar si la cuenta está activa
      if (!userData.isActive) {
        return res.status(403).json({
          error: 'Cuenta desactivada. Contacta al soporte.'
        });
      }

      // Actualizar último acceso
      await db.collection('users').doc(userData.uid).update({
        lastLogin: new Date(),
        updatedAt: new Date()
      });

      // Generar JWT token
      const token = jwt.sign(
        { 
          uid: userData.uid,
          email: userData.email,
          username: userData.username
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          uid: userData.uid,
          username: userData.username,
          email: userData.email,
          emailVerified: userData.emailVerified,
          profile: userData.profile
        },
        token: token
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email es requerido'
        });
      }

      // Verificar si el usuario existe
      const userQuery = await db.collection('users')
        .where('email', '==', email)
        .get();

      if (userQuery.empty) {
        // Por seguridad, no revelar si el email existe o no
        return res.json({
          message: 'Si el email existe, recibirás un enlace de recuperación'
        });
      }

      const userData = userQuery.docs[0].data();

      // Generar token de recuperación
      const resetToken = jwt.sign(
        { 
          uid: userData.uid,
          email: email,
          type: 'password_reset'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Guardar token en la base de datos
      await db.collection('users').doc(userData.uid).update({
        resetToken: resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hora
        updatedAt: new Date()
      });

      // Enviar email de recuperación (simulado)
      await this.sendPasswordResetEmail(email, resetToken);

      res.json({
        message: 'Si el email existe, recibirás un enlace de recuperación'
      });

    } catch (error) {
      console.error('Error en forgot password:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Restablecer contraseña
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          error: 'Token y nueva contraseña son requeridos'
        });
      }

      // Verificar token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        return res.status(400).json({
          error: 'Token inválido o expirado'
        });
      }

      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          error: 'Token inválido'
        });
      }

      // Buscar usuario y verificar token
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      const userData = userDoc.data();

      if (userData.resetToken !== token || 
          !userData.resetTokenExpiry || 
          new Date() > userData.resetTokenExpiry.toDate()) {
        return res.status(400).json({
          error: 'Token inválido o expirado'
        });
      }

      // Hash nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña en Firebase Auth
      await auth.updateUser(decoded.uid, {
        password: newPassword
      });

      // Actualizar en Firestore
      await db.collection('users').doc(decoded.uid).update({
        hashedPassword: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      });

      res.json({
        message: 'Contraseña restablecida exitosamente'
      });

    } catch (error) {
      console.error('Error en reset password:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Verificar token actual
   */
  static async verifyToken(req, res) {
    try {
      const user = req.user; // Viene del middleware de autenticación

      const userDoc = await db.collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      const userData = userDoc.data();

      res.json({
        valid: true,
        user: {
          uid: userData.uid,
          username: userData.username,
          email: userData.email,
          emailVerified: userData.emailVerified,
          profile: userData.profile
        }
      });

    } catch (error) {
      console.error('Error en verify token:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(req, res) {
    try {
      // En JWT no hay logout del lado del servidor, pero podemos registrar la acción
      const user = req.user;

      await db.collection('users').doc(user.uid).update({
        lastLogout: new Date(),
        updatedAt: new Date()
      });

      res.json({
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Enviar email de verificación (simulado)
   */
  static async sendVerificationEmail(email, username) {
    // En un entorno real, aquí integrarías con un servicio de email
    console.log(`📧 Email de verificación enviado a ${email} para ${username}`);
    return Promise.resolve();
  }

  /**
   * Enviar email de recuperación de contraseña (simulado)
   */
  static async sendPasswordResetEmail(email, token) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log(`🔑 Email de recuperación enviado a ${email}: ${resetLink}`);
    return Promise.resolve();
  }
}

module.exports = AuthController;