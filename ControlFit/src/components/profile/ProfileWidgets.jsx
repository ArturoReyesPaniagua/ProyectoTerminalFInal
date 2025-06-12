// components/profile/ProfileWidgets.jsx
import React, { useState } from 'react';
import { clsx } from 'clsx';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award, 
  Activity,
  Clock,
  Zap,
  Fire,
  BarChart3,
  Eye,
  EyeOff,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Check,
  X,
  Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Button, Card, Badge, Modal, Progress } from '../ui';
import 'react-circular-progressbar/dist/styles.css';

// Widget de estadísticas rápidas
export const QuickStatsWidget = ({ stats, className = '' }) => {
  const statsData = [
    {
      label: 'Entrenamientos',
      value: stats.totalWorkouts || 0,
      icon: Activity,
      color: 'text-blue-600 bg-blue-100',
      change: stats.workoutsChange || 0
    },
    {
      label: 'Racha actual',
      value: stats.currentStreak || 0,
      icon: Fire,
      color: 'text-orange-600 bg-orange-100',
      change: stats.streakChange || 0
    },
    {
      label: 'Récords',
      value: stats.personalRecords || 0,
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-100',
      change: stats.recordsChange || 0
    },
    {
      label: 'Tiempo total',
      value: `${Math.round(stats.totalHours || 0)}h`,
      icon: Clock,
      color: 'text-green-600 bg-green-100',
      change: stats.hoursChange || 0
    }
  ];

  return (
    <div className={clsx('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {statsData.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={clsx('p-2 rounded-lg', stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
            {stat.change !== 0 && (
              <div className={clsx(
                'flex items-center text-xs',
                stat.change > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {stat.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="ml-1">{Math.abs(stat.change)}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Widget de progreso de objetivos
export const GoalsProgressWidget = ({ goals, onViewAll, className = '' }) => {
  const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 3);
  
  const calculateProgress = (goal) => {
    // Lógica simplificada de cálculo de progreso
    return Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100));
  };

  if (activeGoals.length === 0) {
    return (
      <Card className={clsx('p-6 text-center', className)}>
        <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm mb-3">No hay objetivos activos</p>
        <Button size="sm" variant="outline">
          Crear Objetivo
        </Button>
      </Card>
    );
  }

  return (
    <Card className={clsx('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Objetivos Activos</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {activeGoals.map(goal => {
          const progress = calculateProgress(goal);
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">{goal.title}</span>
                <span className="text-gray-600">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{goal.currentValue} {goal.unit}</span>
                <span>Meta: {goal.targetValue} {goal.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {goals.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-4" 
          onClick={onViewAll}
        >
          Ver todos los objetivos ({goals.length})
        </Button>
      )}
    </Card>
  );
};

// Widget de logros recientes
export const RecentAchievementsWidget = ({ achievements, onViewAll, className = '' }) => {
  const recentAchievements = achievements
    .filter(a => a.earned)
    .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate))
    .slice(0, 3);

  if (recentAchievements.length === 0) {
    return (
      <Card className={clsx('p-6 text-center', className)}>
        <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No hay logros recientes</p>
      </Card>
    );
  }

  return (
    <Card className={clsx('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Logros Recientes</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {recentAchievements.map(achievement => (
          <div key={achievement.id} className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {achievement.title}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(achievement.earnedDate).toLocaleDateString('es-ES')}
              </p>
            </div>
            <Badge 
              className="text-yellow-600 bg-yellow-100"
              size="sm"
            >
              {achievement.level}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Widget de consistencia de entrenamientos
export const WorkoutConsistencyWidget = ({ workoutHistory, className = '' }) => {
  const [viewMode, setViewMode] = useState('week'); // week, month
  
  // Generar datos de los últimos 7 días
  const getWeekData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const hasWorkout = workoutHistory.some(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        hasWorkout
      });
    }
    
    return days;
  };

  const weekData = getWeekData();
  const consistency = Math.round((weekData.filter(d => d.hasWorkout).length / 7) * 100);

  return (
    <Card className={clsx('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Consistencia Semanal</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{consistency}%</div>
          <div className="text-xs text-gray-500">esta semana</div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{day.day}</div>
            <div 
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                day.hasWorkout 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {day.hasWorkout ? <Check className="w-4 h-4" /> : '•'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Racha actual: {workoutHistory.currentStreak || 0} días</span>
          <span>Meta: 5 días/semana</span>
        </div>
      </div>
    </Card>
  );
};

// Widget de progreso de medidas corporales
export const BodyMeasurementsWidget = ({ measurements, trends, className = '' }) => {
  const [selectedMetric, setSelectedMetric] = useState('weight');
  
  const metrics = [
    { key: 'weight', label: 'Peso', unit: 'kg', color: '#3B82F6' },
    { key: 'bodyFat', label: 'Grasa', unit: '%', color: '#EF4444' },
    { key: 'muscleMass', label: 'Músculo', unit: 'kg', color: '#10B981' }
  ];

  const selectedMetricData = metrics.find(m => m.key === selectedMetric);
  const currentValue = measurements.current[selectedMetric];
  const trend = trends[selectedMetric];

  return (
    <Card className={clsx('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Medidas Corporales</h3>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          {metrics.map(metric => (
            <option key={metric.key} value={metric.key}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {currentValue ? `${currentValue}${selectedMetricData.unit}` : '—'}
          </div>
          <div className="text-sm text-gray-600">{selectedMetricData.label} actual</div>
        </div>
        
        {trend && (
          <div className={clsx(
            'flex items-center text-sm',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
             trend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            <span className="ml-1">
              {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}{selectedMetricData.unit}
            </span>
          </div>
        )}
      </div>
      
      {measurements.history.length > 0 && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={measurements.history.slice(-10)}>
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={selectedMetricData.color} 
                strokeWidth={2}
                dot={false}
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                formatter={(value) => [`${value}${selectedMetricData.unit}`, selectedMetricData.label]}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

// Modal de exportación de datos
export const ExportDataModal = ({ isOpen, onClose, onExport, className = '' }) => {
  const [exportOptions, setExportOptions] = useState({
    profile: true,
    measurements: true,
    goals: true,
    achievements: true,
    workouts: false,
    format: 'json'
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport(exportOptions);
      onClose();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Datos" className={className}>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">¿Qué datos quieres exportar?</h4>
          <div className="space-y-2">
            {[
              { key: 'profile', label: 'Información del perfil' },
              { key: 'measurements', label: 'Medidas corporales' },
              { key: 'goals', label: 'Objetivos' },
              { key: 'achievements', label: 'Logros' },
              { key: 'workouts', label: 'Historial de entrenamientos' }
            ].map(option => (
              <label key={option.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions[option.key]}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    [option.key]: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Formato de exportación</h4>
          <div className="space-y-2">
            {[
              { key: 'json', label: 'JSON (recomendado)' },
              { key: 'csv', label: 'CSV (solo medidas y estadísticas)' },
              { key: 'pdf', label: 'PDF (resumen visual)' }
            ].map(format => (
              <label key={format.key} className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value={format.key}
                  checked={exportOptions.format === format.key}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    format: e.target.value
                  }))}
                  className="border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{format.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Tus datos se exportarán de forma segura. No se compartirá información 
                sensible y podrás importar estos datos más adelante si es necesario.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport} 
            loading={exporting}
            icon={<Download className="w-4 h-4" />}
          >
            Exportar Datos
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Widget de actividad semanal con heatmap
export const WeeklyActivityHeatmap = ({ workoutHistory, className = '' }) => {
  const getWeeklyData = () => {
    const weeks = [];
    const today = new Date();
    
    // Obtener últimas 12 semanas
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
      
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + d);
        
        const workoutsCount = workoutHistory.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate.toDateString() === day.toDateString();
        }).length;
        
        weekDays.push({
          date: day,
          workouts: workoutsCount,
          intensity: Math.min(workoutsCount, 3) // Max 3 niveles de intensidad
        });
      }
      
      weeks.push(weekDays);
    }
    
    return weeks;
  };

  const weeklyData = getWeeklyData();
  const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  return (
    <Card className={clsx('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Actividad de los últimos 3 meses</h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Menos</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map(level => (
              <div
                key={level}
                className={clsx(
                  'w-3 h-3 rounded-sm',
                  level === 0 ? 'bg-gray-200' :
                  level === 1 ? 'bg-green-200' :
                  level === 2 ? 'bg-green-400' : 'bg-green-600'
                )}
              />
            ))}
          </div>
          <span>Más</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex space-x-1 text-xs text-gray-500 mb-2">
          {dayLabels.map((day, index) => (
            <div key={index} className="w-3 text-center">{day}</div>
          ))}
        </div>
        
        {weeklyData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex space-x-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={clsx(
                  'w-3 h-3 rounded-sm',
                  day.intensity === 0 ? 'bg-gray-200' :
                  day.intensity === 1 ? 'bg-green-200' :
                  day.intensity === 2 ? 'bg-green-400' : 'bg-green-600'
                )}
                title={`${day.date.toLocaleDateString('es-ES')}: ${day.workouts} entrenamientos`}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

// Widget de comparación de progreso
export const ProgressComparisonWidget = ({ currentData, previousData, period = 'month', className = '' }) => {
  const comparisons = [
    {
      label: 'Peso',
      current: currentData.weight,
      previous: previousData.weight,
      unit: 'kg',
      reverse: true // Pérdida de peso es positiva
    },
    {
      label: 'Grasa corporal',
      current: currentData.bodyFat,
      previous: previousData.bodyFat,
      unit: '%',
      reverse: true
    },
    {
      label: 'Masa muscular',
      current: currentData.muscleMass,
      previous: previousData.muscleMass,
      unit: 'kg',
      reverse: false
    }
  ];

  const calculateChange = (current, previous, reverse = false) => {
    if (!current || !previous) return null;
    
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    const isPositive = reverse ? change < 0 : change > 0;
    
    return {
      absolute: change,
      percent: percentChange,
      isPositive
    };
  };

  return (
    <Card className={clsx('p-6', className)}>
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">
          Progreso del último {period === 'month' ? 'mes' : period === 'week' ? 'semana' : 'año'}
        </h3>
        <p className="text-sm text-gray-600">Comparación con el período anterior</p>
      </div>
      
      <div className="space-y-4">
        {comparisons.map((comparison, index) => {
          const change = calculateChange(
            comparison.current, 
            comparison.previous, 
            comparison.reverse
          );
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{comparison.label}</p>
                <p className="text-sm text-gray-600">
                  {comparison.current ? `${comparison.current}${comparison.unit}` : '—'}
                </p>
              </div>
              
              {change && (
                <div className={clsx(
                  'flex items-center text-sm',
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {change.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="ml-1">
                    {change.absolute > 0 ? '+' : ''}{change.absolute.toFixed(1)}{comparison.unit}
                  </span>
                  <span className="ml-1 text-xs">
                    ({change.percent.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default {
  QuickStatsWidget,
  GoalsProgressWidget,
  RecentAchievementsWidget,
  WorkoutConsistencyWidget,
  BodyMeasurementsWidget,
  ExportDataModal,
  WeeklyActivityHeatmap,
  ProgressComparisonWidget
};