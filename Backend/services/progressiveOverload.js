// backend/src/services/progressiveOverload.js

class ProgressiveOverload {
  
  constructor() {
    this.progressionStrategies = {
      volume: 'Aumentar repeticiones/series',
      intensity: 'Aumentar peso',
      density: 'Reducir tiempo de descanso',
      frequency: 'Aumentar frecuencia semanal'
    };

    this.experienceLevels = {
      beginner: { rate: 0.025, maxWeeklyIncrease: 0.05 },    // 2.5% incremento, máx 5% semanal
      intermediate: { rate: 0.015, maxWeeklyIncrease: 0.03 }, // 1.5% incremento, máx 3% semanal
      advanced: { rate: 0.005, maxWeeklyIncrease: 0.01 }      // 0.5% incremento, máx 1% semanal
    };
  }

  /**
   * Calcula la progresión para el próximo entrenamiento
   */
  calculateProgression(exercise, userLevel = 'intermediate', lastSessions = []) {
    const baseProgression = this.experienceLevels[userLevel] || this.experienceLevels.intermediate;
    const fatigueScore = this.assessFatigue(lastSessions);
    const consistencyScore = this.assessConsistency(lastSessions);
    const techniqueScore = this.assessTechnique(exercise.lastPerformance);

    // Si la técnica es pobre, enfocarse en mejorarla
    if (techniqueScore < 0.7) {
      return this.focusOnTechnique(exercise);
    }

    // Si hay mucha fatiga, progresión conservadora
    if (fatigueScore < 0.6) {
      return this.conservativeProgression(exercise, baseProgression.rate * 0.5);
    }

    // Progresión normal
    return this.standardProgression(exercise, baseProgression, consistencyScore);
  }

  /**
   * Progresión estándar basada en el último rendimiento
   */
  standardProgression(exercise, baseProgression, consistencyBonus = 1) {
    const { weight, reps, sets, rpe } = exercise.lastPerformance;
    const { targetReps, targetSets, targetRPE } = exercise.targets;
    
    const progressionRate = baseProgression.rate * consistencyBonus;

    // Estrategia basada en RPE (Rate of Perceived Exertion)
    if (rpe <= targetRPE - 2) {
      // Muy fácil - aumentar intensidad significativamente
      return this.increaseIntensity(exercise, progressionRate * 1.5);
    } else if (rpe <= targetRPE - 1) {
      // Fácil - progresión normal
      return this.balancedProgression(exercise, progressionRate);
    } else if (rpe === targetRPE) {
      // Perfecto - progresión ligera
      return this.balancedProgression(exercise, progressionRate * 0.8);
    } else {
      // Muy difícil - mantener o reducir ligeramente
      return this.maintainOrDecrease(exercise);
    }
  }

  /**
   * Aumenta la intensidad (peso) principalmente
   */
  increaseIntensity(exercise, rate) {
    const { weight, reps, sets } = exercise.lastPerformance;
    const { targetReps } = exercise.targets;

    if (reps >= targetReps.max) {
      // Si ya se alcanzaron las reps máximas, aumentar peso
      return {
        weight: Math.round((weight * (1 + rate)) * 2) / 2, // Redondear a 0.5kg
        reps: targetReps.min,
        sets: sets,
        strategy: 'intensity',
        explanation: `Peso aumentado a ${Math.round((weight * (1 + rate)) * 2) / 2}kg. Reducir repeticiones a ${targetReps.min}.`
      };
    } else {
      // Aumentar repeticiones primero
      return {
        weight: weight,
        reps: Math.min(reps + 2, targetReps.max),
        sets: sets,
        strategy: 'volume',
        explanation: `Aumentar repeticiones a ${Math.min(reps + 2, targetReps.max)}.`
      };
    }
  }

  /**
   * Progresión balanceada entre volumen e intensidad
   */
  balancedProgression(exercise, rate) {
    const { weight, reps, sets } = exercise.lastPerformance;
    const { targetReps, targetSets } = exercise.targets;

    // Alternar entre aumentar reps, sets y peso
    if (reps < targetReps.max) {
      return {
        weight: weight,
        reps: reps + 1,
        sets: sets,
        strategy: 'volume',
        explanation: `Aumentar repeticiones a ${reps + 1}.`
      };
    } else if (sets < targetSets.max) {
      return {
        weight: weight,
        reps: targetReps.min,
        sets: sets + 1,
        strategy: 'volume',
        explanation: `Añadir una serie. Total: ${sets + 1} series.`
      };
    } else {
      return {
        weight: Math.round((weight * (1 + rate)) * 2) / 2,
        reps: targetReps.min,
        sets: targetSets.min,
        strategy: 'intensity',
        explanation: `Aumentar peso a ${Math.round((weight * (1 + rate)) * 2) / 2}kg.`
      };
    }
  }

