import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Scale, Ruler, Activity, TrendingUp } from 'lucide-react';

const MeasurementsModal = ({ isOpen, onClose, currentMeasurements, onSave }) => {
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    waist: '',
    neck: '',
    chest: '',
    arms: '',
    thigh: '',
    hip: '',
    abdomen: '',
    ...currentMeasurements
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentMeasurements) {
      setMeasurements(prev => ({
        ...prev,
        ...currentMeasurements
      }));
    }
  }, [currentMeasurements]);

  // Validar un campo específico
  const validateField = (name, value) => {
    const validationRules = {
      weight: { min: 20, max: 300, required: true },
      height: { min: 100, max: 250, required: true },
      bodyFat: { min: 3, max: 50, required: false },
      waist: { min: 40, max: 200, required: false },
      neck: { min: 20, max: 60, required: false },
      chest: { min: 50, max: 200, required: false },
      arms: { min: 15, max: 80, required: false },
      thigh: { min: 30, max: 100, required: false },
      hip: { min: 50, max: 200, required: false },
      abdomen: { min: 40, max: 200, required: false }
    };

    const rule = validationRules[name];
    if (!rule) return '';

    if (rule.required && (!value || value <= 0)) {
      return `${getFieldLabel(name)} es requerido`;
    }

    if (value && (value < rule.min || value > rule.max)) {
      return `${getFieldLabel(name)} debe estar entre ${rule.min} y ${rule.max}`;
    }

    return '';
  };

  // Obtener etiqueta del campo
  const getFieldLabel = (name) => {
    const labels = {
      weight: 'Peso',
      height: 'Altura',
      bodyFat: 'Grasa corporal',
      waist: 'Cintura',
      neck: 'Cuello',
      chest: 'Pecho',
      arms: 'Brazos',
      thigh: 'Muslo',
      hip: 'Cadera',
      abdomen: 'Abdomen'
    };
    return labels[name] || name;
  };

  // Obtener unidad del campo
  const getFieldUnit = (name) => {
    const units = {
      weight: 'kg',
      height: 'cm',
      bodyFat: '%',
      waist: 'cm',
      neck: 'cm',
      chest: 'cm',
      arms: 'cm',
      thigh: 'cm',
      hip: 'cm',
      abdomen: 'cm'
    };
    return units[name] || '';
  };

  // Calcular IMC automáticamente
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Manejar cambio de valores
  const handleChange = (name, value) => {
    const numericValue = value ? parseFloat(value) : '';
    
    setMeasurements(prev => {
      const updated = { ...prev, [name]: numericValue };
      
      // Calcular IMC automáticamente si se actualiza peso o altura
      if (name === 'weight' || name === 'height') {
        const bmi = calculateBMI(
          name === 'weight' ? numericValue : updated.weight,
          name === 'height' ? numericValue : updated.height
        );
        if (bmi) {
          updated.bmi = parseFloat(bmi);
        }
      }
      
      return updated;
    });

    // Validar campo
    const error = validateField(name, numericValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    Object.keys(measurements).forEach(key => {
      if (key !== 'bmi' && key !== 'lastUpdated') {
        const error = validateField(key, measurements[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updatedMeasurements = {
        ...measurements,
        lastUpdated: new Date().toISOString(),
        bmi: calculateBMI(measurements.weight, measurements.height)
      };
      
      await onSave(updatedMeasurements);
      onClose();
    } catch (error) {
      console.error('Error guardando medidas:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const handleClose = () => {
    setMeasurements({
      weight: '',
      height: '',
      bodyFat: '',
      waist: '',
      neck: '',
      chest: '',
      arms: '',
      thigh: '',
      hip: '',
      abdomen: '',
      ...currentMeasurements
    });
    setErrors({});
    onClose();
  };

  const measurementFields = [
    { name: 'weight', icon: Scale, required: true },
    { name: 'height', icon: Ruler, required: true },
    { name: 'bodyFat', icon: Activity, required: false },
    { name: 'waist', icon: null, required: false },
    { name: 'neck', icon: null, required: false },
    { name: 'chest', icon: null, required: false },
    { name: 'arms', icon: null, required: false },
    { name: 'thigh', icon: null, required: false },
    { name: 'hip', icon: null, required: false },
    { name: 'abdomen', icon: null, required: false }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Actualizar Medidas Corporales" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Medidas principales */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Medidas Principales
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurementFields.slice(0, 4).map(({ name, icon: Icon, required }) => (
              <div key={name}>
                <Input
                  label={
                    <span className="flex items-center">
                      {Icon && <Icon className="w-4 h-4 mr-1" />}
                      {getFieldLabel(name)} {required && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-gray-500 ml-1">({getFieldUnit(name)})</span>
                    </span>
                  }
                  type="number"
                  step={name === 'bodyFat' ? '0.1' : '1'}
                  value={measurements[name] || ''}
                  onChange={(e) => handleChange(name, e.target.value)}
                  error={errors[name]}
                  placeholder={`Ingresa tu ${getFieldLabel(name).toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Medidas corporales detalladas */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Medidas Corporales Detalladas (Opcional)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {measurementFields.slice(4).map(({ name, required }) => (
              <div key={name}>
                <Input
                  label={
                    <span>
                      {getFieldLabel(name)}
                      <span className="text-gray-500 ml-1">({getFieldUnit(name)})</span>
                    </span>
                  }
                  type="number"
                  step="0.5"
                  value={measurements[name] || ''}
                  onChange={(e) => handleChange(name, e.target.value)}
                  error={errors[name]}
                  placeholder={`${getFieldLabel(name)}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Información calculada */}
        {measurements.weight && measurements.height && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Información Calculada</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Índice de Masa Corporal (IMC):</span>
              <span className="font-semibold text-primary-600">
                {calculateBMI(measurements.weight, measurements.height)}
              </span>
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
            {isSubmitting ? 'Guardando...' : 'Guardar Medidas'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MeasurementsModal;