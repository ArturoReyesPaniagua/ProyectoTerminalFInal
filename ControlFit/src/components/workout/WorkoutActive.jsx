
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import SetTracker from './SetTracker';
import ExerciseList from './ExerciseList';
import RestTimer from './RestTimer';
import { 
  Play,
  Pause,
  Square,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Activity,
  BarChart3,
  MessageSquare,
  Settings,
  Home,
  AlertTriangle,
  Trophy,
  Zap,
  Timer,
  Edit,
  Save,
  X
} from 'lucide-react';

const WorkoutActive = ({ 
  workout,
  onUpdate,
  onComplete,
  onAbandon,
  onPause,
  onResume,
  className = ''
}) => {
  // Estados locales
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(workout?.currentExerciseIndex || 0);
  const [currentSetIndex, setCurrentSetIndex] = useState(workout?.currentSetIndex || 0);
  const [isPaused, setIsPaused] = useState(workout?.isPaused || false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerType, setTimerType] = useState('rest');
  const [showNotes, setShowNotes] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState(workout?.notes || '');
  const [sessionMetrics, setSessionMetrics] = useState({
    startTime: workout?.startTime || new Date(),
    totalVolume: 0,
    completedSets: 0,
    totalSets: 0,
    exercisesCompleted: 0,
    personalRecords: []
  });

  // Referencias
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // Calcular métricas en tiempo real
  useEffect(() => {
    if (workout?.exercises) {
      const metrics = calculateMetrics(workout.exercises);
      setSessionMetrics(prev => ({ ...prev, ...metrics }));
    }
  }, [workout?.exercises, currentExerciseIndex, currentSetIndex]);

  // Timer para actualizar duración
  useEffect(() => {
    if (!isPaused && workout?.startTime) {
      intervalRef.current = setInterval(() => {
        setSessionMetrics(prev => ({
          ...prev,
          duration: Math.floor((new Date() - new Date(workout.startTime)) / 60000)
        }));
      }, 60000); // Actualizar cada minuto
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, workout?.startTime]);

  // Funciones de cálculo
  const calculateMetrics = (exercises) => {
    let totalVolume = 0;
    let completedSets = 0;
    let totalSets = 0;
    let exercisesCompleted = 0;

    exercises.forEach(exercise => {
      const exerciseCompletedSets = exercise.sets?.filter(set => set.completed)?.length || 0;
      const exerciseTotalSets = exercise.sets?.length || 0;
      
      completedSets += exerciseCompletedSets;
      totalSets += exerciseTotalSets;
      
      if (exerciseCompletedSets === exerciseTotalSets && exerciseTotalSets > 0) {
        exercisesCompleted++;
      }

      exercise.sets?.forEach(set => {
        if (set.completed && set.actualWeight && set.actualReps) {
          totalVolume += set.actualWeight * set.actualReps;
        }
      });
    });

    return {
      totalVolume,
      completedSets,
      totalSets,
      exercisesCompleted,
      completionRate: totalSets > 0 ? (completedSets / totalSets) * 100 : 0
    };
  };

  const getCurrentExercise = () => {
    return workout?.exercises?.[currentExerciseIndex] || null;
  };

  const getCurrentSet = () => {
    const exercise = getCurrentExercise();
    return exercise?.sets?.[currentSetIndex] || null;
  };

  const getElapsedTime = () => {
    if (!workout?.startTime) return 0;
    return Math.floor((new Date() - new Date(workout.startTime)) / 60000);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Handlers de navegación
  const moveToNextSet = () => {
    const exercise = getCurrentExercise();
    if (!exercise) return;

    if (currentSetIndex < exercise.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      updateWorkout({ currentSetIndex: currentSetIndex + 1 });
    } else if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      updateWorkout({ 
        currentExerciseIndex: currentExerciseIndex + 1, 
        currentSetIndex: 0 
      });
    }
  };

  const moveToPreviousSet = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
      updateWorkout({ currentSetIndex: currentSetIndex - 1 });
    } else if (currentExerciseIndex > 0) {
      const previousExercise = workout.exercises[currentExerciseIndex - 1];
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSetIndex(previousExercise.sets.length - 1);
      updateWorkout({ 
        currentExerciseIndex: currentExerciseIndex - 1, 
        currentSetIndex: previousExercise.sets.length - 1 
      });
    }
  };

  const jumpToExercise = (exerciseIndex) => {
    setCurrentExerciseIndex(exerciseIndex);
    setCurrentSetIndex(0);
    updateWorkout({ 
      currentExerciseIndex: exerciseIndex, 
      currentSetIndex: 0 
    });
  };

  // Handlers de entrenamiento
  const updateWorkout = (updates) => {
    onUpdate?.({ ...workout, ...updates });
  };

  const handlePauseResume = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    if (newPausedState) {
      onPause?.();
    } else {
      onResume?.();
    }
    
    updateWorkout({ isPaused: newPausedState });
  };

  const handleSetComplete = (setData) => {
    const exercise = getCurrentExercise();
    const updatedSets = [...exercise.sets];
    updatedSets[currentSetIndex] = setData;
    
    const updatedExercise = { ...exercise, sets: updatedSets };
    const updatedExercises = [...workout.exercises];
    updatedExercises[currentExerciseIndex] = updatedExercise;
    
    updateWorkout({ exercises: updatedExercises });
    
    // Mostrar timer de descanso si no es la última serie
    if (currentSetIndex < exercise.sets.length - 1) {
      setTimerType('rest');
      setShowTimer(true);
    } else {
      // Avanzar al siguiente ejercicio automáticamente
      setTimeout(() => {
        moveToNextSet();
      }, 1000);
    }
  };

  const handleSetUpdate = (setData) => {
    const exercise = getCurrentExercise();
    const updatedSets = [...exercise.sets];
    updatedSets[currentSetIndex] = { ...updatedSets[currentSetIndex], ...setData };
    
    const updatedExercise = { ...exercise, sets: updatedSets };
    const updatedExercises = [...workout.exercises];
    updatedExercises[currentExerciseIndex] = updatedExercise;
    
    updateWorkout({ exercises: updatedExercises });
  };

  const handleRestTimerComplete = () => {
    setShowTimer(false);
    moveToNextSet();
  };

  const handleFinishWorkout = () => {
    const finalWorkout = {
      ...workout,
      endTime: new Date(),
      completed: true,
      notes: workoutNotes,
      metrics: sessionMetrics
    };
    
    onComplete?.(finalWorkout);
    setShowFinishModal(false);
    navigate('/workouts');
  };

  const handleAbandonWorkout = () => {
    const abandonedWorkout = {
      ...workout,
      endTime: new Date(),
      abandoned: true,
      notes: workoutNotes,
      metrics: sessionMetrics
    };
    
    onAbandon?.(abandonedWorkout);
    setShowAbandonModal(false);
    navigate('/workouts');
  };

  // Verificar si el entrenamiento está completo
  const isWorkoutComplete = () => {
    return sessionMetrics.completedSets === sessionMetrics.totalSets && sessionMetrics.totalSets > 0;
  };

  const currentExercise = getCurrentExercise();
  const currentSet = getCurrentSet();
  const progress = sessionMetrics.totalSets > 0 ? (sessionMetrics.completedSets / sessionMetrics.totalSets) * 100 : 0;

  if (!workout || !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No hay entrenamiento activo
          </h2>
          <p className="text-gray-600 mb-4">
            Inicia un entrenamiento para usar esta interfaz
          </p>
          <Button onClick={() => navigate('/workouts')}>
            Ir a Entrenamientos
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header fijo */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/workouts')}
                icon={<Home className="w-4 h-4" />}
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {workout.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {formatDuration(getElapsedTime())} • {Math.round(progress)}% completado
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNotes(true)}
                icon={<MessageSquare className="w-4 h-4" />}
              />
              
              <Button
                size="sm"
                variant={isPaused ? "default" : "outline"}
                onClick={handlePauseResume}
                icon={isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              >
                {isPaused ? 'Continuar' : 'Pausar'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAbandonModal(true)}
                icon={<X className="w-4 h-4" />}
                className="text-red-600 hover:text-red-700"
              >
                Abandonar
              </Button>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progreso general</span>
              <span>{sessionMetrics.completedSets}/{sessionMetrics.totalSets} series</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 space-y-6">
        {/* Métricas en tiempo real */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600">Duración</div>
                <div className="text-lg font-semibold">{formatDuration(getElapsedTime())}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm text-gray-600">Volumen</div>
                <div className="text-lg font-semibold">{sessionMetrics.totalVolume.toFixed(0)} kg</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-600">Series</div>
                <div className="text-lg font-semibold">{sessionMetrics.completedSets}/{sessionMetrics.totalSets}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm text-gray-600">Ejercicios</div>
                <div className="text-lg font-semibold">{sessionMetrics.exercisesCompleted}/{workout.exercises.length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Estado de pausa */}
        {isPaused && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center space-x-2">
              <Pause className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">Entrenamiento en pausa</div>
                <div className="text-sm text-yellow-600">Toca "Continuar" para reanudar</div>
              </div>
            </div>
          </Card>
        )}

        {/* Timer de descanso */}
        {showTimer && (
          <RestTimer
            type={timerType}
            initialTime={currentExercise.restTime || 60}
            autoStart={true}
            onComplete={handleRestTimerComplete}
            onStateChange={(state) => {
              if (!state.isActive) {
                setShowTimer(false);
              }
            }}
          />
        )}

        {/* Set Tracker */}
        <SetTracker
          exercise={currentExercise}
          currentSetIndex={currentSetIndex}
          onSetComplete={handleSetComplete}
          onSetUpdate={handleSetUpdate}
          onNextSet={moveToNextSet}
          onPreviousSet={moveToPreviousSet}
          onRestTimerComplete={handleRestTimerComplete}
          onSkipRest={() => setShowTimer(false)}
        />

        {/* Navegación entre ejercicios */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ejercicios</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => jumpToExercise(Math.max(0, currentExerciseIndex - 1))}
                disabled={currentExerciseIndex === 0}
                icon={<ChevronLeft className="w-4 h-4" />}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => jumpToExercise(Math.min(workout.exercises.length - 1, currentExerciseIndex + 1))}
                disabled={currentExerciseIndex === workout.exercises.length - 1}
                icon={<ChevronRight className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {workout.exercises.map((exercise, index) => {
              const exerciseProgress = calculateMetrics([exercise]);
              const isCurrent = index === currentExerciseIndex;
              const isCompleted = exerciseProgress.completedSets === exerciseProgress.totalSets;

              return (
                <button
                  key={index}
                  onClick={() => jumpToExercise(index)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    isCurrent 
                      ? 'bg-blue-50 border-blue-200 text-blue-900' 
                      : isCompleted
                        ? 'bg-green-50 border-green-200 text-green-900'
                        : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{exercise.name}</div>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {exerciseProgress.completedSets}/{exerciseProgress.totalSets} series
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Botón de finalizar */}
        {isWorkoutComplete() && (
          <Card className="p-6 bg-green-50 border-green-200 text-center">
            <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ¡Entrenamiento Completado!
            </h3>
            <p className="text-green-700 mb-4">
              Has completado todas las series. ¡Excelente trabajo!
            </p>
            <Button
              onClick={() => setShowFinishModal(true)}
              className="bg-green-600 hover:bg-green-700"
              icon={<CheckCircle className="w-5 h-5" />}
            >
              Finalizar Entrenamiento
            </Button>
          </Card>
        )}
      </div>

      {/* Modal de notas */}
      <Modal
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        title="Notas del Entrenamiento"
        size="md"
      >
        <div className="space-y-4">
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="Escribe observaciones sobre este entrenamiento..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowNotes(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                updateWorkout({ notes: workoutNotes });
                setShowNotes(false);
              }}
              icon={<Save className="w-4 h-4" />}
            >
              Guardar Notas
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de finalizar */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="Finalizar Entrenamiento"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Entrenamiento Completado!
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Duración:</span>
              <span className="font-medium">{formatDuration(getElapsedTime())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volumen total:</span>
              <span className="font-medium">{sessionMetrics.totalVolume.toFixed(0)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Series completadas:</span>
              <span className="font-medium">{sessionMetrics.completedSets}/{sessionMetrics.totalSets}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFinishModal(false)}
            >
              Continuar Entrenando
            </Button>
            <Button
              onClick={handleFinishWorkout}
              className="bg-green-600 hover:bg-green-700"
            >
              Finalizar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de abandonar */}
      <Modal
        isOpen={showAbandonModal}
        onClose={() => setShowAbandonModal(false)}
        title="Abandonar Entrenamiento"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Estás seguro?
            </h3>
            <p className="text-gray-600">
              Se guardará tu progreso actual, pero el entrenamiento se marcará como incompleto.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAbandonModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAbandonWorkout}
              variant="destructive"
            >
              Abandonar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkoutActive;