import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  Plus, 
  Trash2, 
  Info, 
  Target, 
  Settings, 
  BookOpen,
  Clock,
  Dumbbell,
  Activity,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const ExerciseModal = ({ isOpen, onClose, exercise, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    alternativeNames: [],
    category: 'strength',
    subcategory: '',
    muscleGroups: [],
    secondaryMuscles: [],
    equipment: 'bodyweight',
    description: '',
    instructions: [''],
    tips: [''],
    commonMistakes: [''],
    difficulty: 'beginner',
    type: 'compound',
    forceType: 'push',
    defaultSets: 3,
    defaultReps: { min: 8, max: 12 },
    defaultRestTime: 60,
    trackingMethods: ['weight', 'reps'],
    tags: [],
    ...exercise
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    muscles: true,
    instructions: false,
    configuration: false,
    advanced: false
  });

  useEffect(() => {
    if (exercise) {
      setFormData(prev => ({
        ...prev,
        ...exercise,
        alternativeNames: exercise.alternativeNames || [],
        instructions: exercise.instructions?.length ? exercise.instructions : [''],
        tips: exercise.tips?.length ? exercise.tips : [''],
        commonMistakes: exercise.commonMistakes?.length ? exercise.commonMistakes : [''],
        tags: Array.isArray(exercise.tags) ? exercise.tags : 
              typeof exercise.tags === 'string' ? exercise.tags.split(',').map(tag => tag.trim()) : []
      }));
    }
  }, [exercise]);

  // Opciones de configuración
  const categories = [
    { value: 'strength', label: 'Fuerza', icon: Dumbbell },
    { value: 'cardio', label: 'Cardio', icon: Activity },
    { value: 'flexibility', label: 'Flexibilidad', icon: Target },
    { value: 'sports', label: 'Deportes', icon: Target },
    { value: 'functional', label: 'Funcional', icon: Target }
  ];

  const muscleGroups = [
    { value: 'chest', label: 'Pecho', category: 'upper' },
    { value: 'back', label: 'Espalda', category: 'upper' },
    { value: 'shoulders', label: 'Hombros', category: 'upper' },
    { value: 'arms', label: 'Brazos', category: 'upper' },
    { value: 'biceps', label: 'Bíceps', category: 'upper' },
    { value: 'triceps', label: 'Tríceps', category: 'upper' },
    { value: 'forearms', label: 'Antebrazos', category: 'upper' },
    { value: 'legs', label: 'Piernas', category: 'lower' },
    { value: 'quadriceps', label: 'Cuádriceps', category: 'lower' },
    { value: 'hamstrings', label: 'Isquiotibiales', category: 'lower' },
    { value: 'glutes', label: 'Glúteos', category: 'lower' },
    { value: 'calves', label: 'Pantorrillas', category: 'lower' },
    { value: 'core', label: 'Core', category: 'core' },
    { value: 'abs', label: 'Abdominales', category: 'core' }
  ];

  const equipmentOptions = [
    { value: 'bodyweight', label: 'Peso corporal' },
    { value: 'barbell', label: 'Barra' },
    { value: 'dumbbell', label: 'Mancuernas' },
    { value: 'machine', label: 'Máquina' },
    { value: 'cable', label: 'Polea' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'resistance_band', label: 'Banda elástica' },
    { value: 'medicine_ball', label: 'Balón medicinal' },
    { value: 'suspension', label: 'Suspensión (TRX)' },
    { value: 'other', label: 'Otro' }
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Avanzado', color: 'bg-red-100 text-red-800' }
  ];

  const exerciseTypes = [
    { value: 'compound', label: 'Compuesto' },
    { value: 'isolation', label: 'Aislamiento' },
    { value: 'cardio', label: 'Cardiovascular' },
    { value: 'stretching', label: 'Estiramiento' }
  ];

  const forceTypes = [
    { value: 'push', label: 'Empuje' },
    { value: 'pull', label: 'Tirón' },
    { value: 'static', label: 'Estático' },
    { value: 'dynamic', label: 'Dinámico' }
  ];

  const trackingMethods = [
    { value: 'weight', label: 'Peso' },
    { value: 'reps', label: 'Repeticiones' },
    { value: 'duration', label: 'Duración' },
    { value: 'distance', label: 'Distancia' },
    { value: 'calories', label: 'Calorías' }
  ];

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'El nombre es requerido';
        }
        if (value.length > 100) {
          return 'El nombre debe tener máximo 100 caracteres';
        }
        break;
      case 'description':
        if (value && value.length > 500) {
          return 'La descripción debe tener máximo 500 caracteres';
        }
        break;
      case 'muscleGroups':
        if (!value || value.length === 0) {
          return 'Debe seleccionar al menos un grupo muscular';
        }
        break;
      case 'defaultSets':
        if (!value || value < 1 || value > 10) {
          return 'Las series deben estar entre 1 y 10';
        }
        break;
      case 'defaultReps':
        if (!value.min || !value.max || value.min > value.max) {
          return 'El rango de repeticiones no es válido';
        }
        break;
      case 'defaultRestTime':
        if (!value || value < 0 || value > 600) {
          return 'El tiempo de descanso debe estar entre 0 y 600 segundos';
        }
        break;
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos requeridos
    newErrors.name = validateField('name', formData.name);
    newErrors.description = validateField('description', formData.description);
    newErrors.muscleGroups = validateField('muscleGroups', formData.muscleGroups);
    newErrors.defaultSets = validateField('defaultSets', formData.defaultSets);
    newErrors.defaultReps = validateField('defaultReps', formData.defaultReps);
    newErrors.defaultRestTime = validateField('defaultRestTime', formData.defaultRestTime);
    
    // Validar instrucciones
    if (formData.instructions.some(instruction => instruction.trim().length > 200)) {
      newErrors.instructions = 'Cada instrucción debe tener máximo 200 caracteres';
    }
    
    // Filtrar errores vacíos
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
  };

  // Gestión de arrays
  const addToArray = (fieldName, newItem = '') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], newItem]
    }));
  };

  const removeFromArray = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  // Gestión de tags
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Toggle de secciones
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const exerciseData = {
        ...formData,
        // Limpiar arrays vacíos
        instructions: formData.instructions.filter(instruction => instruction.trim()),
        tips: formData.tips.filter(tip => tip.trim()),
        commonMistakes: formData.commonMistakes.filter(mistake => mistake.trim()),
        alternativeNames: formData.alternativeNames.filter(name => name.trim()),
        lastUpdated: new Date().toISOString(),
        createdAt: exercise?.createdAt || new Date().toISOString()
      };
      
      await onSave(exerciseData);
      onClose();
    } catch (error) {
      console.error('Error guardando ejercicio:', error);
      setErrors({ general: 'Error al guardar el ejercicio' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    setFormData({
      name: '',
      alternativeNames: [],
      category: 'strength',
      subcategory: '',
      muscleGroups: [],
      secondaryMuscles: [],
      equipment: 'bodyweight',
      description: '',
      instructions: [''],
      tips: [''],
      commonMistakes: [''],
      difficulty: 'beginner',
      type: 'compound',
      forceType: 'push',
      defaultSets: 3,
      defaultReps: { min: 8, max: 12 },
      defaultRestTime: 60,
      trackingMethods: ['weight', 'reps'],
      tags: [],
      ...exercise
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={exercise ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'} 
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Información básica */}
        <CollapsibleSection
          title="Información Básica"
          icon={Info}
          isExpanded={expandedSections.basic}
          onToggle={() => toggleSection('basic')}
        >
          <div className="space-y-4">
            <Input
              label="Nombre del ejercicio"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Ej: Press de banca con barra"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dificultad
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipamiento
                </label>
                <select
                  value={formData.equipment}
                  onChange={(e) => handleChange('equipment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {equipmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Descripción"
              as="textarea"
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={errors.description}
              placeholder="Descripción breve del ejercicio y sus beneficios"
            />

            {/* Nombres alternativos */}
            <ArrayField
              label="Nombres alternativos"
              values={formData.alternativeNames}
              onAdd={() => addToArray('alternativeNames', '')}
              onRemove={(index) => removeFromArray('alternativeNames', index)}
              onUpdate={(index, value) => updateArrayItem('alternativeNames', index, value)}
              placeholder="Nombre alternativo del ejercicio"
            />
          </div>
        </CollapsibleSection>

        {/* Grupos musculares */}
        <CollapsibleSection
          title="Grupos Musculares"
          icon={Target}
          isExpanded={expandedSections.muscles}
          onToggle={() => toggleSection('muscles')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Músculos principales <span className="text-red-500">*</span>
              </label>
              {errors.muscleGroups && (
                <p className="text-red-500 text-xs mb-2">{errors.muscleGroups}</p>
              )}
              <MuscleGroupSelector
                selectedGroups={formData.muscleGroups}
                availableGroups={muscleGroups}
                onChange={(groups) => handleChange('muscleGroups', groups)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Músculos secundarios
              </label>
              <MuscleGroupSelector
                selectedGroups={formData.secondaryMuscles}
                availableGroups={muscleGroups.filter(group => 
                  !formData.muscleGroups.includes(group.value)
                )}
                onChange={(groups) => handleChange('secondaryMuscles', groups)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Instrucciones */}
        <CollapsibleSection
          title="Instrucciones y Tips"
          icon={BookOpen}
          isExpanded={expandedSections.instructions}
          onToggle={() => toggleSection('instructions')}
        >
          <div className="space-y-6">
            <ArrayField
              label="Instrucciones paso a paso"
              values={formData.instructions}
              onAdd={() => addToArray('instructions', '')}
              onRemove={(index) => removeFromArray('instructions', index)}
              onUpdate={(index, value) => updateArrayItem('instructions', index, value)}
              placeholder="Paso de la ejecución del ejercicio"
              as="textarea"
              error={errors.instructions}
            />

            <ArrayField
              label="Tips y consejos"
              values={formData.tips}
              onAdd={() => addToArray('tips', '')}
              onRemove={(index) => removeFromArray('tips', index)}
              onUpdate={(index, value) => updateArrayItem('tips', index, value)}
              placeholder="Consejo para mejorar la ejecución"
              as="textarea"
            />

            <ArrayField
              label="Errores comunes"
              values={formData.commonMistakes}
              onAdd={() => addToArray('commonMistakes', '')}
              onRemove={(index) => removeFromArray('commonMistakes', index)}
              onUpdate={(index, value) => updateArrayItem('commonMistakes', index, value)}
              placeholder="Error común que se debe evitar"
              as="textarea"
            />
          </div>
        </CollapsibleSection>

        {/* Configuración de entrenamiento */}
        <CollapsibleSection
          title="Configuración de Entrenamiento"
          icon={Settings}
          isExpanded={expandedSections.configuration}
          onToggle={() => toggleSection('configuration')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Series por defecto"
                type="number"
                value={formData.defaultSets}
                onChange={(e) => handleChange('defaultSets', parseInt(e.target.value))}
                error={errors.defaultSets}
                min="1"
                max="10"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeticiones mínimas
                </label>
                <input
                  type="number"
                  value={formData.defaultReps.min}
                  onChange={(e) => handleChange('defaultReps', {
                    ...formData.defaultReps,
                    min: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeticiones máximas
                </label>
                <input
                  type="number"
                  value={formData.defaultReps.max}
                  onChange={(e) => handleChange('defaultReps', {
                    ...formData.defaultReps,
                    max: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1"
                  max="100"
                />
                {errors.defaultReps && (
                  <p className="text-red-500 text-xs mt-1">{errors.defaultReps}</p>
                )}
              </div>
            </div>

            <Input
              label="Tiempo de descanso por defecto (segundos)"
              type="number"
              value={formData.defaultRestTime}
              onChange={(e) => handleChange('defaultRestTime', parseInt(e.target.value))}
              error={errors.defaultRestTime}
              min="0"
              max="600"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Métodos de seguimiento
              </label>
              <div className="flex flex-wrap gap-2">
                {trackingMethods.map(method => (
                  <label key={method.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.trackingMethods.includes(method.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange('trackingMethods', [...formData.trackingMethods, method.value]);
                        } else {
                          handleChange('trackingMethods', 
                            formData.trackingMethods.filter(m => m !== method.value)
                          );
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Configuración avanzada */}
        <CollapsibleSection
          title="Configuración Avanzada"
          icon={Settings}
          isExpanded={expandedSections.advanced}
          onToggle={() => toggleSection('advanced')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de ejercicio
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {exerciseTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de fuerza
                </label>
                <select
                  value={formData.forceType}
                  onChange={(e) => handleChange('forceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {forceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Subcategoría"
              value={formData.subcategory}
              onChange={(e) => handleChange('subcategory', e.target.value)}
              placeholder="Subcategoría específica del ejercicio"
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Agregar etiqueta y presionar Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </CollapsibleSection>

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
            {isSubmitting ? 'Guardando...' : exercise ? 'Actualizar' : 'Crear'} Ejercicio
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Componente de sección colapsable
const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children }) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Componente para campos de array
const ArrayField = ({ 
  label, 
  values, 
  onAdd, 
  onRemove, 
  onUpdate, 
  placeholder, 
  as = 'input',
  error 
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAdd}
          icon={<Plus className="w-3 h-3" />}
        >
          Agregar
        </Button>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mb-2">{error}</p>
      )}
      
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="flex-1">
              {as === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={(e) => onUpdate(index, e.target.value)}
                  placeholder={placeholder}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onUpdate(index, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-500 hover:text-red-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Selector de grupos musculares
const MuscleGroupSelector = ({ selectedGroups, availableGroups, onChange }) => {
  const toggleGroup = (groupValue) => {
    if (selectedGroups.includes(groupValue)) {
      onChange(selectedGroups.filter(group => group !== groupValue));
    } else {
      onChange([...selectedGroups, groupValue]);
    }
  };

  const groupsByCategory = availableGroups.reduce((acc, group) => {
    if (!acc[group.category]) acc[group.category] = [];
    acc[group.category].push(group);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupsByCategory).map(([category, groups]) => (
        <div key={category}>
          <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
            {category === 'upper' ? 'Tren Superior' : 
             category === 'lower' ? 'Tren Inferior' : 'Core'}
          </h5>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <button
                key={group.value}
                type="button"
                onClick={() => toggleGroup(group.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedGroups.includes(group.value)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseModal;