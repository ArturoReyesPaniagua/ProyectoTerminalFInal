import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  ChevronDown,
  ChevronRight,
  Clock,
  Weight,
  RotateCcw,
  Target,
  Info,
  Edit,
  Trash2,
  Plus,
  GripVertical,
  CheckCircle,
  XCircle,
  Timer,
  Activity,
  Flame,
  MessageSquare
} from 'lucide-react';

const ExerciseList = ({ 
  exercises = [], 
  mode = 'view', // 'view' | 'edit' | 'workout'
  currentExerciseIndex = null,
  onExerciseUpdate,
  onExerciseRemove,
  onExerciseAdd,
  onSetUpdate,
  onSetAdd,
  onSetRemove,
  className = ''
}) => {
  const [expandedExercises, setExpandedExercises] = useState(new Set());
  const [editingSet, setEditingSet] = useState(null);

  const toggleExercise = (exerciseIndex) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseIndex)) {
      newExpanded.delete(exerciseIndex);
    } else {
      newExpanded.add(exerciseIndex);
    }
    setExpandedExercises(newExpanded);
  };

  const isExerciseExpanded = (exerciseIndex) => {
    return expandedExercises.has(exerciseIndex);
  };

  const getSetTypeColor = (type) => {
    const colors = {
      normal: 'bg-blue-100 text-blue-800',
      warmup: 'bg-green-100 text-green-800',
      dropset: 'bg-purple-100 text-purple-800',
      rest_pause: 'bg-orange-100 text-orange-800',
      timed: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || colors.normal;
  };

  const getSetTypeLabel = (type) => {
    const labels = {
      normal: 'Normal',
      warmup: 'Calentamiento',
      dropset: 'Drop Set',
      rest_pause: 'Rest-Pause',
      timed: 'Por Tiempo'
    };
    return labels[type] || 'Normal';
  };

  const formatRestTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const calculateVolume = (weight, reps) => {
    if (!weight || !reps) return 0;
    return weight * reps;
  };

  const getExerciseProgress = (exercise) => {
    if (!exercise.sets) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = exercise.sets.filter(set => set.completed).length;
    const total = exercise.sets.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  const getTotalVolume = (exercise) => {
    if (!exercise.sets) return 0;
    return exercise.sets.reduce((total, set) => {
      const weight = set.actualWeight || set.weight || 0;
      const reps = set.actualReps || set.reps || 0;
      return total + (weight * reps);
    }, 0);
  };

  const renderSetRow = (set, setIndex, exerciseIndex) => {
    const isEditing = editingSet === `${exerciseIndex}-${setIndex}`;
    const isWorkoutMode = mode === 'workout';
    const volume = calculateVolume(
      set.actualWeight || set.weight,
      set.actualReps || set.reps
    );

    return (
      <div 
        key={setIndex}
        className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
          set.completed ? 'bg-green-50 border-green-200' : 
          set.failed ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
        }`}
      >
        {/* Número de serie */}
        <div className="w-8 text-center">
          <span className="text-sm font-medium text-gray-600">
            {setIndex + 1}
          </span>
        </div>

        {/* Tipo de serie */}
        <div className="w-20">
          <Badge size="sm" className={getSetTypeColor(set.type)}>
            {getSetTypeLabel(set.type)}
          </Badge>
        </div>

        {/* Valores objetivo vs realizados */}
        <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
          {/* Peso */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Peso</div>
            {isWorkoutMode ? (
              <div>
                <div className="text-gray-400">{set.weight || '-'}</div>
                <input
                  type="number"
                  value={set.actualWeight || ''}
                  onChange={(e) => onSetUpdate?.(exerciseIndex, setIndex, {
                    actualWeight: parseFloat(e.target.value) || null
                  })}
                  className="w-full text-center border rounded px-1 py-0.5 text-xs"
                  placeholder="kg"
                  step="0.5"
                />
              </div>
            ) : (
              <div className="font-medium">
                {set.actualWeight || set.weight || '-'} kg
              </div>
            )}
          </div>

          {/* Repeticiones o Duración */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              {set.type === 'timed' ? 'Duración' : 'Reps'}
            </div>
            {isWorkoutMode ? (
              <div>
                <div className="text-gray-400">
                  {set.type === 'timed' ? 
                    (set.duration ? `${set.duration}s` : '-') : 
                    (set.reps || '-')
                  }
                </div>
                <input
                  type="number"
                  value={set.type === 'timed' ? (set.actualDuration || '') : (set.actualReps || '')}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || null;
                    const update = set.type === 'timed' ? 
                      { actualDuration: value } : 
                      { actualReps: value };
                    onSetUpdate?.(exerciseIndex, setIndex, update);
                  }}
                  className="w-full text-center border rounded px-1 py-0.5 text-xs"
                  placeholder={set.type === 'timed' ? 's' : 'reps'}
                />
              </div>
            ) : (
              <div className="font-medium">
                {set.type === 'timed' ? 
                  `${set.actualDuration || set.duration || '-'}s` :
                  `${set.actualReps || set.reps || '-'}`
                }
              </div>
            )}
          </div>

          {/* RPE */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">RPE</div>
            {isWorkoutMode ? (
              <select
                value={set.rpe || ''}
                onChange={(e) => onSetUpdate?.(exerciseIndex, setIndex, {
                  rpe: parseInt(e.target.value) || null
                })}
                className="w-full text-center border rounded px-1 py-0.5 text-xs"
              >
                <option value="">-</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            ) : (
              <div className="font-medium">
                {set.rpe || '-'}
              </div>
            )}
          </div>
        </div>

        {/* Volumen */}
        {volume > 0 && (
          <div className="w-16 text-right text-xs text-gray-500">
            {volume.toFixed(1)} kg
          </div>
        )}

        {/* Estado y acciones */}
        <div className="flex items-center space-x-1">
          {isWorkoutMode && (
            <>
              <Button
                size="sm"
                variant={set.completed ? "default" : "outline"}
                onClick={() => onSetUpdate?.(exerciseIndex, setIndex, {
                  completed: !set.completed,
                  failed: false
                })}
                icon={<CheckCircle className="w-3 h-3" />}
                className={set.completed ? "bg-green-500 text-white" : ""}
              />
              <Button
                size="sm"
                variant={set.failed ? "destructive" : "outline"}
                onClick={() => onSetUpdate?.(exerciseIndex, setIndex, {
                  failed: !set.failed,
                  completed: false
                })}
                icon={<XCircle className="w-3 h-3" />}
              />
            </>
          )}
          
          {mode === 'edit' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSetRemove?.(exerciseIndex, setIndex)}
              icon={<Trash2 className="w-3 h-3" />}
              className="text-red-500 hover:text-red-700"
            />
          )}
        </div>

        {/* Notas de la serie */}
        {set.notes && (
          <div className="w-full mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded">
            <MessageSquare className="w-3 h-3 inline mr-1" />
            {set.notes}
          </div>
        )}
      </div>
    );
  };

  const renderExercise = (exercise, exerciseIndex) => {
    const isExpanded = isExerciseExpanded(exerciseIndex);
    const isCurrent = currentExerciseIndex === exerciseIndex;
    const progress = getExerciseProgress(exercise);
    const totalVolume = getTotalVolume(exercise);

    return (
      <Card 
        key={exercise.exerciseId || exerciseIndex}
        className={`transition-all duration-200 ${
          isCurrent ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
      >
        {/* Header del ejercicio */}
        <div 
          className="p-4 cursor-pointer"
          onClick={() => toggleExercise(exerciseIndex)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {mode === 'edit' && (
                <GripVertical className="w-4 h-4 text-gray-400" />
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900">
                    {exerciseIndex + 1}. {exercise.name}
                  </h4>
                  {isCurrent && (
                    <Badge className="bg-blue-500 text-white">
                      Actual
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    {exercise.sets?.length || 0} series
                  </span>
                  
                  {exercise.restTime && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatRestTime(exercise.restTime)}
                    </span>
                  )}
                  
                  {totalVolume > 0 && (
                    <span className="flex items-center">
                      <Weight className="w-3 h-3 mr-1" />
                      {totalVolume.toFixed(0)} kg
                    </span>
                  )}
                </div>
                
                {/* Progreso del ejercicio */}
                {mode === 'workout' && progress.total > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{progress.completed}/{progress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Grupos musculares */}
              {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                <div className="hidden sm:flex space-x-1">
                  {exercise.muscleGroups.slice(0, 2).map((group, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {group}
                    </Badge>
                  ))}
                </div>
              )}

              {mode === 'edit' && (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // onExerciseEdit?.(exerciseIndex);
                    }}
                    icon={<Edit className="w-3 h-3" />}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExerciseRemove?.(exerciseIndex);
                    }}
                    icon={<Trash2 className="w-3 h-3" />}
                    className="text-red-500 hover:text-red-700"
                  />
                </div>
              )}

              <Button
                size="sm"
                variant="ghost"
                icon={isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Contenido expandido */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Notas del ejercicio */}
            {exercise.notes && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800 mb-1">
                      Notas
                    </div>
                    <div className="text-sm text-yellow-700">
                      {exercise.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header de series */}
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-700">Series</h5>
              {mode === 'edit' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSetAdd?.(exerciseIndex)}
                  icon={<Plus className="w-3 h-3" />}
                >
                  Agregar Serie
                </Button>
              )}
            </div>

            {/* Lista de series */}
            <div className="space-y-2">
              {exercise.sets?.map((set, setIndex) => 
                renderSetRow(set, setIndex, exerciseIndex)
              )}
              
              {(!exercise.sets || exercise.sets.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No hay series configuradas
                </div>
              )}
            </div>

            {/* Información adicional */}
            {exercise.equipment && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Equipamiento:</span> {exercise.equipment}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  if (!exercises || exercises.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay ejercicios configurados</p>
        {mode === 'edit' && onExerciseAdd && (
          <Button
            className="mt-4"
            onClick={onExerciseAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            Agregar Ejercicio
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {exercises.map((exercise, index) => renderExercise(exercise, index))}
      
      {mode === 'edit' && onExerciseAdd && (
        <Card className="border-dashed border-2 border-gray-300">
          <Button
            variant="ghost"
            className="w-full h-16 text-gray-500"
            onClick={onExerciseAdd}
            icon={<Plus className="w-5 h-5" />}
          >
            Agregar Ejercicio
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ExerciseList;