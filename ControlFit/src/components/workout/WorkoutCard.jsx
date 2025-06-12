import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  Play, 
  Edit, 
  Copy, 
  Trash2, 
  MoreVertical,
  Clock, 
  Dumbbell, 
  Target,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Activity,
  Timer,
  BarChart3
} from 'lucide-react';

const WorkoutCard = ({ 
  workout, 
  type = 'template', // 'template' | 'session' | 'active'
  onStart, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  onResume,
  className = '' 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Determinar el tipo de tarjeta y sus propiedades
  const isTemplate = type === 'template';
  const isSession = type === 'session';
  const isActive = type === 'active';

  // Calcular métricas según el tipo
  const getMetrics = () => {
    if (isTemplate) {
      return {
        exercises: workout.exercises?.length || 0,
        duration: workout.estimatedDuration || 0,
        timesUsed: workout.timesUsed || 0,
        lastUsed: workout.lastUsed
      };
    } else if (isSession) {
      const completedSets = workout.exercises?.reduce((total, ex) => 
        total + (ex.sets?.filter(set => set.completed)?.length || 0), 0) || 0;
      const totalSets = workout.exercises?.reduce((total, ex) => 
        total + (ex.sets?.length || 0), 0) || 0;
      
      return {
        exercises: workout.exercises?.length || 0,
        duration: workout.duration || 0,
        completedSets,
        totalSets,
        volume: workout.totalVolume || 0,
        completionRate: totalSets > 0 ? (completedSets / totalSets) * 100 : 0
      };
    } else if (isActive) {
      const currentExercise = workout.currentExerciseIndex + 1;
      const totalExercises = workout.exercises?.length || 0;
      const elapsedTime = workout.startTime ? 
        Math.floor((new Date() - new Date(workout.startTime)) / 60000) : 0;
      
      return {
        currentExercise,
        totalExercises,
        elapsedTime,
        isPaused: workout.isPaused
      };
    }
    return {};
  };

  const metrics = getMetrics();

  // Obtener color de dificultad
  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.beginner;
  };

  // Obtener color de estado de sesión
  const getSessionStatusColor = (completed, abandoned) => {
    if (completed) return 'bg-green-100 text-green-800';
    if (abandoned) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Formatear duración
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Manejar acciones del menú
  const handleMenuAction = (action) => {
    setShowMenu(false);
    switch (action) {
      case 'edit':
        onEdit?.(workout);
        break;
      case 'duplicate':
        onDuplicate?.(workout);
        break;
      case 'delete':
        onDelete?.(workout);
        break;
      default:
        break;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {workout.name}
              </h3>
              {isActive && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-600 ml-1 font-medium">ACTIVO</span>
                </div>
              )}
            </div>
            
            {workout.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {workout.description}
              </p>
            )}
          </div>

          {/* Menu dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              icon={<MoreVertical className="w-4 h-4" />}
            />
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {onEdit && (
                  <button
                    onClick={() => handleMenuAction('edit')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={() => handleMenuAction('duplicate')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => handleMenuAction('delete')}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {workout.difficulty && (
            <Badge className={getDifficultyColor(workout.difficulty)}>
              {workout.difficulty === 'beginner' && 'Principiante'}
              {workout.difficulty === 'intermediate' && 'Intermedio'}
              {workout.difficulty === 'advanced' && 'Avanzado'}
            </Badge>
          )}
          
          {isSession && (
            <Badge className={getSessionStatusColor(workout.completed, workout.abandoned)}>
              {workout.completed ? 'Completado' : workout.abandoned ? 'Abandonado' : 'En progreso'}
            </Badge>
          )}
          
          {workout.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
          
          {workout.tags?.length > 2 && (
            <Badge variant="outline" size="sm">
              +{workout.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {isTemplate && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <Dumbbell className="w-4 h-4 mr-2 text-gray-400" />
                <span>{metrics.exercises} ejercicios</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDuration(metrics.duration)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                <span>{metrics.timesUsed} usos</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDate(metrics.lastUsed)}</span>
              </div>
            </>
          )}

          {isSession && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <Dumbbell className="w-4 h-4 mr-2 text-gray-400" />
                <span>{metrics.exercises} ejercicios</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDuration(metrics.duration)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Target className="w-4 h-4 mr-2 text-gray-400" />
                <span>{metrics.completedSets}/{metrics.totalSets} series</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                <span>{metrics.volume.toLocaleString()} kg vol.</span>
              </div>
            </>
          )}

          {isActive && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="w-4 h-4 mr-2 text-gray-400" />
                <span>{metrics.currentExercise}/{metrics.totalExercises} ejercicios</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Timer className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDuration(metrics.elapsedTime)} transcurridos</span>
              </div>
              {workout.location && (
                <div className="flex items-center text-sm text-gray-600 col-span-2">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{workout.location}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Barra de progreso para sesiones */}
        {isSession && metrics.totalSets > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progreso</span>
              <span>{Math.round(metrics.completionRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  workout.completed ? 'bg-green-500' : 
                  workout.abandoned ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Información adicional para sesiones */}
        {isSession && workout.date && (
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(workout.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          {isTemplate && onStart && (
            <Button
              onClick={() => onStart(workout)}
              className="flex-1"
              icon={<Play className="w-4 h-4" />}
            >
              Comenzar
            </Button>
          )}

          {isSession && onView && (
            <Button
              onClick={() => onView(workout)}
              variant="outline"
              className="flex-1"
              icon={<Activity className="w-4 h-4" />}
            >
              Ver Detalles
            </Button>
          )}

          {isActive && (
            <div className="flex gap-2 w-full">
              {onResume && (
                <Button
                  onClick={() => onResume(workout)}
                  className="flex-1"
                  icon={metrics.isPaused ? <Play className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                >
                  {metrics.isPaused ? 'Continuar' : 'Entrenar'}
                </Button>
              )}
              {onEdit && (
                <Button
                  onClick={() => onEdit(workout)}
                  variant="outline"
                  icon={<Edit className="w-4 h-4" />}
                />
              )}
            </div>
          )}
        </div>

        {/* Vista previa de ejercicios */}
        {workout.exercises?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Ejercicios principales:</div>
            <div className="flex flex-wrap gap-1">
              {workout.exercises.slice(0, 3).map((exercise, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {exercise.name}
                </span>
              ))}
              {workout.exercises.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{workout.exercises.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click fuera del menú para cerrarlo */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </Card>
  );
};

export default WorkoutCard;