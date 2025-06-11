// Dashboard.jsx - Página principal del dashboard ASECGC
import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  Calendar,
  Target,
  Dumbbell,
  Award,
  ChevronRight,
  Play,
  BarChart3,
  Zap,
  Clock,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Simulación de datos para el dashboard
const mockData = {
  user: {
    username: 'Carlos',
    experienceLevel: 'intermediate'
  },
  dashboardStats: {
    workoutsThisWeek: 4,
    weeklyGoal: 5,
    weeklyChange: 15.2,
    currentStreak: 12,
    streakChange: 8.3,
    weeklyVolume: 2850,
    volumeChange: 12.4,
    latestBodyFat: 15.8,
    bodyFatChange: -2.1,
    weeklyStats: {
      totalWorkouts: 4,
      totalDuration: 240,
      exercisesCompleted: 28,
      personalRecords: 2
    }
  },
  volumeHistory: [
    { date: '2024-01-15', volume: 420 },
    { date: '2024-01-16', volume: 380 },
    { date: '2024-01-17', volume: 450 },
    { date: '2024-01-18', volume: 0 },
    { date: '2024-01-19', volume: 520 },
    { date: '2024-01-20', volume: 480 },
    { date: '2024-01-21', volume: 600 }
  ],
  recentSessions: [
    {
      id: '1',
      name: 'Push Day - Pecho y Tríceps',
      duration: 65,
      date: '2024-01-21',
      completed: true,
      metrics: { totalVolume: 1250 }
    },
    {
      id: '2',
      name: 'Pull Day - Espalda y Bíceps',
      duration: 58,
      date: '2024-01-19',
      completed: true,
      metrics: { totalVolume: 1180 }
    },
    {
      id: '3',
      name: 'Leg Day - Piernas Completo',
      duration: 72,
      date: '2024-01-17',
      completed: true,
      metrics: { totalVolume: 1420 }
    }
  ],
  recommendations: [
    {
      id: '1',
      title: 'Mejora tu consistencia',
      message: 'Has entrenado 4 veces esta semana. ¡Solo una sesión más para alcanzar tu meta!',
      priority: 'high',
      type: 'consistency'
    },
    {
      id: '2',
      title: 'Nuevo récord personal',
      message: 'Tu peso muerto ha mejorado 5kg en las últimas 3 semanas. Considera aumentar el volumen.',
      priority: 'medium',
      type: 'progression'
    },
    {
      id: '3',
      title: 'Actualiza tus medidas',
      message: 'Han pasado 2 semanas desde tu última medición corporal.',
      priority: 'low',
      type: 'measurements'
    }
  ],
  achievements: [
    {
      id: '1',
      title: 'Racha Semanal',
      description: '12 días consecutivos entrenando',
      level: 'gold',
      type: 'consistency'
    },
    {
      id: '2',
      title: 'Guerrero del Hierro',
      description: '2,850 kg de volumen semanal',
      level: 'silver',
      type: 'volume'
    },
    {
      id: '3',
      title: '50 Entrenamientos',
      description: 'Has completado 50 entrenamientos',
      level: 'bronze',
      type: 'milestones'
    }
  ],
  currentWorkout: null
};

