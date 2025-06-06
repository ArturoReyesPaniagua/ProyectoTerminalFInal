// backend/src/routes/auth.js
const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validation');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', registerValidation, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', loginValidation, AuthController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidation, AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidation, AuthController.resetPassword);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verificar token actual
 * @access  Private
 */
router.get('/verify-token', authMiddleware, AuthController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authMiddleware, AuthController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Renovar token de acceso
 * @access  Private
 */
router.post('/refresh-token', authMiddleware, async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    
    // Generar nuevo token con la misma información
    const newToken = jwt.sign(
      {
        uid: req.user.uid,
        email: req.user.email,
        username: req.user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Token renovado exitosamente',
      token: newToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (error) {
    console.error('Error renovando token:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const userData = userDoc.data();
    const { hashedPassword, resetToken, resetTokenExpiry, ...safeUserData } = userData;

    res.json({
      user: safeUserData
    });
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña (usuario autenticado)
 * @access  Private
 */
router.post('/change-password', 
  authMiddleware,
  [
    require('express-validator').body('currentPassword')
      .notEmpty()
      .withMessage('Contraseña actual es requerida'),
    require('express-validator').body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La nueva contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo'),
    require('../middleware/validation').handleValidationErrors
  ],
  async (req, res) => {
    try {
      const bcrypt = require('bcryptjs');
      const { auth, db } = require('../config/firebase');
      const { currentPassword, newPassword } = req.body;

      // Obtener datos del usuario
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.hashedPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Contraseña actual incorrecta'
        });
      }

      // Hash de la nueva contraseña
      const saltRounds = 12;
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar en Firebase Auth
      await auth.updateUser(req.user.uid, {
        password: newPassword
      });

      // Actualizar en Firestore
      await db.collection('users').doc(req.user.uid).update({
        hashedPassword: newHashedPassword,
        updatedAt: new Date()
      });

      res.json({
        message: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Enviar email de verificación
 * @access  Private
 */
router.post('/verify-email', authMiddleware, async (req, res) => {
  try {
    // En un entorno real, aquí enviarías un email de verificación
    // Por ahora, simular el proceso
    
    const { db } = require('../config/firebase');
    const jwt = require('jsonwebtoken');

    // Generar token de verificación
    const verificationToken = jwt.sign(
      { uid: req.user.uid, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Guardar token en la base de datos
    await db.collection('users').doc(req.user.uid).update({
      verificationToken: verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      updatedAt: new Date()
    });

    // Simular envío de email
    console.log(`📧 Email de verificación enviado a ${req.user.email}`);
    console.log(`🔗 Link de verificación: ${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`);

    res.json({
      message: 'Email de verificación enviado'
    });

  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route   POST /api/auth/confirm-email
 * @desc    Confirmar email con token
 * @access  Public
 */
router.post('/confirm-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Token de verificación requerido'
      });
    }

    const jwt = require('jsonwebtoken');
    const { db } = require('../config/firebase');

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({
        error: 'Token de verificación inválido o expirado'
      });
    }

    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        error: 'Token inválido'
      });
    }

    // Verificar token en la base de datos
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const userData = userDoc.data();

    if (userData.verificationToken !== token || 
        !userData.verificationTokenExpiry || 
        new Date() > userData.verificationTokenExpiry.toDate()) {
      return res.status(400).json({
        error: 'Token de verificación inválido o expirado'
      });
    }

    // Marcar email como verificado
    await db.collection('users').doc(decoded.uid).update({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
      updatedAt: new Date()
    });

    res.json({
      message: 'Email verificado exitosamente'
    });

  } catch (error) {
    console.error('Error confirmando email:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;