import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Timer,
  TrendingUp,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const SetTracker = ({ 
  exercise,
  currentSetIndex = 0,
  onSetComplete,
  onSetFailed,
  onSetUpdate,
  onNextSet,
  onPreviousSet,
  onRestTimerComplete,
  onSkipRest,
  settings = {},
  className = ''
}) => {
  // Estados del componente
  const [restTimer, setRestTimer] = useState({
    isActive: false,
    timeRemaining: 0,
    initialTime: 0
  });
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);
  const [currentSet, setCurrentSet] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [rpeInput, setRpeInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [notes, setNotes] = useState('');

  // Referencias
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Obtener la serie actual
  useEffect(() => {
    if (exercise?.sets && exercise.sets[currentSetIndex]) {
      const set = exercise.sets[currentSetIndex];
      setCurrentSet(set);
      setWeightInput(set.actualWeight || set.weight || '');
      setRepsInput(set.actualReps || set.reps || '');
      setDurationInput(set.actualDuration || set.duration || '');
      setRpeInput(set.rpe || '');
      setNotes(set.notes || '');
    }
  }, [exercise, currentSetIndex]);

  // Timer de descanso
  useEffect(() => {
    if (restTimer.isActive && restTimer.timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setRestTimer(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (restTimer.isActive && restTimer.timeRemaining === 0) {
      handleRestComplete();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [restTimer.isActive, restTimer.timeRemaining]);

  // Actualizar datos de la serie
  const updateSetData = (updates) => {
    const updatedSet = { ...currentSet, ...updates };
    setCurrentSet(updatedSet);
    onSetUpdate?.(updatedSet);
  };

  // Iniciar timer de descanso
  const startRestTimer = (duration = null) => {
    const restTime = duration || exercise?.restTime || 60;
    setRestTimer({
      isActive: true,
      timeRemaining: restTime,
      initialTime: restTime
    });
  };

  // Pausar/reanudar timer
  const toggleRestTimer = () => {
    setRestTimer(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  // Resetear timer
  const resetRestTimer = () => {
    setRestTimer({
      isActive: false,
      timeRemaining: 0,
      initialTime: 0
    });
  };

  // Completar descanso
  const handleRestComplete = () => {
    if (soundEnabled) {
      // Reproducir sonido de notificación
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Manejar error de audio silenciosamente
        });
      }
    }
    setRestTimer(prev => ({ ...prev, isActive: false }));
    onRestTimerComplete?.();
  };

  // Completar serie
  const handleSetComplete = () => {
    const setData = {
      ...currentSet,
      actualWeight: parseFloat(weightInput) || null,
      actualReps: parseInt(repsInput) || null,
      actualDuration: parseInt(durationInput) || null,
      rpe: parseInt(rpeInput) || null,
      notes: notes,
      completed: true,
      failed: false,
      endTime: new Date().toISOString()
    };

    updateSetData(setData);
    onSetComplete?.(setData);
    
    // Iniciar timer de descanso automáticamente si no es la última serie
    if (currentSetIndex < (exercise?.sets?.length - 1)) {
      startRestTimer();
    }
  };

  // Fallar serie
  const handleSetFailed = () => {
    const setData = {
      ...currentSet,
      actualWeight: parseFloat(weightInput) || null,
      actualReps: parseInt(repsInput) || null,
      actualDuration: parseInt(durationInput) || null,
      rpe: parseInt(rpeInput) || null,
      notes: notes,
      completed: false,
      failed: true,
      endTime: new Date().toISOString()
    };

    updateSetData(setData);
    onSetFailed?.(setData);
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular volumen
  const calculateVolume = () => {
    const weight = parseFloat(weightInput) || 0;
    const reps = parseInt(repsInput) || 0;
    return weight * reps;
  };

  // Obtener color del timer
  const getTimerColor = () => {
    const percentage = (restTimer.timeRemaining / restTimer.initialTime) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Obtener color del RPE
  const getRPEColor = (rpe) => {
    if (rpe <= 3) return 'bg-green-100 text-green-800';
    if (rpe <= 6) return 'bg-yellow-100 text-yellow-800';
    if (rpe <= 8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (!exercise || !currentSet) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay ejercicio activo</p>
      </Card>
    );
  }

  const isTimedExercise = currentSet.type === 'timed';
  const volume = calculateVolume();
  const progress = ((currentSetIndex + 1) / exercise.sets.length) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Audio para notificaciones */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/timer-complete.mp3" type="audio/mpeg" />
      </audio>

      {/* Header del ejercicio */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {exercise.name}
            </h3>
            <p className="text-sm text-gray-600">
              Serie {currentSetIndex + 1} de {exercise.sets.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={currentSet.type === 'normal' ? 'bg-blue-100 text-blue-800' : 
                             currentSet.type === 'warmup' ? 'bg-green-100 text-green-800' :
                             'bg-purple-100 text-purple-800'}>
              {currentSet.type === 'normal' ? 'Normal' :
               currentSet.type === 'warmup' ? 'Calentamiento' :
               currentSet.type === 'dropset' ? 'Drop Set' :
               currentSet.type === 'rest_pause' ? 'Rest-Pause' :
               'Por Tiempo'}
            </Badge>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              icon={<Settings className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progreso del ejercicio</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Navegación entre series */}
        <div className="flex justify-between items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={onPreviousSet}
            disabled={currentSetIndex === 0}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-600">
            {exercise.sets.filter(s => s.completed).length} / {exercise.sets.length} completadas
          </span>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onNextSet}
            disabled={currentSetIndex === exercise.sets.length - 1}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            Siguiente
          </Button>
        </div>
      </Card>

      {/* Timer de descanso */}
      {restTimer.isActive && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Tiempo de descanso
              </span>
            </div>
            
            <div className={`text-3xl font-bold mb-3 ${getTimerColor()}`}>
              {formatTime(restTimer.timeRemaining)}
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleRestTimer}
                icon={restTimer.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {restTimer.isActive ? 'Pausar' : 'Continuar'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={resetRestTimer}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Resetear
              </Button>
              
              <Button
                size="sm"
                onClick={() => {
                  resetRestTimer();
                  onSkipRest?.();
                }}
              >
                Omitir
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Entrada de datos de la serie */}
      <Card className="p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Registrar Serie
        </h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Peso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={currentSet.weight || "0"}
              step="0.5"
            />
            {currentSet.weight && (
              <div className="text-xs text-gray-500 mt-1">
                Objetivo: {currentSet.weight} kg
              </div>
            )}
          </div>

          {/* Repeticiones o Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isTimedExercise ? 'Duración (seg)' : 'Repeticiones'}
            </label>
            <input
              type="number"
              value={isTimedExercise ? durationInput : repsInput}
              onChange={(e) => isTimedExercise ? 
                setDurationInput(e.target.value) : 
                setRepsInput(e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isTimedExercise ? 
                (currentSet.duration || "0") : 
                (currentSet.reps || "0")
              }
            />
            {(currentSet.reps || currentSet.duration) && (
              <div className="text-xs text-gray-500 mt-1">
                Objetivo: {isTimedExercise ? 
                  `${currentSet.duration} seg` : 
                  `${currentSet.reps} reps`
                }
              </div>
            )}
          </div>
        </div>

        {/* RPE */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RPE (Esfuerzo Percibido)
          </label>
          <div className="flex space-x-1">
            {[...Array(10)].map((_, i) => {
              const rpeValue = i + 1;
              const isSelected = parseInt(rpeInput) === rpeValue;
              return (
                <button
                  key={rpeValue}
                  onClick={() => setRpeInput(rpeValue.toString())}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rpeValue}
                </button>
              );
            })}
          </div>
          {rpeInput && (
            <div className="mt-2">
              <Badge className={getRPEColor(parseInt(rpeInput))}>
                {parseInt(rpeInput) <= 3 ? 'Muy Fácil' :
                 parseInt(rpeInput) <= 6 ? 'Moderado' :
                 parseInt(rpeInput) <= 8 ? 'Difícil' : 'Máximo'}
              </Badge>
            </div>
          )}
        </div>

        {/* Volumen calculado */}
        {volume > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Volumen de esta serie:</span>
              <span className="font-medium text-gray-900">{volume.toFixed(1)} kg</span>
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
            placeholder="Observaciones sobre la serie..."
          />
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-2">
          <Button
            onClick={handleSetComplete}
            className="flex-1 bg-green-600 hover:bg-green-700"
            icon={<CheckCircle className="w-4 h-4" />}
            disabled={!weightInput && !repsInput && !durationInput}
          >
            Completar Serie
          </Button>
          
          <Button
            onClick={handleSetFailed}
            variant="destructive"
            className="flex-1"
            icon={<XCircle className="w-4 h-4" />}
          >
            Falló
          </Button>
        </div>
      </Card>

      {/* Configuraciones */}
      {showSettings && (
        <Card className="p-4 bg-gray-50">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Configuraciones
          </h4>
          
          <div className="space-y-3">
            {/* Sonido */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Sonido de notificaciones</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSoundEnabled(!soundEnabled)}
                icon={soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              >
                {soundEnabled ? 'Activado' : 'Desactivado'}
              </Button>
            </div>

            {/* Timer personalizado */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Tiempo de descanso personalizado</span>
              <div className="flex space-x-1">
                {[30, 60, 90, 120, 180].map(time => (
                  <Button
                    key={time}
                    size="sm"
                    variant="outline"
                    onClick={() => startRestTimer(time)}
                    className="text-xs"
                  >
                    {time}s
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Historial de la serie anterior */}
      {currentSetIndex > 0 && exercise.sets[currentSetIndex - 1].completed && (
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-800">
              Serie anterior: {exercise.sets[currentSetIndex - 1].actualWeight || exercise.sets[currentSetIndex - 1].weight}kg × {' '}
              {exercise.sets[currentSetIndex - 1].actualReps || exercise.sets[currentSetIndex - 1].reps} reps
              {exercise.sets[currentSetIndex - 1].rpe && ` (RPE: ${exercise.sets[currentSetIndex - 1].rpe})`}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SetTracker;