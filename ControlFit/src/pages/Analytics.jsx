// frontend/src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Target,
  Zap,
  Award,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Button, Card, Badge, Select } from '../components/ui';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

// Datos simulados
const mockAnalyticsData = {
  timeframe: '30d',
  summary: {
    totalSessions: 24,
    totalVolume: 18650,
    averageSessionDuration: 68,
    consistencyScore: 85,
    progressIndex: 7.2,
    weeklyGrowth: 12.5
  },
  volumeProgression: [
    { date: '2024-01-01', volume: 720, sessions: 1 },
    { date: '2024-01-03', volume: 850, sessions: 1 },
    { date: '2024-01-05', volume: 780, sessions: 1 },
    { date: '2024-01-08', volume: 920, sessions: 1 },
    { date: '2024-01-10', volume: 890, sessions: 1 },
    { date: '2024-01-12', volume: 1050, sessions: 1 },
    { date: '2024-01-15', volume: 980, sessions: 1 },
    { date: '2024-01-17', volume: 1120, sessions: 1 },
    { date: '2024-01-19', volume: 1080, sessions: 1 },
    { date: '2024-01-22', volume: 1180, sessions: 1 }
  ],
  strengthProgression: {
    'press-banca': [
      { date: '2024-01-01', oneRM: 75, volume: 2850 },
      { date: '2024-01-08', oneRM: 77.5, volume: 3200 },
      { date: '2024-01-15', oneRM: 80, volume: 3400 },
      { date: '2024-01-22', oneRM: 82.5, volume: 3650 }
    ],
    'sentadillas': [
      { date: '2024-01-01', oneRM: 90, volume: 4200 },
      { date: '2024-01-08', oneRM: 92.5, volume: 4400 },
      { date: '2024-01-15', oneRM: 95, volume: 4650 },
      { date: '2024-01-22', oneRM: 97.5, volume: 4850 }
    ]
  },
  bodyComposition: [
    { date: '2024-01-01', bodyFat: 16.8, weight: 78.2, muscle: 65.2 },
    { date: '2024-01-07', bodyFat: 16.5, weight: 78.0, muscle: 65.3 },
    { date: '2024-01-14', bodyFat: 16.2, weight: 78.1, muscle: 65.5 },
    { date: '2024-01-21', bodyFat: 15.8, weight: 78.5, muscle: 66.1 }
  ],
  workoutConsistency: [
    { week: 'Sem 1', planned: 5, completed: 4, completion: 80 },
    { week: 'Sem 2', planned: 5, completed: 5, completion: 100 },
    { week: 'Sem 3', planned: 5, completed: 3, completion: 60 },
    { week: 'Sem 4', planned: 5, completed: 5, completion: 100 }
  ],
  muscleGroupDistribution: [
    { name: 'Pecho', value: 28, color: '#0ea5e9' },
    { name: 'Espalda', value: 25, color: '#10b981' },
    { name: 'Piernas', value: 22, color: '#f59e0b' },
    { name: 'Hombros', value: 15, color: '#ef4444' },
    { name: 'Brazos', value: 10, color: '#8b5cf6' }
  ],
  personalRecords: [
    { exercise: 'Press Banca', previousPR: 77.5, newPR: 82.5, improvement: 6.45, date: '2024-01-22' },
    { exercise: 'Sentadillas', previousPR: 92.5, newPR: 97.5, improvement: 5.41, date: '2024-01-20' },
    { exercise: 'Peso Muerto', previousPR: 105, newPR: 110, improvement: 4.76, date: '2024-01-18' }
  ],
  recommendations: [
    {
      id: 1,
      type: 'improvement',
      title: 'Aumenta la frecuencia de piernas',
      description: 'Has entrenado piernas solo 1 vez esta semana. Considera añadir una sesión más.',
      priority: 'medium',
      actionable: true
    },
    {
      id: 2,
      type: 'warning',
      title: 'Volumen en descenso',
      description: 'Tu volumen semanal ha disminuido 8% en las últimas 2 semanas.',
      priority: 'high',
      actionable: true
    },
    {
      id: 3,
      type: 'success',
      title: '¡Excelente progresión en fuerza!',
      description: 'Has mejorado tu 1RM en press banca un 6.5% este mes.',
      priority: 'low',
      actionable: false
    }
  ]
};

const Analytics = () => {
  const [data, setData] = useState(mockAnalyticsData);
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const handleExportData = () => {
    toast.success('Exportando datos analytics...');
    // Aquí iría la lógica de exportación
  };

  const timeframeOptions = [
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' },
    { value: '6m', label: '6 meses' },
    { value: '1y', label: '1 año' }
  ];

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: BarChart3 },
    { id: 'strength', name: 'Fuerza', icon: TrendingUp },
    { id: 'composition', name: 'Composición', icon: Activity },
    { id: 'consistency', name: 'Consistencia', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">
                Análisis detallado de tu progreso y rendimiento
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <select
                value={timeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <Button
                onClick={loadAnalyticsData}
                variant="outline"
                icon={<RefreshCw className="w-4 h-4" />}
                disabled={loading}
              >
                Actualizar
              </Button>
              
              <Button
                onClick={handleExportData}
                variant="outline"
                icon={<Download className="w-4 h-4" />}
              >
                Exportar
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Resumen de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de sesiones"
            value={data.summary.totalSessions}
            change={12.5}
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
          />
          
          <MetricCard
            title="Volumen total"
            value={`${Math.round(data.summary.totalVolume / 1000)}k kg`}
            change={8.3}
            icon={<BarChart3 className="w-6 h-6" />}
            color="success"
          />
          
          <MetricCard
            title="Duración promedio"
            value={`${data.summary.averageSessionDuration} min`}
            change={-2.1}
            icon={<Zap className="w-6 h-6" />}
            color="warning"
          />
          
          <MetricCard
            title="Puntuación de consistencia"
            value={`${data.summary.consistencyScore}%`}
            change={5.2}
            icon={<Target className="w-6 h-6" />}
            color="info"
          />
        </div>

        {/* Contenido basado en la pestaña activa */}
        {activeTab === 'overview' && (
          <OverviewTab
            data={data}
            loading={loading}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        )}
        
        {activeTab === 'strength' && (
          <StrengthTab data={data.strengthProgression} loading={loading} />
        )}
        
        {activeTab === 'composition' && (
          <CompositionTab data={data.bodyComposition} loading={loading} />
        )}
        
        {activeTab === 'consistency' && (
          <ConsistencyTab data={data.workoutConsistency} loading={loading} />
        )}
      </div>
    </div>
  );
};

// Tab de Resumen
const OverviewTab = ({ data, loading, selectedMetric, onMetricChange }) => {
  if (loading) {
    return <LoadingView />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna principal */}
      <div className="lg:col-span-2 space-y-8">
        {/* Gráfico de progresión de volumen */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Progresión de Volumen
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Últimos</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="volume">Volumen</option>
                  <option value="sessions">Sesiones</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <VolumeChart data={data.volumeProgression} />
          </div>
        </Card>

        {/* Distribución de grupos musculares */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Distribución por Grupo Muscular
            </h3>
          </div>
          <div className="p-6">
            <MuscleGroupChart data={data.muscleGroupDistribution} />
          </div>
        </Card>
      </div>

      {/* Columna lateral */}
      <div className="space-y-8">
        {/* Récords personales */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Récords Recientes
            </h3>
          </div>
          <div className="p-6">
            <PersonalRecordsCard records={data.personalRecords} />
          </div>
        </Card>

        {/* Recomendaciones */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Recomendaciones
            </h3>
          </div>
          <div className="p-6">
            <RecommendationsCard recommendations={data.recommendations} />
          </div>
        </Card>

        {/* Índice de progreso */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Índice de Progreso
            </h3>
          </div>
          <div className="p-6">
            <ProgressIndex score={data.summary.progressIndex} />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Tab de Fuerza
const StrengthTab = ({ data, loading }) => {
  const [selectedExercise, setSelectedExercise] = useState('press-banca');

  if (loading) {
    return <LoadingView />;
  }

  const exercises = Object.keys(data);
  const exerciseLabels = {
    'press-banca': 'Press de Banca',
    'sentadillas': 'Sentadillas',
    'peso-muerto': 'Peso Muerto'
  };

  return (
    <div className="space-y-8">
      {/* Selector de ejercicio */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Ejercicio:</label>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          {exercises.map(exercise => (
            <option key={exercise} value={exercise}>
              {exerciseLabels[exercise] || exercise}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de 1RM */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Progresión 1RM - {exerciseLabels[selectedExercise]}
            </h3>
          </div>
          <div className="p-6">
            <StrengthChart data={data[selectedExercise]} metric="oneRM" />
          </div>
        </Card>

        {/* Gráfico de volumen */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Volumen - {exerciseLabels[selectedExercise]}
            </h3>
          </div>
          <div className="p-6">
            <StrengthChart data={data[selectedExercise]} metric="volume" />
          </div>
        </Card>
      </div>

      {/* Estadísticas del ejercicio */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Estadísticas - {exerciseLabels[selectedExercise]}
          </h3>
        </div>
        <div className="p-6">
          <ExerciseStats data={data[selectedExercise]} />
        </div>
      </Card>
    </div>
  );
};

// Tab de Composición Corporal
const CompositionTab = ({ data, loading }) => {
  if (loading) {
    return <LoadingView />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfico de grasa corporal */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Evolución de Grasa Corporal
          </h3>
        </div>
        <div className="p-6">
          <CompositionChart data={data} metric="bodyFat" />
        </div>
      </Card>

      {/* Gráfico de peso */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Evolución del Peso
          </h3>
        </div>
        <div className="p-6">
          <CompositionChart data={data} metric="weight" />
        </div>
      </Card>

      {/* Gráfico combinado */}
      <Card className="lg:col-span-2">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Análisis de Composición Corporal
          </h3>
        </div>
        <div className="p-6">
          <CombinedCompositionChart data={data} />
        </div>
      </Card>
    </div>
  );
};

// Tab de Consistencia
const ConsistencyTab = ({ data, loading }) => {
  if (loading) {
    return <LoadingView />;
  }

  return (
    <div className="space-y-8">
      {/* Gráfico de consistencia semanal */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Consistencia Semanal
          </h3>
        </div>
        <div className="p-6">
          <ConsistencyChart data={data} />
        </div>
      </Card>

      {/* Métricas de consistencia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round(data.reduce((sum, week) => sum + week.completion, 0) / data.length)}%
          </div>
          <div className="text-gray-600">Consistencia promedio</div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {data.filter(week => week.completion === 100).length}
          </div>
          <div className="text-gray-600">Semanas perfectas</div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {data.reduce((sum, week) => sum + week.completed, 0)}
          </div>
          <div className="text-gray-600">Total entrenamientos</div>
        </Card>
      </div>
    </div>
  );
};

// Componentes de gráficos
const VolumeChart = ({ data }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
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

const MuscleGroupChart = ({ data }) => (
  <div className="h-64 flex items-center">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, 'Distribución']} />
      </PieChart>
    </ResponsiveContainer>
    <div className="ml-8 space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm font-medium">{item.name}</span>
          <span className="text-sm text-gray-500">{item.value}%</span>
        </div>
      ))}
    </div>
  </div>
);

const StrengthChart = ({ data, metric }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
          formatter={(value) => [
            `${value} ${metric === 'oneRM' ? 'kg' : 'kg'}`,
            metric === 'oneRM' ? '1RM' : 'Volumen'
          ]}
        />
        <Line 
          type="monotone" 
          dataKey={metric} 
          stroke={metric === 'oneRM' ? '#10b981' : '#f59e0b'} 
          strokeWidth={3}
          dot={{ fill: metric === 'oneRM' ? '#10b981' : '#f59e0b', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const CompositionChart = ({ data, metric }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
          formatter={(value) => [
            `${value} ${metric === 'bodyFat' ? '%' : 'kg'}`,
            metric === 'bodyFat' ? 'Grasa corporal' : 'Peso'
          ]}
        />
        <Line 
          type="monotone" 
          dataKey={metric} 
          stroke={metric === 'bodyFat' ? '#ef4444' : '#0ea5e9'} 
          strokeWidth={3}
          dot={{ fill: metric === 'bodyFat' ? '#ef4444' : '#0ea5e9', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const CombinedCompositionChart = ({ data }) => (
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
        />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
          formatter={(value, name) => [
            `${value} ${name === 'bodyFat' ? '%' : name === 'weight' ? 'kg' : 'kg'}`,
            name === 'bodyFat' ? 'Grasa corporal' : name === 'weight' ? 'Peso' : 'Músculo'
          ]}
        />
        <Line yAxisId="left" type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={2} />
        <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={2} />
        <Line yAxisId="right" type="monotone" dataKey="muscle" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const ConsistencyChart = ({ data }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value, name) => [
            value,
            name === 'planned' ? 'Planificados' : name === 'completed' ? 'Completados' : 'Porcentaje'
          ]}
        />
        <Bar dataKey="planned" fill="#e5e7eb" />
        <Bar dataKey="completed" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Componentes auxiliares
const MetricCard = ({ title, value, change, icon, color }) => {
  const isPositive = change > 0;
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          
          <div className="flex items-center mt-2">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 mr-1 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs anterior</span>
          </div>
        </div>
        
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const PersonalRecordsCard = ({ records }) => (
  <div className="space-y-4">
    {records.map((record, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
        <div>
          <div className="font-medium text-gray-900">{record.exercise}</div>
          <div className="text-sm text-gray-600">
            {record.previousPR}kg → {record.newPR}kg
          </div>
          <div className="text-xs text-gray-500">
            {new Date(record.date).toLocaleDateString('es-ES')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            +{record.improvement.toFixed(1)}%
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RecommendationsCard = ({ recommendations }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <Info className="w-4 h-4" />;
      case 'success': return <Award className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <div key={rec.id} className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getTypeIcon(rec.type)}
              <span className="font-medium text-gray-900 text-sm">{rec.title}</span>
            </div>
            <Badge className={getPriorityColor(rec.priority)} size="sm">
              {rec.priority}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{rec.description}</p>
          {rec.actionable && (
            <Button variant="outline" size="sm" className="mt-2">
              Ver detalles
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

const ProgressIndex = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excelente';
    if (score >= 6) return 'Bueno';
    return 'Necesita mejora';
  };

  return (
    <div className="text-center">
      <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
        {score.toFixed(1)}/10
      </div>
      <div className="text-gray-600 mb-4">{getScoreLabel(score)}</div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${
            score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 mt-3">
        Basado en consistencia, progresión y variedad
      </p>
    </div>
  );
};

const ExerciseStats = ({ data }) => {
  const latest = data[data.length - 1];
  const first = data[0];
  const totalImprovement = ((latest.oneRM - first.oneRM) / first.oneRM) * 100;
  const volumeImprovement = ((latest.volume - first.volume) / first.volume) * 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{latest.oneRM} kg</div>
        <div className="text-sm text-gray-600">1RM Actual</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          +{totalImprovement.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600">Mejora 1RM</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{latest.volume}</div>
        <div className="text-sm text-gray-600">Volumen Actual</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          +{volumeImprovement.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600">Mejora Volumen</div>
      </div>
    </div>
  );
};

const LoadingView = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

export default Analytics;