// Componente principal del Dashboard
const Dashboard = () => {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleStartQuickWorkout = () => {
    setData(prev => ({
      ...prev,
      currentWorkout: {
        id: 'active-workout',
        name: 'Entrenamiento Rápido',
        startTime: new Date(),
        exercises: []
      }
    }));
  };

  const handleNavigate = (path) => {
    console.log(`Navegando a: ${path}`);
    // Aquí iría la lógica de navegación
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Cargando dashboard...</p>
          <p className="text-gray-600">Preparando tus datos fitness</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Hola, {data.user.username}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Aquí tienes un resumen de tu progreso fitness
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartQuickWorkout}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Entrenar Ahora
              </button>
              <button
                onClick={() => handleNavigate('/workouts/templates')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Rutina
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Entrenamiento Activo (si existe) */}
        {data.currentWorkout && (
          <div className="mb-8">
            <ActiveWorkoutCard workout={data.currentWorkout} />
          </div>
        )}

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Entrenamientos esta semana"
            value={data.dashboardStats.workoutsThisWeek}
            target={data.dashboardStats.weeklyGoal}
            change={data.dashboardStats.weeklyChange}
            icon={<Dumbbell className="w-6 h-6" />}
            color="primary"
          />
          
          <StatsCard
            title="Racha actual"
            value={`${data.dashboardStats.currentStreak} días`}
            change={data.dashboardStats.streakChange}
            icon={<Zap className="w-6 h-6" />}
            color="warning"
          />
          
          <StatsCard
            title="Volumen semanal"
            value={`${Math.round(data.dashboardStats.weeklyVolume)} kg`}
            change={data.dashboardStats.volumeChange}
            icon={<BarChart3 className="w-6 h-6" />}
            color="success"
          />
          
          <StatsCard
            title="Grasa corporal"
            value={`${data.dashboardStats.latestBodyFat}%`}
            change={data.dashboardStats.bodyFatChange}
            icon={<Activity className="w-6 h-6" />}
            color="info"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gráfico de Progreso */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Progreso de Volumen (7 días)
                  </h3>
                  <button 
                    onClick={() => handleNavigate('/analytics')}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Ver detalles →
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <VolumeChart data={data.volumeHistory} />
              </div>
            </div>

            {/* Entrenamientos Recientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Entrenamientos Recientes
                  </h3>
                  <button 
                    onClick={() => handleNavigate('/workouts')}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Ver todos →
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <RecentWorkouts sessions={data.recentSessions} />
              </div>
            </div>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-8">
            {/* Progreso Semanal */}
            <WeeklyProgress stats={data.dashboardStats.weeklyStats} />

            {/* Recomendaciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recomendaciones
                </h3>
              </div>
              <div className="px-6 py-4">
                <RecommendationsList recommendations={data.recommendations} onNavigate={handleNavigate} />
              </div>
            </div>

            {/* Logros Recientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Logros Recientes
                  </h3>
                  <button 
                    onClick={() => handleNavigate('/achievements')}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Ver todos →
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <AchievementsList achievements={data.achievements} onNavigate={handleNavigate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para entrenamiento activo
const ActiveWorkoutCard = ({ workout }) => {
  const duration = workout.startTime ? 
    Math.floor((new Date() - new Date(workout.startTime)) / 1000 / 60) : 0;

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Entrenamiento en Progreso
            </h3>
            <p className="text-green-700">
              {workout.name || 'Entrenamiento Personalizado'} • {duration} min
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activo
          </span>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para tarjetas de estadísticas
const StatsCard = ({ title, value, target, change, icon, color }) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100',
  };

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {target && (
              <p className="ml-2 text-sm text-gray-500">/ {target}</p>
            )}
          </div>
          
          {change !== 0 && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs semana anterior</span>
            </div>
          )}
        </div>
        
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      {target && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{Math.round((parseInt(value) / target) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                color === 'primary' ? 'bg-primary-600' : 
                color === 'success' ? 'bg-green-600' : 
                color === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min((parseInt(value) / target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para gráfico de volumen
const VolumeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { weekday: 'short' })}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
            formatter={(value) => [`${value} kg`, 'Volumen']}
          />
          <Line 
            type="monotone" 
            dataKey="volume" 
            stroke="#0ea5e9" 
            strokeWidth={3}
            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#0284c7' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Componente para entrenamientos recientes
const RecentWorkouts = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay entrenamientos recientes</p>
        <button className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          Comenzar Entrenamiento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <div key={session.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{session.name}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {session.duration} min
                </span>
                <span className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  {Math.round(session.metrics?.totalVolume || 0)} kg
                </span>
                <span>{new Date(session.date).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              session.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {session.completed ? "Completado" : "En progreso"}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para progreso semanal
const WeeklyProgress = ({ stats }) => {
  const progressData = [
    { day: 'L', completed: true },
    { day: 'M', completed: true },
    { day: 'X', completed: false },
    { day: 'J', completed: true },
    { day: 'V', completed: false },
    { day: 'S', completed: false },
    { day: 'D', completed: false },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Progreso Semanal</h3>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* Calendario semanal */}
          <div className="grid grid-cols-7 gap-2">
            {progressData.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium ${
                  day.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {day.completed ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>

          {/* Estadísticas */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Entrenamientos</span>
              <span className="font-medium">{stats?.totalWorkouts || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tiempo total</span>
              <span className="font-medium">{Math.round(stats?.totalDuration || 0)} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ejercicios completados</span>
              <span className="font-medium">{stats?.exercisesCompleted || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Récords personales</span>
              <span className="font-medium">{stats?.personalRecords || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para lista de recomendaciones
const RecommendationsList = ({ recommendations, onNavigate }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-4">
        <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No hay recomendaciones disponibles</p>
      </div>
    );
  }

  const priorityColors = {
    high: 'text-red-600 bg-red-100',
    medium: 'text-yellow-600 bg-yellow-100',
    low: 'text-blue-600 bg-blue-100',
  };

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <div key={rec.id || index} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 text-sm">{rec.title}</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[rec.priority]}`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600">{rec.message}</p>
        </div>
      ))}
      
      <button 
        onClick={() => onNavigate('/analytics')}
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        Ver más recomendaciones
      </button>
    </div>
  );
};

// Componente para lista de logros
const AchievementsList = ({ achievements, onNavigate }) => {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-4">
        <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No hay logros recientes</p>
      </div>
    );
  }

  const levelColors = {
    gold: 'text-yellow-600 bg-yellow-100',
    silver: 'text-gray-600 bg-gray-100',
    bronze: 'text-orange-600 bg-orange-100',
  };

  return (
    <div className="space-y-3">
      {achievements.map((achievement, index) => (
        <div key={achievement.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <Award className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[achievement.level]}`}>
                {achievement.level}
              </span>
            </div>
            <p className="text-xs text-gray-600">{achievement.description}</p>
          </div>
        </div>
      ))}
      
      <button 
        onClick={() => onNavigate('/achievements')}
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        Ver todos los logros
      </button>
    </div>
  );
};

export default Dashboard;