// backend/src/models/User.js

/**
 * Modelo de Usuario para ASECGC
 * Define la estructura de datos del usuario en Firestore
 */

class UserModel {
  constructor(data = {}) {
    // Campos básicos del usuario
    this.uid = data.uid || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.hashedPassword = data.hashedPassword || '';
    
    // Perfil del usuario
    this.profile = {
      dateOfBirth: data.profile?.dateOfBirth || null,
      gender: data.profile?.gender || 'other', // 'male', 'female', 'other'
      experienceLevel: data.profile?.experienceLevel || 'beginner', // 'beginner', 'intermediate', 'advanced'
      goals: data.profile?.goals || [], // Array de objetivos
      avatar: data.profile?.avatar || null,
      bio: data.profile?.bio || '',
      preferences: {
        units: data.profile?.preferences?.units || 'metric', // 'metric', 'imperial'
        language: data.profile?.preferences?.language || 'es',
        theme: data.profile?.preferences?.theme || 'light', // 'light', 'dark'
        notifications: {
          workoutReminders: data.profile?.preferences?.notifications?.workoutReminders ?? true,
          progressUpdates: data.profile?.preferences?.notifications?.progressUpdates ?? true,
          emailNotifications: data.profile?.preferences?.notifications?.emailNotifications ?? true,
          pushNotifications: data.profile?.preferences?.notifications?.pushNotifications ?? true
        },
        privacy: {
          profileVisible: data.profile?.preferences?.privacy?.profileVisible ?? true,
          shareProgress: data.profile?.preferences?.privacy?.shareProgress ?? false
        },
        workout: {
          defaultRestTime: data.profile?.preferences?.workout?.defaultRestTime || 60, // segundos
          autoAdvance: data.profile?.preferences?.workout?.autoAdvance ?? true,
          soundEffects: data.profile?.preferences?.workout?.soundEffects ?? true,
          showTips: data.profile?.preferences?.workout?.showTips ?? true
        }
      }
    };

    // Métricas actuales del usuario
    this.metrics = {
      current: {
        weight: data.metrics?.current?.weight || null,
        height: data.metrics?.current?.height || null,
        bodyFat: data.metrics?.current?.bodyFat || null,
        bmi: data.metrics?.current?.bmi || null,
        waist: data.metrics?.current?.waist || null,
        neck: data.metrics?.current?.neck || null,
        hip: data.metrics?.current?.hip || null,
        chest: data.metrics?.current?.chest || null,
        abdomen: data.metrics?.current?.abdomen || null,
        thigh: data.metrics?.current?.thigh || null,
        lastUpdated: data.metrics?.current?.lastUpdated || null
      },
      goals: {
        targetWeight: data.metrics?.goals?.targetWeight || null,
        targetBodyFat: data.metrics?.goals?.targetBodyFat || null,
        targetBMI: data.metrics?.goals?.targetBMI || null
      }
    };

    // Configuración de entrenamientos
    this.workoutSettings = {
      weeklyGoal: data.workoutSettings?.weeklyGoal || 3,
      preferredDuration: data.workoutSettings?.preferredDuration || 60, // minutos
      preferredTimeSlots: data.workoutSettings?.preferredTimeSlots || [], // Array de horarios preferidos
      restDays: data.workoutSettings?.restDays || [], // Array de días de descanso
      autoProgression: data.workoutSettings?.autoProgression ?? true,
      progressionRate: data.workoutSettings?.progressionRate || 'normal' // 'slow', 'normal', 'fast'
    };

    // Estado de la cuenta
    this.accountStatus = {
      isActive: data.accountStatus?.isActive ?? true,
      emailVerified: data.accountStatus?.emailVerified ?? false,
      isPremium: data.accountStatus?.isPremium ?? false,
      subscriptionExpiry: data.accountStatus?.subscriptionExpiry || null,
      lastLogin: data.accountStatus?.lastLogin || null,
      lastLogout: data.accountStatus?.lastLogout || null
    };

    // Tokens y seguridad
    this.security = {
      resetToken: data.security?.resetToken || null,
      resetTokenExpiry: data.security?.resetTokenExpiry || null,
      verificationToken: data.security?.verificationToken || null,
      verificationTokenExpiry: data.security?.verificationTokenExpiry || null,
      lastPasswordChange: data.security?.lastPasswordChange || null,
      loginAttempts: data.security?.loginAttempts || 0,
      lockedUntil: data.security?.lockedUntil || null
    };

    // Roles y permisos
    this.roles = data.roles || ['user'];
    this.permissions = data.permissions || [];

    // Metadatos
    this.metadata = {
      createdAt: data.metadata?.createdAt || new Date(),
      updatedAt: data.metadata?.updatedAt || new Date(),
      lastActiveAt: data.metadata?.lastActiveAt || new Date(),
      version: data.metadata?.version || '1.0.0',
      deviceInfo: data.metadata?.deviceInfo || null,
      ipAddress: data.metadata?.ipAddress || null
    };
  }

