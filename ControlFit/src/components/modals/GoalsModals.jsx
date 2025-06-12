import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Target, Calendar, TrendingUp, FileText, AlertCircle } from 'lucide-react';

const GoalsModal = ({ isOpen, onClose, goals, currentMeasurements, onSave }) => {
  const [formData, setFormData] = useState({
    targetWeight: '',
    targetBodyFat: '',
    targetBMI: '',
    deadline: '',
    notes: '',
    priority: 'medium',
    category: 'weight_loss',
    ...goals
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goals) {
      setFormData(prev => ({
        ...prev,
        ...goals,
        deadline: goals.deadline ? goals.deadline.split('T')[0] : ''
      }));
    }
  }, [goals]);

  // Categorías de objetivos predefinidas
  const goalCategories = [
    { value: 'weight_loss', label: 'Pérdida de peso', icon: TrendingUp },
    { value: 'weight_gain', label: 'Aumento de peso', icon: TrendingUp },
    { value: 'muscle_gain', label: 'Ganancia muscular', icon: Target },
    { value: 'fat_loss', label: 'Pérdida de grasa', icon: Target },
    { value: 'maintenance', label: 'Mantenimiento', icon: Target },
    { value: 'body_recomp', label: 'Recomposición corporal', icon: Target }
  ];

  // Niveles de prioridad
  const priorityLevels = [
    { value: 'low', label: 'Baja', color: 'text-gray-600' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600' },
    { value: 'high', label: 'Alta', color: 'text-red-600' }
  ];

  // Validar campo específico
  const validateField = (name, value) => {
    const current = currentMeasurements || {};
    
    switch (name) {
      case 'targetWeight':
        if (value && (value < 20 || value > 300)) {
          return 'El peso objetivo debe estar entre 20 y 300 kg';
        }
        break;
      case 'targetBodyFat':
        if (value && (value < 3 || value > 50)) {
          return 'El porcentaje de grasa corporal debe estar entre 3% y 50%';
        }
        break;
      case 'targetBMI':
        if (value && (value < 15 || value > 40)) {
          return 'El IMC objetivo debe estar entre 15 y 40';
        }
        break;
      case 'deadline':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate <= today) {
            return 'La fecha objetivo debe ser posterior a hoy';
          }
          
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 2);
          
          if (selectedDate > oneYearFromNow) {
            return 'La fecha objetivo no puede ser mayor a 2 años';
          }
        }
        break;
      case 'notes':
        if (value && value.length > 500) {
          return 'Las notas no pueden exceder 500 caracteres';
        }
        break;
    }
    return '';
  };

  // Manejar cambios en el formulario
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar campo
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Al menos un objetivo debe estar definido
    const hasAtLeastOneGoal = formData.targetWeight || 
                              formData.targetBodyFat || 
                              formData.targetBMI;
    
    if (!hasAtLeastOneGoal) {
      newErrors.general = 'Debes establecer al menos un objetivo';
    }

    // Validar cada campo
    Object.keys(formData).forEach(key => {
      if (key !== 'priority' && key !== 'category') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular progreso hacia los objetivos
  const calculateProgress = () => {
    if (!currentMeasurements) return null;
    
    const progress = {};
    
    if (formData.targetWeight && currentMeasurements.weight) {
      const diff = Math.abs(currentMeasurements.weight - formData.targetWeight);
      const initial = currentMeasurements.weight;
      progress.weight = Math.max(0, Math.min(100, ((initial - diff) / initial) * 100));
    }
    
    if (formData.targetBodyFat && currentMeasurements.bodyFat) {
      const diff = Math.abs(currentMeasurements.bodyFat - formData.targetBodyFat);
      const initial = currentMeasurements.bodyFat;
      progress.bodyFat = Math.max(0, Math.min(100, ((initial - diff) / initial) * 100));
    }
    
    return progress;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updatedGoals = {
        ...formData,
        lastUpdated: new Date().toISOString(),
        createdAt: goals?.createdAt || new Date().toISOString(),
        progress: calculateProgress()
      };
      
      await onSave(updatedGoals);
      onClose();
    } catch (error) {
      console.error('Error guardando objetivos:', error);
      setErrors({ general: 'Error al guardar los objetivos. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const handleClose = () => {
    setFormData({
      targetWeight: '',
      targetBodyFat: '',
      targetBMI: '',
      deadline: '',
      notes: '',
      priority: 'medium',
      category: 'weight_loss',
      ...goals
    });
    setErrors({});
    onClose();
  };

  // Calcular días restantes hasta la fecha objetivo
  const getDaysRemaining = () => {
    if (!formData.deadline) return null;
    
    const deadline = new Date(formData.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Establecer Objetivos" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Categoría y prioridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría de objetivo
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {goalCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {priorityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Objetivos numéricos */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Objetivos Numéricos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={
                <span className="flex items-center">
                  Peso objetivo
                  <span className="text-gray-500 ml-1">(kg)</span>
                  {currentMeasurements?.weight && (
                    <span className="text-xs text-gray-400 ml-2">
                      Actual: {currentMeasurements.weight}kg
                    </span>
                  )}
                </span>
              }
              type="number"
              step="0.1"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
              error={errors.targetWeight}
              placeholder="ej. 70.0"
            />

            <Input
              label={
                <span className="flex items-center">
                  Grasa corporal objetivo
                  <span className="text-gray-500 ml-1">(%)</span>
                  {currentMeasurements?.bodyFat && (
                    <span className="text-xs text-gray-400 ml-2">
                      Actual: {currentMeasurements.bodyFat}%
                    </span>
                  )}
                </span>
              }
              type="number"
              step="0.1"
              value={formData.targetBodyFat}
              onChange={(e) => handleChange('targetBodyFat', e.target.value)}
              error={errors.targetBodyFat}
              placeholder="ej. 15.0"
            />

            <Input
              label={
                <span className="flex items-center">
                  IMC objetivo
                  {currentMeasurements?.bmi && (
                    <span className="text-xs text-gray-400 ml-2">
                      Actual: {currentMeasurements.bmi}
                    </span>
                  )}
                </span>
              }
              type="number"
              step="0.1"
              value={formData.targetBMI}
              onChange={(e) => handleChange('targetBMI', e.target.value)}
              error={errors.targetBMI}
              placeholder="ej. 22.0"
            />
          </div>
        </div>

        {/* Fecha objetivo */}
        <div>
          <Input
            label={
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Fecha objetivo
                {daysRemaining && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({daysRemaining} días restantes)
                  </span>
                )}
              </span>
            }
            type="date"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            error={errors.deadline}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Notas y estrategia
            <span className="text-xs text-gray-500 ml-2">
              ({(formData.notes || '').length}/500)
            </span>
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows="4"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            error={errors.notes}
            placeholder="Describe tu plan para alcanzar estos objetivos, motivaciones, estrategias específicas..."
            maxLength="500"
          />
          {errors.notes && (
            <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
          )}
        </div>

        {/* Información de progreso */}
        {currentMeasurements && (formData.targetWeight || formData.targetBodyFat) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Vista Previa del Progreso</h4>
            <div className="space-y-2 text-sm">
              {formData.targetWeight && currentMeasurements.weight && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Cambio de peso necesario:</span>
                  <span className="font-semibold text-blue-900">
                    {(formData.targetWeight - currentMeasurements.weight).toFixed(1)} kg
                  </span>
                </div>
              )}
              {formData.targetBodyFat && currentMeasurements.bodyFat && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Cambio de grasa corporal:</span>
                  <span className="font-semibold text-blue-900">
                    {(formData.targetBodyFat - currentMeasurements.bodyFat).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={Object.keys(errors).some(key => errors[key])}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Objetivos'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalsModal;