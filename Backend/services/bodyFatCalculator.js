// backend/src/services/bodyFatCalculator.js

class BodyFatCalculator {
  
  /**
   * Método de la Marina de Estados Unidos (corregido)
   */
  static usNavy(measurements, gender) {
    const { waist, neck, height, hip } = measurements;
    
    if (gender === 'male') {
      if (!waist || !neck || !height) {
        throw new Error('Para hombres se requiere: cintura, cuello y altura');
      }
      // Fórmula corregida para hombres
      return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    } else {
      if (!waist || !hip || !neck || !height) {
        throw new Error('Para mujeres se requiere: cintura, cadera, cuello y altura');
      }
      // Fórmula corregida para mujeres
      return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
    }
  }

  /**
   * Método Jackson-Pollock (más preciso con pliegues cutáneos simulados)
   */
  static jacksonPollock(measurements, gender, age) {
    const { chest, abdomen, thigh, tricep, suprailiac, subscapular } = measurements;
    
    if (gender === 'male') {
      if (!chest || !abdomen || !thigh) {
        throw new Error('Para hombres se requiere: pecho, abdomen y muslo');
      }
      const sum = chest + abdomen + thigh;
      const density = 1.10938 - (0.0008267 * sum) + (0.0000016 * Math.pow(sum, 2)) - (0.0002574 * age);
      return (495 / density) - 450;
    } else {
      if (!tricep || !suprailiac || !thigh) {
        throw new Error('Para mujeres se requiere: trícep, suprailíaco y muslo');
      }
      const sum = tricep + suprailiac + thigh;
      const density = 1.0994921 - (0.0009929 * sum) + (0.0000023 * Math.pow(sum, 2)) - (0.0001392 * age);
      return (495 / density) - 450;
    }
  }

  /**
   * Estimación basada en BMI (menos preciso pero accesible)
   */
  static bmiEstimate(weight, height, age, gender) {
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    
    // Fórmula de Deurenberg et al.
    const genderFactor = gender === 'male' ? 1 : 0;
    return (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
  }

  /**
   * Método combinado que usa múltiples cálculos para mayor precisión
   */
  static composite(measurements, gender, age, weight, height) {
    const results = [];
    const methods = [];

    try {
      const navyResult = this.usNavy(measurements, gender);
      if (navyResult >= 2 && navyResult <= 50) { // Validación de rango razonable
        results.push(navyResult);
        methods.push('US Navy');
      }
    } catch (error) {
      console.log('US Navy method failed:', error.message);
    }

    try {
      const bmiResult = this.bmiEstimate(weight, height, age, gender);
      if (bmiResult >= 2 && bmiResult <= 50) {
        results.push(bmiResult);
        methods.push('BMI Estimate');
      }
    } catch (error) {
      console.log('BMI method failed:', error.message);
    }

    if (results.length === 0) {
      throw new Error('No se pudo calcular el porcentaje de grasa con los datos proporcionados');
    }

    // Promedio ponderado (dar más peso al método de la Marina si está disponible)
    let weightedSum = 0;
    let totalWeight = 0;

    results.forEach((result, index) => {
      const weight = methods[index] === 'US Navy' ? 0.7 : 0.3;
      weightedSum += result * weight;
      totalWeight += weight;
    });

    const average = weightedSum / totalWeight;

    return {
      bodyFatPercentage: Math.round(average * 100) / 100,
      methods: methods,
      individual: results.map((result, index) => ({
        method: methods[index],
        value: Math.round(result * 100) / 100
      })),
      reliability: this.getReliabilityScore(methods.length, measurements)
    };
  }

  /**
   * Calcula la confiabilidad del resultado basado en los métodos disponibles
   */
  static getReliabilityScore(methodCount, measurements) {
    let score = methodCount * 30; // 30 puntos por método
    
    // Bonus por medidas más precisas
    if (measurements.waist && measurements.neck && measurements.height) score += 20;
    if (measurements.hip) score += 10;
    
    return Math.min(score, 100); // Máximo 100%
  }

  /**
   * Clasifica el porcentaje de grasa según estándares de salud
   */
  static classifyBodyFat(bodyFatPercentage, gender, age) {
    const classifications = {
      male: {
        essential: [2, 5],
        athlete: [6, 13],
        fitness: [14, 17],
        average: [18, 24],
        obese: [25, 50]
      },
      female: {
        essential: [10, 13],
        athlete: [14, 20],
        fitness: [21, 24],
        average: [25, 31],
        obese: [32, 50]
      }
    };

    const ranges = classifications[gender];
    
    for (const [category, [min, max]] of Object.entries(ranges)) {
      if (bodyFatPercentage >= min && bodyFatPercentage <= max) {
        return {
          category: category,
          description: this.getCategoryDescription(category),
          isHealthy: ['athlete', 'fitness', 'average'].includes(category)
        };
      }
    }

    return {
      category: 'unknown',
      description: 'Fuera del rango normal',
      isHealthy: false
    };
  }

  static getCategoryDescription(category) {
    const descriptions = {
      essential: 'Grasa esencial - Mínimo necesario para funciones vitales',
      athlete: 'Atlético - Nivel muy bajo de grasa corporal',
      fitness: 'Fitness - Nivel saludable y atlético',
      average: 'Promedio - Nivel saludable normal',
      obese: 'Obesidad - Nivel alto que puede afectar la salud'
    };
    return descriptions[category] || 'Clasificación desconocida';
  }

  /**
   * Genera recomendaciones basadas en el porcentaje de grasa
   */
  static generateRecommendations(bodyFatPercentage, gender, goal = 'health') {
    const classification = this.classifyBodyFat(bodyFatPercentage, gender);
    const recommendations = [];

    if (classification.category === 'obese') {
      recommendations.push({
        type: 'priority',
        message: 'Considera consultar con un profesional de la salud',
        action: 'Crear plan de reducción de peso gradual'
      });
    }

    if (goal === 'weight_loss' && bodyFatPercentage > 15) {
      recommendations.push({
        type: 'nutrition',
        message: 'Enfócate en un déficit calórico moderado',
        action: 'Combina cardio con entrenamiento de resistencia'
      });
    }

    if (goal === 'muscle_gain' && classification.category === 'athlete') {
      recommendations.push({
        type: 'nutrition',
        message: 'Considera un ligero superávit calórico',
        action: 'Prioriza el entrenamiento de fuerza'
      });
    }

    return recommendations;
  }
}

module.exports = BodyFatCalculator;