  // Métodos de validación
  isValid() {
    const errors = [];

    if (!this.username || this.username.length < 3) {
      errors.push('Username debe tener al menos 3 caracteres');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Email debe ser válido');
    }

    if (!this.profile.dateOfBirth) {
      errors.push('Fecha de nacimiento es requerida');
    }

    if (!['male', 'female', 'other'].includes(this.profile.gender)) {
      errors.push('Género debe ser male, female o other');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Métodos de utilidad
  getAge() {
    if (!this.profile.dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getBMI() {
    const { weight, height } = this.metrics.current;
    if (!weight || !height) return null;
    
    const heightInM = height / 100;
    return weight / (heightInM * heightInM);
  }

  getExperienceLevel() {
    return this.profile.experienceLevel;
  }

  isGoalSet() {
    return this.profile.goals.length > 0;
  }

  hasCompleteBodyMetrics() {
    const { weight, height, waist, neck } = this.metrics.current;
    return weight && height && waist && neck;
  }

  // Métodos para preparar datos
  toFirestore() {
    // Remover campos que no deben guardarse en Firestore
    const data = { ...this };
    delete data.hashedPassword; // Se maneja por separado por seguridad
    
    return data;
  }

  toSafeObject() {
    // Versión segura sin datos sensibles para enviar al frontend
    const safe = { ...this };
    delete safe.hashedPassword;
    delete safe.security;
    return safe;
  }

  toPublicProfile() {
    // Perfil público para mostrar a otros usuarios
    return {
      uid: this.uid,
      username: this.username,
      profile: {
        avatar: this.profile.avatar,
        bio: this.profile.bio,
        experienceLevel: this.profile.experienceLevel,
        goals: this.profile.preferences.privacy.shareProgress ? this.profile.goals : []
      },
      metadata: {
        createdAt: this.metadata.createdAt
      }
    };
  }

  // Métodos estáticos de validación
  static validateUsername(username) {
    const errors = [];
    
    if (!username) {
      errors.push('Username es requerido');
    } else {
      if (username.length < 3) {
        errors.push('Username debe tener al menos 3 caracteres');
      }
      if (username.length > 30) {
        errors.push('Username debe tener máximo 30 caracteres');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username solo puede contener letras, números y guiones bajos');
      }
    }
    
    return errors;
  }

  static validateEmail(email) {
    const errors = [];
    
    if (!email) {
      errors.push('Email es requerido');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Email debe tener un formato válido');
      }
    }
    
    return errors;
  }

  static validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('Contraseña es requerida');
    } else {
      if (password.length < 8) {
        errors.push('Contraseña debe tener al menos 8 caracteres');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Contraseña debe contener al menos una minúscula');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Contraseña debe contener al menos una mayúscula');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Contraseña debe contener al menos un número');
      }
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Contraseña debe contener al menos un símbolo especial');
      }
    }
    
    return errors;
  }

  // Métodos para crear instancias
  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new UserModel({
      uid: doc.id,
      ...data
    });
  }

  static createNew(userData) {
    return new UserModel({
      ...userData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date(),
        version: '1.0.0'
      },
      accountStatus: {
        isActive: true,
        emailVerified: false,
        isPremium: false
      }
    });
  }
}

module.exports = UserModel;