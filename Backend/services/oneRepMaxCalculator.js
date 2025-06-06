// backend/src/services/oneRepMaxCalculator.js

class OneRepMaxCalculator {
  
  /**
   * Múltiples fórmulas validadas para calcular 1RM
   */
  static formulas = {
    epley: (weight, reps) => weight * (1 + reps / 30),
    
    brzycki: (weight, reps) => {
      if (reps >= 37) throw new Error('Fórmula Brzycki no válida para >36 repeticiones');
      return weight * (36 / (37 - reps));
    },
    
    lander: (weight, reps) => weight / (1.013 - 0.0267123 * reps),
    
    lombardi: (weight, reps) => weight * Math.pow(reps, 0.10),
    
    mcglothin: (weight, reps) => {
      return (100 * weight) / (101.3 - 2.67123 * reps);
    },
    
    oconner: (weight, reps) => weight * (1 + 0.025 * reps),
    
    wathen: (weight, reps) => {
      return (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps));
    }
  };

  /**
   * Calcula 1RM usando método específico o promedio compuesto
   */
  static calculate(weight, reps, method = 'composite') {
    if (reps === 1) return weight;
    if (reps <= 0) throw new Error('Las repeticiones deben ser mayor a 0');
    if (weight <= 0) throw new Error('El peso debe ser mayor a 0');
    
    if (reps > 20) {
      console.warn('Cálculo de 1RM menos preciso para >20 repeticiones');
    }

    if (method === 'composite') {
      return this.compositeCalculation(weight, reps);
    }

    if (!this.formulas[method]) {
      throw new Error(`Método ${method} no disponible`);
    }

    try {
      return this.formulas[method](weight, reps);
    } catch (error) {
      console.warn(`Error con método ${method}:`, error.message);
      return this.compositeCalculation(weight, reps);
    }
  }

  /**
   * Promedio ponderado de múltiples fórmulas para mayor precisión
   */
  static compositeCalculation(weight, reps) {
    const results = [];
    const weights = [];

    // Usar las fórmulas más confiables según el rango de repeticiones
    const methodsByRange = this.getMethodsByRepRange(reps);

    methodsByRange.forEach(({ method, weight: methodWeight }) => {
      try {
        const result = this.formulas[method](weight, reps);
        if (result > 0 && result < weight * 3) { // Filtro de sanidad
          results.push(result);
          weights.push(methodWeight);
        }
      } catch (error) {
        console.warn(`Método ${method} falló:`, error.message);
      }
    });

    if (results.length === 0) {
      throw new Error('No se pudo calcular 1RM con ningún método');
    }

    // Promedio ponderado
    const weightedSum = results.reduce((sum, result, index) => sum + result * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    return weightedSum / totalWeight;
  }

  /**
   * Selecciona los mejores métodos según el rango de repeticiones
   */
  static getMethodsByRepRange(reps) {
    if (reps <= 3) {
      return [
        { method: 'epley', weight: 0.4 },
        { method: 'brzycki', weight: 0.3 },
        { method: 'lander', weight: 0.3 }
      ];
    } else if (reps <= 6) {
      return [
        { method: 'brzycki', weight: 0.3 },
        { method: 'epley', weight: 0.25 },
        { method: 'lander', weight: 0.25 },
        { method: 'wathen', weight: 0.2 }
      ];
    } else if (reps <= 12) {
      return [
        { method: 'wathen', weight: 0.3 },
        { method: 'mcglothin', weight: 0.25 },
        { method: 'epley', weight: 0.2 },
        { method: 'oconner', weight: 0.25 }
      ];
    } else {
      return [
        { method: 'wathen', weight: 0.4 },
        { method: 'oconner', weight: 0.3 },
        { method: 'mcglothin', weight: 0.3 }
      ];
    }
  }

  /**
   * Genera tabla de porcentajes de 1RM
   */
  static getPercentageTable(oneRepMax) {
    const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
    const repEstimates = [1, 2, 4, 6, 8, 10, 11, 15, 20, 25, 30];

    return percentages.map((percentage, index) => ({
      percentage,
      weight: Math.round((oneRepMax * percentage / 100) * 2) / 2, // Redondear a 0.5kg
      estimatedReps: repEstimates[index],
      intensity: this.getIntensityDescription(percentage)
    }));
  }

  /**
   * Describe la intensidad según el porcentaje de 1RM
   */
  static getIntensityDescription(percentage) {
    if (percentage >= 95) return 'Máxima intensidad';
    if (percentage >= 85) return 'Alta intensidad - Fuerza';
    if (percentage >= 70) return 'Intensidad moderada-alta - Hipertrofia/Fuerza';
    if (percentage >= 60) return 'Intensidad moderada - Hipertrofia';
    if (percentage >= 50) return 'Baja intensidad - Resistencia';
    return 'Muy baja intensidad - Calentamiento';
  }

  /**
   * Calcula el peso para un número específico de repeticiones
   */
  static getWeightForReps(oneRepMax, targetReps) {
    // Usar fórmula Brzycki inversa como base
    const percentage = 36 / (36 + targetReps);
    return Math.round((oneRepMax * percentage) * 2) / 2;
  }

  /**
   * Estima el número de repeticiones para un peso dado
   */
  static getRepEstimate(oneRepMax, weight) {
    if (weight > oneRepMax) return 0;
    
    const percentage = weight / oneRepMax;
    
    // Usar interpolación de la tabla estándar
    const table = [
      { percentage: 1.00, reps: 1 },
      { percentage: 0.95, reps: 2 },
      { percentage: 0.90, reps: 4 },
      { percentage: 0.85, reps: 6 },
      { percentage: 0.80, reps: 8 },
      { percentage: 0.75, reps: 10 },
      { percentage: 0.70, reps: 11 },
      { percentage: 0.65, reps: 15 },
      { percentage: 0.60, reps: 20 }
    ];

    // Encontrar los dos puntos más cercanos para interpolar
    for (let i = 0; i < table.length - 1; i++) {
      const current = table[i];
      const next = table[i + 1];
      
      if (percentage >= next.percentage && percentage <= current.percentage) {
        // Interpolación lineal
        const t = (percentage - next.percentage) / (current.percentage - next.percentage);
        return Math.round(next.reps + t * (current.reps - next.reps));
      }
    }

    // Si está fuera del rango, extrapolar
    if (percentage > 1) return 0;
    return Math.round(30 / percentage); // Extrapolación simple
  }

  /**
   * Análisis de progresión de fuerza a lo largo del tiempo
   */
  static analyzeStrengthProgression(oneRMHistory, exerciseName) {
    if (!oneRMHistory || oneRMHistory.length < 2) {
      return {
        trend: 'insufficient_data',
        message: 'Necesitas al menos 2 mediciones para analizar progresión'
      };
    }

    const sortedHistory = oneRMHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sortedHistory[0];
    const last = sortedHistory[sortedHistory.length - 1];
    
    const totalGain = last.oneRM - first.oneRM;
    const totalDays = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
    const weeklyGain = (totalGain / totalDays) * 7;
    const percentageGain = (totalGain / first.oneRM) * 100;

    // Determinar tendencia
    let trend, message;
    if (percentageGain > 15) {
      trend = 'excellent';
      message = `Excelente progresión en ${exerciseName}. Has ganado ${totalGain.toFixed(1)}kg (${percentageGain.toFixed(1)}%)`;
    } else if (percentageGain > 5) {
      trend = 'good';
      message = `Buena progresión en ${exerciseName}. Has ganado ${totalGain.toFixed(1)}kg (${percentageGain.toFixed(1)}%)`;
    } else if (percentageGain > 0) {
      trend = 'slow';
      message = `Progresión lenta en ${exerciseName}. Has ganado ${totalGain.toFixed(1)}kg (${percentageGain.toFixed(1)}%)`;
    } else {
      trend = 'plateau';
      message = `Meseta en ${exerciseName}. Considera cambiar la rutina o técnica`;
    }

    return {
      trend,
      message,
      totalGain: totalGain.toFixed(1),
      percentageGain: percentageGain.toFixed(1),
      weeklyGain: weeklyGain.toFixed(2),
      timespan: Math.round(totalDays),
      recommendations: this.getProgressionRecommendations(trend, weeklyGain)
    };
  }

  /**
   * Genera recomendaciones basadas en la progresión
   */
  static getProgressionRecommendations(trend, weeklyGain) {
    switch (trend) {
      case 'plateau':
        return [
          'Considera un período de descarga (deload week)',
          'Varía los rangos de repeticiones',
          'Añade ejercicios accesorios',
          'Revisa tu técnica con un entrenador'
        ];
      case 'slow':
        return [
          'Asegúrate de comer suficientes proteínas',
          'Aumenta la frecuencia de entrenamiento',
          'Considera periodización'
        ];
      case 'good':
        return [
          'Mantén la consistencia actual',
          'Monitorea la fatiga para evitar sobreentrenamiento'
        ];
      case 'excellent':
        return [
          '¡Excelente trabajo!',
          'Considera establecer nuevas metas',
          'Mantén el enfoque en la técnica'
        ];
      default:
        return ['Continúa registrando tus entrenamientos'];
    }
  }
}

module.exports = OneRepMaxCalculator;