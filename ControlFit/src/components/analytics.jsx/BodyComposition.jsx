import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  Scale,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Info,
  Filter,
  Download,
  Eye,
  BarChart3,
  Zap
} from 'lucide-react';
import StatsCard from './StatsCard';
import ProgressChart from './ProgressChart';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const BodyComposition = ({
  data = [],
  goals = {},
  timeframe = '6m',
  showMetrics = ['weight', 'bodyFat', 'muscle'],
  onTimeframeChange,
  onGoalUpdate,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState('trend'); // 'trend', 'comparison', 'analysis'
  const [selectedMetrics, setSelectedMetrics] = useState(showMetrics);

  // Configuración de métricas
  const metricsConfig = {
    weight: {
      label: 'Peso',
      unit: 'kg',
      color: '#0ea5e9',
      icon: Scale,
      idealRange: { min: goals.targetWeight - 2, max: goals.targetWeight + 2 },
      format: (value) => `${value} kg`
    },
    bodyFat: {
      label: 'Grasa Corporal',
      unit: '%',
      color: '#f59e0b',
      icon: Activity,
      idealRange: { min: goals.targetBodyFat - 1, max: goals.targetBodyFat + 1 },
      format: (value) => `${value}%`
    },
    muscle: {
      label: 'Masa Muscular',
      unit: 'kg',
      color: '#10b981',
      icon: Zap,
      idealRange: { min: goals.targetMuscle - 1, max: goals.targetMuscle + 1 },
      format: (value) => `${value} kg`
    },
    bmi: {
      label: 'IMC',
      unit: '',
      color: '#8b5cf6',
      icon: Target,
      idealRange: { min: 18.5, max: 24.9 },
      format: (value) => value.toFixed(1)
    },
    visceralFat: {
      label: 'Grasa Visceral',
      unit: '',
      color: '#ef4444',
      icon: Activity,
      idealRange: { min: 1, max: 12 },
      format: (value) => value.toString()
    }
  };

  // Procesar datos para análisis
  const analysisData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const latest = data[data.length - 1];
    const previous = data.length > 1 ? data[data.length - 2] : latest;
    const firstRecord = data[0];

    const analysis = {};

    Object.keys(metricsConfig).forEach(metric => {
      if (latest[metric] !== undefined) {
        const current = latest[metric];
        const prev = previous[metric];
        const initial = firstRecord[metric];
        
        analysis[metric] = {
          current,
          previous: prev,
          initial,
          change: prev ? current - prev : 0,
          totalChange: initial ? current - initial : 0,
          percentChange: prev && prev !== 0 ? ((current - prev) / prev) * 100 : 0,
          totalPercentChange: initial && initial !== 0 ? ((current - initial) / initial) * 100 : 0,
          trend: prev ? (current > prev ? 'up' : current < prev ? 'down' : 'stable') : 'stable',
          isInIdealRange: checkIdealRange(current, metric)
        };
      }
    });

    return {
      latest,
      analysis,
      dataPoints: data.length,
      dateRange: {
        start: data[0]?.date,
        end: latest?.date
      }
    };
  }, [data, goals]);

  // Verificar si un valor está en el rango ideal
  const checkIdealRange = (value, metric) => {
    const config = metricsConfig[metric];
    if (!config?.idealRange) return null;
    
    return value >= config.idealRange.min && value <= config.idealRange.max;
  };

  // Calcular composición corporal
  const bodyCompositionBreakdown = useMemo(() => {
    if (!analysisData?.latest) return null;

    const { weight, bodyFat, muscle } = analysisData.latest;
    if (!weight || !bodyFat) return null;

    const fatMass = (weight * bodyFat) / 100;
    const leanMass = weight - fatMass;
    const muscleMass = muscle || leanMass * 0.8; // Estimación si no hay dato de músculo
    const otherLean = leanMass - muscleMass;

    return [
      { name: 'Grasa', value: fatMass, percentage: bodyFat, color: '#ef4444' },
      { name: 'Músculo', value: muscleMass, percentage: (muscleMass / weight) * 100, color: '#10b981' },
      { name: 'Otros', value: otherLean, percentage: (otherLean / weight) * 100, color: '#6b7280' }
    ];
  }, [analysisData]);

  // Tooltip personalizado para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">
          {new Date(label).toLocaleDateString('es-ES')}
        </p>
        {payload.map((entry, index) => {
          const config = metricsConfig[entry.dataKey];
          return (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{config?.label || entry.dataKey}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {config?.format(entry.value) || entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render vista de tendencias
  const renderTrendView = () => (
    <div className="space-y-6">
      {/* Gráfico principal de tendencias */}
      <ProgressChart
        data={data}
        type="line"
        metrics={selectedMetrics}
        title="Evolución de Composición Corporal"
        subtitle={`Últimos ${timeframe} de datos`}
        height={350}
        colors={selectedMetrics.map(metric => metricsConfig[metric]?.color || '#0ea5e9')}
        showLegend={true}
        showGrid={true}
      />

      {/* Métricas individuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {selectedMetrics.map(metric => {
          const config = metricsConfig[metric];
          const metricAnalysis = analysisData?.analysis?.[metric];
          
          if (!config || !metricAnalysis) return null;

          return (
            <StatsCard
              key={metric}
              title={config.label}
              value={config.format(metricAnalysis.current)}
              change={metricAnalysis.percentChange}
              trend={metricAnalysis.trend}
              icon={config.icon}
              iconColor={config.color.replace('#', 'text-')}
              iconBgColor={config.color.replace('#', 'bg-').replace('text-', '') + '20'}
              description={`Desde inicio: ${metricAnalysis.totalPercentChange > 0 ? '+' : ''}${metricAnalysis.totalPercentChange.toFixed(1)}%`}
              badge={
                metricAnalysis.isInIdealRange !== null ? {
                  text: metricAnalysis.isInIdealRange ? 'Ideal' : 'Fuera de rango',
                  variant: metricAnalysis.isInIdealRange ? 'success' : 'warning'
                } : null
              }
            />
          );
        })}
      </div>
    </div>
  );

  // Render vista de comparación
  const renderComparisonView = () => (
    <div className="space-y-6">
      {/* Gráfico de área comparativo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Comparación Temporal</h3>
          <div className="flex space-x-2">
            {Object.keys(metricsConfig).map(metric => (
              <Button
                key={metric}
                size="sm"
                variant={selectedMetrics.includes(metric) ? "default" : "outline"}
                onClick={() => {
                  if (selectedMetrics.includes(metric)) {
                    setSelectedMetrics(prev => prev.filter(m => m !== metric));
                  } else {
                    setSelectedMetrics(prev => [...prev, metric]);
                  }
                }}
                style={{ 
                  backgroundColor: selectedMetrics.includes(metric) ? metricsConfig[metric].color : undefined,
                  borderColor: metricsConfig[metric].color
                }}
              >
                {metricsConfig[metric].label}
              </Button>
            ))}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.map((metric) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stackId="1"
                stroke={metricsConfig[metric].color}
                fill={metricsConfig[metric].color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla comparativa */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Comparativa Detallada</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Métrica</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anterior</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cambio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Objetivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedMetrics.map(metric => {
                const config = metricsConfig[metric];
                const metricAnalysis = analysisData?.analysis?.[metric];
                const goal = goals[`target${metric.charAt(0).toUpperCase() + metric.slice(1)}`];
                
                if (!config || !metricAnalysis) return null;

                return (
                  <tr key={metric}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <config.icon className="w-4 h-4 mr-2" style={{ color: config.color }} />
                        <span className="text-sm font-medium text-gray-900">{config.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {config.format(metricAnalysis.current)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {config.format(metricAnalysis.previous)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {metricAnalysis.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : metricAnalysis.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        ) : (
                          <span className="w-4 h-4 mr-1" />
                        )}
                        <span className={`text-sm ${
                          metricAnalysis.trend === 'up' ? 'text-green-600' :
                          metricAnalysis.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metricAnalysis.percentChange > 0 ? '+' : ''}
                          {metricAnalysis.percentChange.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {goal ? config.format(goal) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {metricAnalysis.isInIdealRange !== null && (
                        <Badge 
                          variant={metricAnalysis.isInIdealRange ? 'success' : 'warning'}
                          size="sm"
                        >
                          {metricAnalysis.isInIdealRange ? 'Ideal' : 'Fuera de rango'}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render vista de análisis
  const renderAnalysisView = () => (
    <div className="space-y-6">
      {/* Distribución de composición corporal */}
      {bodyCompositionBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de pastel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución Corporal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bodyCompositionBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bodyCompositionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Detalles de composición */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Composición</h3>
            <div className="space-y-4">
              {bodyCompositionBreakdown.map((component, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: component.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">{component.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {component.value.toFixed(1)} kg
                    </div>
                    <div className="text-xs text-gray-500">
                      {component.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Análisis de rangos saludables */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluación de Salud</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(metricsConfig).map(metric => {
            const config = metricsConfig[metric];
            const metricAnalysis = analysisData?.analysis?.[metric];
            
            if (!config?.idealRange || !metricAnalysis) return null;

            const { min, max } = config.idealRange;
            const current = metricAnalysis.current;
            const isIdeal = current >= min && current <= max;
            
            return (
              <div key={metric} className={`p-4 rounded-lg border-2 ${
                isIdeal ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <config.icon className={`w-5 h-5 ${isIdeal ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="font-medium text-gray-900">{config.label}</span>
                </div>
                
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {config.format(current)}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  Rango ideal: {config.format(min)} - {config.format(max)}
                </div>
                
                <Badge 
                  variant={isIdeal ? 'success' : 'warning'}
                  size="sm"
                >
                  {isIdeal ? 'En rango ideal' : 'Fuera de rango'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
        <div className="space-y-3">
          {generateRecommendations(analysisData, goals).map((recommendation, index) => (
            <div key={index} className={`p-3 rounded-lg border-l-4 ${
              recommendation.type === 'success' ? 'border-green-500 bg-green-50' :
              recommendation.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-start space-x-2">
                <Info className={`w-4 h-4 mt-0.5 ${
                  recommendation.type === 'success' ? 'text-green-600' :
                  recommendation.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <div className="font-medium text-gray-900">{recommendation.title}</div>
                  <div className="text-sm text-gray-600">{recommendation.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Generar recomendaciones basadas en los datos
  const generateRecommendations = (analysisData, goals) => {
    const recommendations = [];
    
    if (!analysisData?.analysis) return recommendations;

    // Análisis de grasa corporal
    const bodyFatAnalysis = analysisData.analysis.bodyFat;
    if (bodyFatAnalysis) {
      if (bodyFatAnalysis.trend === 'down' && bodyFatAnalysis.percentChange < -2) {
        recommendations.push({
          type: 'success',
          title: 'Excelente progreso en pérdida de grasa',
          description: `Has reducido tu grasa corporal un ${Math.abs(bodyFatAnalysis.percentChange).toFixed(1)}%. ¡Sigue así!`
        });
      } else if (bodyFatAnalysis.trend === 'up' && bodyFatAnalysis.percentChange > 2) {
        recommendations.push({
          type: 'warning',
          title: 'Aumento en grasa corporal detectado',
          description: 'Considera revisar tu dieta y aumentar la actividad cardiovascular.'
        });
      }
    }

    // Análisis de peso
    const weightAnalysis = analysisData.analysis.weight;
    if (weightAnalysis && goals.targetWeight) {
      const distanceToGoal = Math.abs(weightAnalysis.current - goals.targetWeight);
      if (distanceToGoal <= 1) {
        recommendations.push({
          type: 'success',
          title: 'Muy cerca de tu objetivo de peso',
          description: `Solo te faltan ${distanceToGoal.toFixed(1)}kg para alcanzar tu meta.`
        });
      }
    }

    return recommendations;
  };

  const viewOptions = [
    { id: 'trend', label: 'Tendencias', icon: TrendingUp },
    { id: 'comparison', label: 'Comparación', icon: BarChart3 },
    { id: 'analysis', label: 'Análisis', icon: Activity }
  ];

  if (!analysisData) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <div className="text-gray-500 mb-2">No hay datos de composición corporal</div>
        <div className="text-sm text-gray-400">Los datos aparecerán aquí cuando registres mediciones</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Composición Corporal</h2>
          <p className="text-gray-600">
            Análisis de {analysisData.dataPoints} mediciones desde {new Date(analysisData.dateRange.start).toLocaleDateString('es-ES')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Selector de vista */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {viewOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedView(option.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    selectedView === option.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-1" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido según la vista seleccionada */}
      {selectedView === 'trend' && renderTrendView()}
      {selectedView === 'comparison' && renderComparisonView()}
      {selectedView === 'analysis' && renderAnalysisView()}
    </div>
  );
};

export default BodyComposition;