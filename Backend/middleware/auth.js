// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar y decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      }
      throw jwtError;
    }

    // Verificar que el usuario existe en la base de datos
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const userData = userDoc.data();

    // Verificar que la cuenta esté activa
    if (!userData.isActive) {
      return res.status(403).json({
        error: 'Cuenta desactivada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Añadir información del usuario a la request
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      username: decoded.username,
      profile: userData.profile,
      roles: userData.roles || [],
      permissions: userData.permissions || []
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticación requerida'
      });
    }

    if (!req.user.roles.includes(requiredRole)) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        required: requiredRole
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticación requerida'
      });
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        required: requiredPermission
      });
    }

    next();
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      
      if (userDoc.exists && userDoc.data().isActive) {
        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          username: decoded.username,
          profile: userDoc.data().profile
        };
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission,
  optionalAuth
};