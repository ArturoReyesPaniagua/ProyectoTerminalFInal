// backend/src/utils/helpers.js

/**
 * Funciones de utilidad para ASECGC Backend
 */

const crypto = require('crypto');

class Helpers {
  
  /**
   * Formatear respuesta estándar de la API
   */
  static formatResponse(success, data = null, message = '', errors = null, meta = null) {
    const response = {
      success,
      timestamp: new Date().toISOString(),
      ...(message && { message }),
      ...(data !== null && { data }),
      ...(errors && { errors }),
      ...(meta && { meta })
    };

    return response;
  }

  /**
   * Generar ID único
   */
  static generateId(prefix = '', length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return prefix ? `${prefix}_${result}` : result;
  }

  /**
   * Generar hash seguro
   */
  static generateHash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generar token aleatorio
   */
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Validar formato de email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar fortaleza de contraseña
   */
  static validatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const strength = passed / Object.keys(checks).length;

    return {
      isStrong: strength >= 0.8,
      strength: strength,
      checks: checks,
      score: Math.round(strength * 100)
    };
  }

  /**
   * Limpiar y validar datos de entrada
   */
  static sanitizeInput(input, type = 'string') {
    if (input === null || input === undefined) {
      return input;
    }

    switch (type) {
      case 'string':
        return typeof input === 'string' ? input.trim() : String(input).trim();
      
      case 'number':
        const num = parseFloat(input);
        return isNaN(num) ? null : num;
      
      case 'integer':
        const int = parseInt(input);
        return isNaN(int) ? null : int;
      
      case 'boolean':
        if (typeof input === 'boolean') return input;
        if (typeof input === 'string') {
          return ['true', '1', 'yes', 'on'].includes(input.toLowerCase());
        }
        return Boolean(input);
      
      case 'email':
        const email = String(input).trim().toLowerCase();
        return this.isValidEmail(email) ? email : null;
      
      case 'array':
        return Array.isArray(input) ? input : [];
      
      default:
        return input;
    }
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    
    if (birth > today) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Calcular BMI
   */
  static calculateBMI(weight, height) {
    if (!weight || !height || weight <= 0 || height <= 0) {
      return null;
    }
    
    const heightInM = height / 100; // convertir cm a metros
    return parseFloat((weight / (heightInM * heightInM)).toFixed(1));
  }

  /**
   * Clasificar BMI
   */
  static classifyBMI(bmi) {
    if (!bmi) return null;
    
    if (bmi < 18.5) return { category: 'underweight', description: 'Bajo peso' };
    if (bmi < 25) return { category: 'normal', description: 'Peso normal' };
    if (bmi < 30) return { category: 'overweight', description: 'Sobrepeso' };
    if (bmi < 35) return { category: 'obesity_1', description: 'Obesidad grado I' };
    if (bmi < 40) return { category: 'obesity_2', description: 'Obesidad grado II' };
    return { category: 'obesity_3', description: 'Obesidad grado III' };
  }

  /**
   * Convertir unidades de peso
   */
  static convertWeight(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    const conversions = {
      'kg_to_lb': (kg) => kg * 2.20462,
      'lb_to_kg': (lb) => lb / 2.20462
    };
    
    const conversionKey = `${fromUnit}_to_${toUnit}`;
    const converter = conversions[conversionKey];
    
    return converter ? parseFloat(converter(value).toFixed(2)) : value;
  }

  /**
   * Convertir unidades de distancia
   */
  static convertDistance(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    const conversions = {
      'cm_to_in': (cm) => cm / 2.54,
      'in_to_cm': (inches) => inches * 2.54,
      'cm_to_ft': (cm) => cm / 30.48,
      'ft_to_cm': (ft) => ft * 30.48
    };
    
    const conversionKey = `${fromUnit}_to_${toUnit}`;
    const converter = conversions[conversionKey];
    
    return converter ? parseFloat(converter(value).toFixed(2)) : value;
  }

  /**
   * Formatear duración en formato legible
   */
  static formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  }

  /**
   * Formatear fecha en formato ISO
   */
  static formatDate(date, includeTime = false) {
    if (!date) return null;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return null;
    
    if (includeTime) {
      return dateObj.toISOString();
    } else {
      return dateObj.toISOString().split('T')[0];
    }
  }

  /**
   * Formatear fecha en formato legible
   */
  static formatDateReadable(date, locale = 'es-ES', options = {}) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      return dateObj.toLocaleDateString(locale, defaultOptions);
    } catch (error) {
      return dateObj.toLocaleDateString('es-ES', defaultOptions);
    }
  }

  /**
   * Calcular diferencia entre fechas
   */
  static dateDifference(date1, date2, unit = 'days') {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    const diffMs = Math.abs(d2 - d1);
    
    switch (unit) {
      case 'milliseconds':
        return diffMs;
      case 'seconds':
        return Math.floor(diffMs / 1000);
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)); // promedio
      case 'years':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)); // considerando años bisiestos
      default:
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  /**
   * Paginar resultados
   */
  static paginate(data, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    
    return {
      data: paginatedData,
      pagination: {
        page: page,
        limit: limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: page < Math.ceil(data.length / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Generar slug a partir de texto
   */
  static slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // espacios a guiones
      .replace(/[^\w\-]+/g, '')       // remover caracteres especiales
      .replace(/\-\-+/g, '-')         // múltiples guiones a uno solo
      .replace(/^-+/, '')             // remover guiones del inicio
      .replace(/-+$/, '');            // remover guiones del final
  }

  /**
   * Redondear número a decimales específicos
   */
  static round(number, decimals = 2) {
    if (typeof number !== 'number') return number;
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Clamp número entre min y max
   */
  static clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  /**
   * Generar rango de números
   */
  static range(start, end, step = 1) {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }

  /**
   * Mezclar array aleatoriamente
   */
  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Agrupar array por campo
   */
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  /**
   * Remover duplicados de array
   */
  static unique(array, key = null) {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const val = item[key];
      if (seen.has(val)) {
        return false;
      }
      seen.add(val);
      return true;
    });
  }

  /**
   * Buscar en array de objetos
   */
  static search(array, query, fields = []) {
    if (!query) return array;
    
    const searchTerm = query.toLowerCase();
    
    return array.filter(item => {
      if (fields.length === 0) {
        // Buscar en todas las propiedades del objeto
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        );
      } else {
        // Buscar solo en campos específicos
        return fields.some(field => {
          const value = this.getNestedValue(item, field);
          return String(value).toLowerCase().includes(searchTerm);
        });
      }
    });
  }

  /**
   * Obtener valor anidado de objeto
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Establecer valor anidado en objeto
   */
  static setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      current[key] = current[key] || {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Validar estructura de objeto
   */
  static validateStructure(obj, schema) {
    const errors = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = this.getNestedValue(obj, key);
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`Campo '${key}' es requerido`);
        continue;
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`Campo '${key}' debe ser de tipo ${rules.type}`);
        }
        
        if (rules.min && value < rules.min) {
          errors.push(`Campo '${key}' debe ser mayor o igual a ${rules.min}`);
        }
        
        if (rules.max && value > rules.max) {
          errors.push(`Campo '${key}' debe ser menor o igual a ${rules.max}`);
        }
        
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`Campo '${key}' debe tener al menos ${rules.minLength} caracteres`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`Campo '${key}' debe tener máximo ${rules.maxLength} caracteres`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`Campo '${key}' no tiene el formato correcto`);
        }
        
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`Campo '${key}' debe ser uno de: ${rules.enum.join(', ')}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Delay/sleep asíncrono
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry función con backoff exponencial
   */
  static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`Intento ${attempt} falló, reintentando en ${delay}ms:`, error.message);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }
}

module.exports = Helpers;