  /**
   * Mantener o disminuir ligeramente la carga
   */
  maintainOrDecrease(exercise) {
    const { weight, reps, sets } = exercise.lastPerformance;
    
    if (reps > exercise.targets.targetReps.min) {
      return {
        weight: weight,
        reps: reps - 1,
        sets: sets,
        strategy: 'recovery',
        explanation: `Reducir repeticiones a ${reps - 1} para mejorar la técnica.`
      };
    } else {
      return {
        weight: weight * 0.95,
        reps: reps,
        sets: sets,
        strategy: 'recovery',
        explanation: `Reducir peso ligeramente a ${Math.round(weight * 0.95 * 2) / 2}kg para recuperación.`
      };
    }
  }

  /**
   * Progresión conservadora para días de fatiga
   */
  conservativeProgression(exercise, rate) {
    const { weight, reps, sets } = exercise.lastPerformance;
    
    return {
      weight: weight,
      reps: reps,
      sets: sets,
      strategy: 'maintenance',
      explanation: 'Mantener la misma carga para permitir recuperación.'
    };
  }

  /**
   * Enfoque en técnica cuando es deficiente
   */
  focusOnTechnique(exercise) {
    const { weight, reps, sets } = exercise.lastPerformance;
    
    return {
      weight: weight * 0.85, // Reducir peso 15%
      reps: reps + 2, // Más repeticiones con menos peso
      sets: sets,
      strategy: 'technique',
      explanation: `Reducir peso a ${Math.round(weight * 0.85 * 2) / 2}kg para enfocarse en la técnica. Aumentar repeticiones a ${reps + 2}.`
    };
  }

  /**
   * Evalúa la fatiga basada en sesiones recientes
   */
  assessFatigue(lastSessions) {
    if (!lastSessions || lastSessions.length === 0) return 1;

    const recentSessions = lastSessions.slice(-5); // Últimas 5 sesiones
    let fatigueIndicators = 0;
    let totalIndicators = 0;

    recentSessions.forEach(session => {
      totalIndicators += 3;
      
      // Indicador 1: RPE promedio alto
      const avgRPE = session.exercises.reduce((sum, ex) => sum + (ex.rpe || 5), 0) / session.exercises.length;
      if (avgRPE > 8) fatigueIndicators++;

      // Indicador 2: Duración de sesión muy larga
      if (session.duration > 120) fatigueIndicators++; // Más de 2 horas

      // Indicador 3: Rendimiento decreciente
      if (session.completionRate < 0.8) fatigueIndicators++; // No completó 80% del entrenamiento
    });

    return totalIndicators > 0 ? 1 - (fatigueIndicators / totalIndicators) : 1;
  }

  /**
   * Evalúa la consistencia del entrenamiento
   */
  assessConsistency(lastSessions) {
    if (!lastSessions || lastSessions.length < 4) return 1;

    const last4Weeks = lastSessions.slice(-28); // Últimas 4 semanas
    const weeksWithWorkouts = new Set(
      last4Weeks.map(session => this.getWeekNumber(new Date(session.date)))
    ).size;

    // Bonus por consistencia: 1.0 (sin bonus) a 1.2 (muy consistente)
    return Math.min(1 + (weeksWithWorkouts - 2) * 0.1, 1.2);
  }

  /**
   * Evalúa la técnica basada en RPE y rendimiento
   */
  assessTechnique(lastPerformance) {
    if (!lastPerformance) return 0.8;

    const { rpe, reps, weight, targetReps } = lastPerformance;
    
    // Si el RPE es muy alto para las repeticiones logradas, posible problema técnico
    if (rpe > 8 && reps < targetReps.min) return 0.6;
    if (rpe > 9 && reps < targetReps.max * 0.8) return 0.5;
    
    return 0.8; // Técnica asumida como buena por defecto
  }

  /**
   * Calcula el volumen total de entrenamiento
   */
  calculateVolume(weight, reps, sets) {
    return weight * reps * sets;
  }

  /**
   * Genera un plan de progresión semanal
   */
  generateWeeklyPlan(exercises, userLevel, weekNumber = 1) {
    const plan = {
      week: weekNumber,
      exercises: [],
      totalVolume: 0,
      focusArea: this.determineWeeklyFocus(weekNumber)
    };

    exercises.forEach(exercise => {
      const progression = this.calculateProgression(exercise, userLevel);
      const volume = this.calculateVolume(progression.weight, progression.reps, progression.sets);
      
      plan.exercises.push({
        ...exercise,
        progression: progression,
        volume: volume
      });
      
      plan.totalVolume += volume;
    });

    return plan;
  }

  /**
   * Determina el enfoque semanal basado en periodización
   */
  determineWeeklyFocus(weekNumber) {
    const cycle = weekNumber % 4;
    switch (cycle) {
      case 1: return 'volume'; // Semana de volumen
      case 2: return 'intensity'; // Semana de intensidad
      case 3: return 'power'; // Semana de potencia
      case 0: return 'recovery'; // Semana de descarga
      default: return 'volume';
    }
  }

  getWeekNumber(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
  }
}

module.exports = ProgressiveOverload;