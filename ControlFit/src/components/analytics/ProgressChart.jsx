import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  RadialBar,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Activity,
  Filter,
  Download,
  Maximize2,
  Info
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const ProgressChart = ({
  data = [],
  type = 'line', // 'line', 'bar', 'area', 'pie', 'radial', 'composed'
  metrics = [], // Array de métricas a mostrar
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  timeFormat = 'auto', // 'auto', 'date', 'month', 'week'
  colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  loading = false,
  error = null,
  onExport,
  onFullscreen,
  className = ''
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState(metrics);
  const [showFilters, setShowFilters] = useState(false);

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => {
      const processedItem = { ...item };
      
      // Formatear fechas
      if (item.date) {
        const date = new Date(item.date);
        switch (timeFormat) {
          case 'date':
            processedItem.formattedDate = date.toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit' 
            });
            break;
          case 'month':
            processedItem.formattedDate = date.toLocaleDateString('es-ES', { 
              month: 'short',
              year: '2-digit'
            });
            break;
          case 'week':
            const weekNum = Math.ceil((date.getDate()) / 7);
            processedItem.formattedDate = `S${weekNum}`;
            break;
          default:
            processedItem.formattedDate = date.toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit' 
            });
        }
      }

      return processedItem;
    });
  }, [data, timeFormat]);

  // Calcular estadísticas de tendencia
  const trendStats = useMemo(() => {
    if (chartData.length < 2) return {};

    const stats = {};
    
    selectedMetrics.forEach(metric => {
      const values = chartData.map(item => item[metric]).filter(val => val !== null && val !== undefined);
      
      if (values.length >= 2) {
        const first = values[0];
        const last = values[values.length - 1];
        const change = last - first;
        const percentChange = first !== 0 ? (change / first) * 100 : 0;
        
        stats[metric] = {
          first,
          last,
          change,
          percentChange,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
      }
    });

    return stats;
  }, [chartData, selectedMetrics]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.unit && ` ${entry.unit}`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar gráfico de líneas
  const renderLineChart = () => (
    <LineChart data={chartData}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
      <XAxis 
        dataKey="formattedDate" 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      <YAxis 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      {showTooltip && <Tooltip content={<CustomTooltip />} />}
      {showLegend && <Legend />}
      {selectedMetrics.map((metric, index) => (
        <Line
          key={metric}
          type="monotone"
          dataKey={metric}
          stroke={colors[index % colors.length]}
          strokeWidth={2}
          dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
        />
      ))}
    </LineChart>
  );

  // Renderizar gráfico de barras
  const renderBarChart = () => (
    <BarChart data={chartData}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
      <XAxis 
        dataKey="formattedDate" 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      <YAxis 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      {showTooltip && <Tooltip content={<CustomTooltip />} />}
      {showLegend && <Legend />}
      {selectedMetrics.map((metric, index) => (
        <Bar
          key={metric}
          dataKey={metric}
          fill={colors[index % colors.length]}
          radius={[2, 2, 0, 0]}
        />
      ))}
    </BarChart>
  );

  // Renderizar gráfico de área
  const renderAreaChart = () => (
    <AreaChart data={chartData}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
      <XAxis 
        dataKey="formattedDate" 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      <YAxis 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      {showTooltip && <Tooltip content={<CustomTooltip />} />}
      {showLegend && <Legend />}
      {selectedMetrics.map((metric, index) => (
        <Area
          key={metric}
          type="monotone"
          dataKey={metric}
          stroke={colors[index % colors.length]}
          fill={colors[index % colors.length]}
          fillOpacity={0.3}
          strokeWidth={2}
        />
      ))}
    </AreaChart>
  );

  // Renderizar gráfico de pastel
  const renderPieChart = () => {
    const pieData = chartData[chartData.length - 1] || {};
    const pieEntries = selectedMetrics.map((metric, index) => ({
      name: metric,
      value: pieData[metric] || 0,
      color: colors[index % colors.length]
    }));

    return (
      <PieChart>
        <Pie
          data={pieEntries}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieEntries.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {showTooltip && <Tooltip />}
      </PieChart>
    );
  };

  // Renderizar gráfico radial
  const renderRadialChart = () => {
    const radialData = chartData[chartData.length - 1] || {};
    const maxValue = Math.max(...selectedMetrics.map(metric => radialData[metric] || 0));
    
    const radialEntries = selectedMetrics.map((metric, index) => ({
      name: metric,
      value: ((radialData[metric] || 0) / maxValue) * 100,
      fill: colors[index % colors.length]
    }));

    return (
      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={radialEntries}>
        <RadialBar dataKey="value" cornerRadius={4} fill="#8884d8" />
        {showTooltip && <Tooltip />}
      </RadialBarChart>
    );
  };

  // Renderizar gráfico compuesto
  const renderComposedChart = () => (
    <ComposedChart data={chartData}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
      <XAxis 
        dataKey="formattedDate" 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      <YAxis 
        tick={{ fontSize: 12 }}
        stroke="#64748b"
      />
      {showTooltip && <Tooltip content={<CustomTooltip />} />}
      {showLegend && <Legend />}
      {selectedMetrics.slice(0, 2).map((metric, index) => (
        <Line
          key={metric}
          type="monotone"
          dataKey={metric}
          stroke={colors[index]}
          strokeWidth={2}
          dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
        />
      ))}
      {selectedMetrics.slice(2).map((metric, index) => (
        <Bar
          key={metric}
          dataKey={metric}
          fill={colors[index + 2]}
          radius={[2, 2, 0, 0]}
        />
      ))}
    </ComposedChart>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'area':
        return renderAreaChart();
      case 'pie':
        return renderPieChart();
      case 'radial':
        return renderRadialChart();
      case 'composed':
        return renderComposedChart();
      default:
        return renderLineChart();
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error al cargar datos</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-500 mb-2">No hay datos disponibles</div>
          <div className="text-sm text-gray-400">Los datos aparecerán aquí cuando estén disponibles</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {metrics.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter className="w-4 h-4" />}
              />
            )}
            
            {onExport && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onExport}
                icon={<Download className="w-4 h-4" />}
              />
            )}
            
            {onFullscreen && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onFullscreen}
                icon={<Maximize2 className="w-4 h-4" />}
              />
            )}
          </div>
        </div>

        {/* Filtros de métricas */}
        {showFilters && metrics.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {metrics.map(metric => (
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
                className="text-xs"
              >
                {metric}
              </Button>
            ))}
          </div>
        )}

        {/* Estadísticas de tendencia */}
        {Object.keys(trendStats).length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(trendStats).map(([metric, stats]) => (
              <div key={metric} className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {getTrendIcon(stats.trend)}
                  <span className="text-sm font-medium text-gray-900">{metric}:</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600">{stats.last.toFixed(1)}</span>
                  <Badge 
                    size="sm"
                    className={`${getTrendColor(stats.trend)} bg-transparent border-0 text-xs`}
                  >
                    {stats.percentChange > 0 ? '+' : ''}{stats.percentChange.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Footer con información adicional */}
      {chartData.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {chartData.length} puntos de datos • Desde {chartData[0]?.formattedDate} hasta {chartData[chartData.length - 1]?.formattedDate}
            </span>
            <div className="flex items-center space-x-1">
              <Info className="w-3 h-3" />
              <span>Haz clic en la leyenda para mostrar/ocultar métricas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;