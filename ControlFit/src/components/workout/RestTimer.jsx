import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  Play,
  Pause,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  Settings,
  Clock,
  Timer,
  Zap,
  Coffee,
  Dumbbell,
  Activity,
  Plus,
  Minus,
  SkipForward
} from 'lucide-react';

const RestTimer = ({ 
  type = 'rest', // 'rest', 'exercise', 'warmup', 'custom'
  initialTime = 60,
  autoStart = false,
  onComplete,
  onTick,
  onStateChange,
  settings = {},
  className = ''
}) => {
  // Estados del timer
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [originalTime, setOriginalTime] = useState(initialTime);
  const [showSettings, setShowSettings] = useState(false);

  // Configuraciones
  const [timerSettings, setTimerSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    warningTime: 10, // Advertencia en los últimos 10 segundos
    autoAdvance: false, // Avanzar automáticamente al siguiente ejercicio
    visualStyle: 'circular', // 'circular', 'linear', 'numeric'
    ...settings
  });

  // Presets de tiempo comunes
  const timePresets = [
    { label: '30s', value: 30, icon: Zap },
    { label: '45s', value: 45, icon: Zap },
    { label: '1m', value: 60, icon: Timer },
    { label: '90s', value: 90, icon: Timer },
    { label: '2m', value: 120, icon: Coffee },
    { label: '3m', value: 180, icon: Coffee },
    { label: '5m', value: 300, icon: Coffee }
  ];

  // Referencias
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);

  // Efectos
  useEffect(() => {
    setTimeRemaining(initialTime);
    setOriginalTime(initialTime);
    setIsActive(autoStart);
  }, [initialTime, autoStart]);

  useEffect(() => {
    if (isActive && !isPaused) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          
          // Callback de tick
          onTick?.(newTime, originalTime);
          
          // Sonido de advertencia
          if (newTime === timerSettings.warningTime && timerSettings.soundEnabled) {
            playWarningSound();
          }
          
          // Vibración en móviles
          if (newTime <= 3 && newTime > 0 && timerSettings.vibrationEnabled) {
            vibrate(200);
          }
          
          return newTime;
        });
      }, 1000);
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
  }, [isActive, isPaused, originalTime, timerSettings]);

  useEffect(() => {
    if (timeRemaining === 0 && isActive) {
      handleComplete();
    }
  }, [timeRemaining, isActive]);

  // Handlers
  const handleComplete = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    
    // Sonido de finalización
    if (timerSettings.soundEnabled) {
      playCompletionSound();
    }
    
    // Vibración de finalización
    if (timerSettings.vibrationEnabled) {
      vibrate([200, 100, 200]);
    }
    
    onComplete?.();
    onStateChange?.({ isActive: false, timeRemaining: 0, completed: true });
  }, [timerSettings, onComplete, onStateChange]);

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
    onStateChange?.({ isActive: true, isPaused: false, timeRemaining });
  };

  const pause = () => {
    setIsPaused(!isPaused);
    onStateChange?.({ isActive, isPaused: !isPaused, timeRemaining });
  };

  const stop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(originalTime);
    onStateChange?.({ isActive: false, isPaused: false, timeRemaining: originalTime });
  };

  const reset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(originalTime);
    onStateChange?.({ isActive: false, isPaused: false, timeRemaining: originalTime });
  };

  const skip = () => {
    setTimeRemaining(0);
    handleComplete();
  };

  const addTime = (seconds) => {
    setTimeRemaining(prev => prev + seconds);
    setOriginalTime(prev => prev + seconds);
  };

  const setPresetTime = (seconds) => {
    setTimeRemaining(seconds);
    setOriginalTime(seconds);
    setIsActive(false);
    setIsPaused(false);
  };

  // Utilidades
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return originalTime > 0 ? ((originalTime - timeRemaining) / originalTime) * 100 : 0;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 5) return 'text-red-500';
    if (timeRemaining <= timerSettings.warningTime) return 'text-yellow-500';
    return 'text-blue-600';
  };

  const getTimerIcon = () => {
    switch (type) {
      case 'rest': return Coffee;
      case 'exercise': return Dumbbell;
      case 'warmup': return Activity;
      default: return Timer;
    }
  };

  const getTimerLabel = () => {
    switch (type) {
      case 'rest': return 'Descanso';
      case 'exercise': return 'Ejercicio';
      case 'warmup': return 'Calentamiento';
      default: return 'Timer';
    }
  };

  const playWarningSound = () => {
    // Implementar sonido de advertencia
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const playCompletionSound = () => {
    // Implementar sonido de finalización
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const vibrate = (pattern) => {
    if ('vibrate' in navigator && timerSettings.vibrationEnabled) {
      navigator.vibrate(pattern);
    }
  };

  // Renderizado del timer circular
  const renderCircularTimer = () => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (getProgress() / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90" width="200" height="200">
          {/* Círculo de fondo */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Círculo de progreso */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-linear ${
              timeRemaining <= 5 ? 'text-red-500' : 
              timeRemaining <= timerSettings.warningTime ? 'text-yellow-500' : 'text-blue-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        {/* Tiempo en el centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold ${getTimeColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {getTimerLabel()}
          </div>
        </div>
      </div>
    );
  };

  // Renderizado del timer linear
  const renderLinearTimer = () => {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{getTimerLabel()}</span>
          <span className="text-sm text-gray-600">{Math.round(getProgress())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className={`h-4 rounded-full transition-all duration-1000 ease-linear ${
              timeRemaining <= 5 ? 'bg-red-500' : 
              timeRemaining <= timerSettings.warningTime ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <div className={`text-6xl font-bold text-center ${getTimeColor()}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>
    );
  };

  // Renderizado del timer numérico
  const renderNumericTimer = () => {
    return (
      <div className="text-center">
        <div className="mb-4">
          <Badge className="bg-gray-100 text-gray-800">
            {getTimerLabel()}
          </Badge>
        </div>
        <div className={`text-8xl font-bold ${getTimeColor()}`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="text-lg text-gray-500 mt-2">
          de {formatTime(originalTime)}
        </div>
      </div>
    );
  };

  const renderTimer = () => {
    switch (timerSettings.visualStyle) {
      case 'circular':
        return renderCircularTimer();
      case 'linear':
        return renderLinearTimer();
      case 'numeric':
        return renderNumericTimer();
      default:
        return renderCircularTimer();
    }
  };

  const TimerIcon = getTimerIcon();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Audio para sonidos */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/timer-beep.mp3" type="audio/mpeg" />
      </audio>

      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TimerIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Timer de {getTimerLabel()}
            </h3>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            icon={<Settings className="w-4 h-4" />}
          />
        </div>

        {/* Timer principal */}
        <div className="mb-8">
          {renderTimer()}
        </div>

        {/* Controles principales */}
        <div className="flex justify-center space-x-3 mb-6">
          {!isActive ? (
            <Button
              onClick={start}
              className="px-6 py-3"
              icon={<Play className="w-5 h-5" />}
            >
              Iniciar
            </Button>
          ) : (
            <Button
              onClick={pause}
              variant="outline"
              className="px-6 py-3"
              icon={isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            >
              {isPaused ? 'Continuar' : 'Pausar'}
            </Button>
          )}
          
          <Button
            onClick={reset}
            variant="outline"
            className="px-6 py-3"
            icon={<RotateCcw className="w-5 h-5" />}
          >
            Reiniciar
          </Button>
          
          <Button
            onClick={stop}
            variant="outline"
            className="px-6 py-3"
            icon={<Square className="w-5 h-5" />}
          >
            Detener
          </Button>
          
          <Button
            onClick={skip}
            variant="outline"
            className="px-6 py-3"
            icon={<SkipForward className="w-5 h-5" />}
          >
            Omitir
          </Button>
        </div>

        {/* Controles de tiempo rápido */}
        {isActive && (
          <div className="flex justify-center space-x-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addTime(-15)}
              icon={<Minus className="w-3 h-3" />}
              disabled={timeRemaining <= 15}
            >
              -15s
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addTime(15)}
              icon={<Plus className="w-3 h-3" />}
            >
              +15s
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addTime(30)}
              icon={<Plus className="w-3 h-3" />}
            >
              +30s
            </Button>
          </div>
        )}

        {/* Presets de tiempo */}
        {!isActive && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
              Tiempos predefinidos
            </h4>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {timePresets.map((preset) => {
                const PresetIcon = preset.icon;
                return (
                  <Button
                    key={preset.value}
                    size="sm"
                    variant={originalTime === preset.value ? "default" : "outline"}
                    onClick={() => setPresetTime(preset.value)}
                    className="flex flex-col items-center py-3 h-auto"
                  >
                    <PresetIcon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{preset.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Configuraciones */}
        {showSettings && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Configuraciones
            </h4>
            
            <div className="space-y-4">
              {/* Sonido */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {timerSettings.soundEnabled ? 
                    <Volume2 className="w-4 h-4 text-gray-500" /> : 
                    <VolumeX className="w-4 h-4 text-gray-500" />
                  }
                  <span className="text-sm text-gray-700">Sonido</span>
                </div>
                <Button
                  size="sm"
                  variant={timerSettings.soundEnabled ? "default" : "outline"}
                  onClick={() => setTimerSettings(prev => ({
                    ...prev,
                    soundEnabled: !prev.soundEnabled
                  }))}
                >
                  {timerSettings.soundEnabled ? 'Activado' : 'Desactivado'}
                </Button>
              </div>

              {/* Vibración */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Vibración</span>
                <Button
                  size="sm"
                  variant={timerSettings.vibrationEnabled ? "default" : "outline"}
                  onClick={() => setTimerSettings(prev => ({
                    ...prev,
                    vibrationEnabled: !prev.vibrationEnabled
                  }))}
                >
                  {timerSettings.vibrationEnabled ? 'Activado' : 'Desactivado'}
                </Button>
              </div>

              {/* Estilo visual */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Estilo</span>
                <select
                  value={timerSettings.visualStyle}
                  onChange={(e) => setTimerSettings(prev => ({
                    ...prev,
                    visualStyle: e.target.value
                  }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="circular">Circular</option>
                  <option value="linear">Lineal</option>
                  <option value="numeric">Numérico</option>
                </select>
              </div>

              {/* Tiempo de advertencia */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Advertencia (seg)</span>
                <input
                  type="number"
                  value={timerSettings.warningTime}
                  onChange={(e) => setTimerSettings(prev => ({
                    ...prev,
                    warningTime: parseInt(e.target.value) || 10
                  }))}
                  className="w-16 text-sm border border-gray-300 rounded px-2 py-1 text-center"
                  min="5"
                  max="30"
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RestTimer;