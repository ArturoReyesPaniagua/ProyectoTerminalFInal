import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Clock, 
  Target, 
  Settings, 
  Search,
  Timer,
  Dumbbell,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const WorkoutModal = ({ isOpen, onClose, workout, exercises, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exercises: [],
    tags: [],
    difficulty: 'beginner',
    estimatedDuration: 60,
    environment: 'gym',
    isPublic: false,
    ...workout
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(null);

  useEffect(() => {
    if (workout) {
      setFormData(prev => ({
        ...prev,
        ...workout,
        tags: Array.isArray(workout.tags) ? workout.tags : 
              typeof workout.tags === 'string' ? workout.tags.split(',').map(tag => tag.trim()) : []
      }));
    }
  }, [workout]);

  // Categorías y opciones
  const difficultyLevels = [
    { value: 'beginner', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Avanzado', color: 'bg-red-100 text-red-800' }
  ];

  const environments = [
    { value: 'gym', label: 'Gimnasio' },
    { value: 'home', label: 'Casa' },
    { value: 'outdoor', label: 'Exterior' },
    { value: 'any', label: 'Cualquiera' }
  ];

  const setTypes = [
    { value: 'normal', label: 'Normal' },
    { value: 'warmup', label: 'Calentamiento' },
    { value: 'dropset', label: 'Drop Set' },
    { value: 'rest_pause', label: 'Rest-Pause' },
    { value: 'timed', label: 'Por Tiempo' }
  ];

  // Filtrar ejercicios disponibles
  const filteredExercises = exercises?.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscleGroups.some(group => 
      group.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

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
      case 'estimatedDuration':
        if (!value || value < 5 || value > 480) {
          return 'La duración debe estar entre 5 y 480 minutos';
        }
        break;
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos básicos
    newErrors.name = validateField('name', formData.name);
    newErrors.description = validateField('description', formData.description);
    newErrors.estimatedDuration = validateField('estimatedDuration', formData.estimatedDuration);
    
    // Validar que tenga al menos un ejercicio
    if (!formData.exercises || formData.exercises.length === 0) {
      newErrors.exercises = 'Debe incluir al menos un ejercicio';
    }
    
    // Validar cada ejercicio
    formData.exercises?.forEach((exercise, exerciseIndex) => {
      if (!exercise.sets || exercise.sets.length === 0) {
        newErrors[`exercise_${exerciseIndex}`] = 'Debe tener al menos una serie';
      }
      
      exercise.sets?.forEach((set, setIndex) => {
        if (set.type === 'normal' && (!set.reps || set.reps < 1)) {
          newErrors[`exercise_${exerciseIndex}_set_${setIndex}`] = 'Repeticiones debe ser mayor a 0';
        }
        if (set.type === 'timed' && (!set.duration || set.duration < 1)) {
          newErrors[`exercise_${exerciseIndex}_set_${setIndex}`] = 'Duración debe ser mayor a 0';
        }
      });
    });
    
    // Filtrar errores vacíos
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en formulario
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
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

  // Gestión de ejercicios
  const addExercise = (exercise) => {
    const newExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      order: formData.exercises.length,
      sets: [{ type: 'normal', reps: exercise.defaultReps?.min || 10, weight: null }],
      restTime: exercise.defaultRestTime || 60,
      notes: '',
      muscleGroups: exercise.muscleGroups,
      equipment: exercise.equipment
    };
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
    setShowExerciseSearch(false);
    setSearchTerm('');
  };

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const updateExercise = (exerciseIndex, updates) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) => 
        index === exerciseIndex ? { ...exercise, ...updates } : exercise
      )
    }));
  };

  // Gestión de sets
  const addSet = (exerciseIndex) => {
    const exercise = formData.exercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      type: 'normal',
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || null
    };
    
    updateExercise(exerciseIndex, {
      sets: [...exercise.sets, newSet]
    });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const exercise = formData.exercises[exerciseIndex];
    if (exercise.sets.length > 1) {
      updateExercise(exerciseIndex, {
        sets: exercise.sets.filter((_, i) => i !== setIndex)
      });
    }
  };

  const updateSet = (exerciseIndex, setIndex, updates) => {
    const exercise = formData.exercises[exerciseIndex];
    const updatedSets = exercise.sets.map((set, index) => 
      index === setIndex ? { ...set, ...updates } : set
    );
    
    updateExercise(exerciseIndex, { sets: updatedSets });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const workoutData = {
        ...formData,
        lastUpdated: new Date().toISOString(),
        createdAt: workout?.createdAt || new Date().toISOString()
      };
      
      await onSave(workoutData);
      onClose();
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
      setErrors({ general: 'Error al guardar el entrenamiento' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      exercises: [],
      tags: [],
      difficulty: 'beginner',
      estimatedDuration: 60,
      environment: 'gym',
      isPublic: false,
      ...workout
    });
    setErrors({});
    setSelectedExerciseIndex(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={workout ? 'Editar Entrenamiento' : 'Crear Nuevo Entrenamiento'} 
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del entrenamiento"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="Ej: Push Day - Pecho y Tríceps"
            required
          />
          
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Duración estimada (minutos)"
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => handleChange('estimatedDuration', parseInt(e.target.value))}
            error={errors.estimatedDuration}
            min="5"
            max="480"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ambiente
            </label>
            <select
              value={formData.environment}
              onChange={(e) => handleChange('environment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {environments.map(env => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Input
            label="Descripción"
            as="textarea"
            rows="3"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            placeholder="Describe el objetivo y enfoque de este entrenamiento"
          />
        </div>

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

        {/* Ejercicios */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Ejercicios</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowExerciseSearch(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Agregar Ejercicio
            </Button>
          </div>

          {errors.exercises && (
            <p className="text-red-500 text-sm mb-4">{errors.exercises}</p>
          )}

          <div className="space-y-4">
            {formData.exercises.map((exercise, exerciseIndex) => (
              <ExerciseCard
                key={exerciseIndex}
                exercise={exercise}
                exerciseIndex={exerciseIndex}
                onUpdate={(updates) => updateExercise(exerciseIndex, updates)}
                onRemove={() => removeExercise(exerciseIndex)}
                onAddSet={() => addSet(exerciseIndex)}
                onRemoveSet={(setIndex) => removeSet(exerciseIndex, setIndex)}
                onUpdateSet={(setIndex, updates) => updateSet(exerciseIndex, setIndex, updates)}
                setTypes={setTypes}
                errors={errors}
                isExpanded={selectedExerciseIndex === exerciseIndex}
                onToggleExpand={() => setSelectedExerciseIndex(
                  selectedExerciseIndex === exerciseIndex ? null : exerciseIndex
                )}
              />
            ))}
          </div>
        </div>

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
            {isSubmitting ? 'Guardando...' : workout ? 'Actualizar' : 'Crear'} Entrenamiento
          </Button>
        </div>
      </form>

      {/* Modal de búsqueda de ejercicios */}
      {showExerciseSearch && (
        <ExerciseSearchModal
          isOpen={showExerciseSearch}
          onClose={() => {
            setShowExerciseSearch(false);
            setSearchTerm('');
          }}
          exercises={filteredExercises}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectExercise={addExercise}
        />
      )}
    </Modal>
  );
};

// Componente de tarjeta de ejercicio
const ExerciseCard = ({ 
  exercise, 
  exerciseIndex, 
  onUpdate, 
  onRemove, 
  onAddSet, 
  onRemoveSet, 
  onUpdateSet, 
  setTypes,
  errors,
  isExpanded,
  onToggleExpand
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <div>
            <h5 className="font-medium text-gray-900">{exercise.name}</h5>
            <div className="flex space-x-2 mt-1">
              {exercise.muscleGroups?.map((group, index) => (
                <Badge key={index} variant="outline" size="sm">
                  {group}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            icon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            icon={<Trash2 className="w-4 h-4" />}
            className="text-red-500 hover:text-red-700"
          />
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Configuración del ejercicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descanso entre series (segundos)
              </label>
              <input
                type="number"
                value={exercise.restTime || 60}
                onChange={(e) => onUpdate({ restTime: parseInt(e.target.value) })}
                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                min="0"
                max="600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <input
                type="text"
                value={exercise.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Notas del ejercicio..."
              />
            </div>
          </div>

          {/* Series */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h6 className="text-sm font-medium text-gray-700">Series</h6>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onAddSet}
                icon={<Plus className="w-3 h-3" />}
              >
                Agregar Serie
              </Button>
            </div>
            
            {errors[`exercise_${exerciseIndex}`] && (
              <p className="text-red-500 text-xs mb-2">{errors[`exercise_${exerciseIndex}`]}</p>
            )}

            <div className="space-y-2">
              {exercise.sets?.map((set, setIndex) => (
                <SetCard
                  key={setIndex}
                  set={set}
                  setIndex={setIndex}
                  onUpdate={(updates) => onUpdateSet(setIndex, updates)}
                  onRemove={() => onRemoveSet(setIndex)}
                  setTypes={setTypes}
                  canRemove={exercise.sets.length > 1}
                  error={errors[`exercise_${exerciseIndex}_set_${setIndex}`]}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente de serie
const SetCard = ({ set, setIndex, onUpdate, onRemove, setTypes, canRemove, error }) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
      <span className="text-sm font-medium text-gray-600 w-8">
        {setIndex + 1}
      </span>
      
      <select
        value={set.type || 'normal'}
        onChange={(e) => onUpdate({ type: e.target.value })}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        {setTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {set.type !== 'timed' ? (
        <>
          <input
            type="number"
            value={set.reps || ''}
            onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || null })}
            placeholder="Reps"
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            min="1"
          />
          <span className="text-xs text-gray-500">reps</span>
        </>
      ) : (
        <>
          <input
            type="number"
            value={set.duration || ''}
            onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || null })}
            placeholder="Seg"
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            min="1"
          />
          <span className="text-xs text-gray-500">seg</span>
        </>
      )}

      <input
        type="number"
        value={set.weight || ''}
        onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || null })}
        placeholder="Peso"
        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
        step="0.5"
        min="0"
      />
      <span className="text-xs text-gray-500">kg</span>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          icon={<Trash2 className="w-3 h-3" />}
          className="text-red-500 hover:text-red-700"
        />
      )}
      
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

// Modal de búsqueda de ejercicios
const ExerciseSearchModal = ({ 
  isOpen, 
  onClose, 
  exercises, 
  searchTerm, 
  onSearchChange, 
  onSelectExercise 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Buscar Ejercicios" 
      size="lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o grupo muscular..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {exercises.map(exercise => (
            <div
              key={exercise.id}
              onClick={() => onSelectExercise(exercise)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                  <p className="text-sm text-gray-600 capitalize">{exercise.category}</p>
                </div>
                <Badge variant="secondary">{exercise.equipment}</Badge>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {exercise.muscleGroups?.map((group, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          {exercises.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron ejercicios para "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default WorkoutModal;