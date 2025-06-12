// components/profile/MeasurementsTab.jsx
import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  Scale, 
  Ruler, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Plus,
  Calendar,
  BarChart3,
  Target,
  Info,
  Download,
  Upload,
  Camera
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Button, Card, Badge, Modal, Input, Select } from '../ui';
import { EmptyState } from '../shared';
import toast from 'react-hot-toast';

const MeasurementsTab = ({
  measurements = {},
  history = [],
  onUpdate = () => {},
  onAddMeasurement = () => {},
  className = '',
  ...props
}) => {
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [timeRange, setTimeRange] = useState('3m'); // 1m, 3m, 6m, 1y, all
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, progress

  // Configuración de métricas
  const metricsConfig = {
    weight: {
      label: 'Peso',
      unit: 'kg',
      icon: Scale,
      color: '#3B82F6',
      target: measurements.goals?.targetWeight,
      category: 'primary'
    },
    bodyFat: {
      label: 'Grasa Corporal',
      unit: '%',
      icon: Activity,
      color: '#EF4444',
      target: measurements.goals?.targetBodyFat,
      category: 'primary'
    },
    muscleMass: {
      label: 'Masa Muscular',
      unit: 'kg',
      icon: TrendingUp,
      color: '#10B981',
      target: measurements.goals?.targetMuscleMass,
      category: 'primary'
    },
    bmi: {
      label: 'IMC',
      unit: '',
      icon: BarChart3,
      color: '#8B5CF6',
      category: 'calculated'
    },
    waist: {
      label: 'Cintura',
      unit: 'cm',
      icon: Ruler,
      color: '#F59E0B',
      category: 'body'
    },
    chest: {
      label: 'Pecho',
      unit: 'cm',
      icon: Ruler,
      color: '#06B6D4',
      category: 'body'
    },
    arms: {
      label: 'Brazos',
      unit: 'cm',
      icon: Ruler,
      color: '#84CC16',
      category: 'body'
    },
    thighs: {
      label: 'Muslos',
      unit: 'cm',
      icon: Ruler,
      color: '#F97316',
      category: 'body'
    },
    neck: {
      label: 'Cuello',
      unit: 'cm',
      icon: Ruler,
      color: '#EC4899',
      category: 'body'
    }
  };

  // Filtrar historial por rango de tiempo
  const filteredHistory = useMemo(() => {
    if (!history.length) return [];
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return history;
    }
    
    return history.filter(entry => new Date(entry.date) >= startDate);
  }, [history, timeRange]);

  // Calcular tendencias
  const calculateTrend = (metric) => {
    if (filteredHistory.length < 2) return null;
    
    const recent = filteredHistory.slice(-2);
    const change = recent[1][metric] - recent[0][metric];
    const percentage = (change / recent[0][metric]) * 100;
    
    return {
      change,
      percentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  // Calcular IMC
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
  };

  // Clasificar IMC
  const classifyBMI = (bmi) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-600 bg-blue-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600 bg-green-100' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Obesidad', color: 'text-red-600 bg-red-100' };
  };

  // Renderizar vista principal
  const renderOverviewView = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(metricsConfig)
          .filter(([key, config]) => config.category === 'primary' || key === 'bmi')
          .map(([key, config]) => {
            const value = key === 'bmi' 
              ? calculateBMI(measurements.weight, measurements.height)
              : measurements[key];
            const trend = calculateTrend(key);
            
            return (
              <MetricCard
                key={key}
                label={config.label}
                value={value}
                unit={config.unit}
                icon={config.icon}
                color={config.color}
                trend={trend}
                target={config.target}
                onClick={() => setSelectedMetric(key)}
                selected={selectedMetric === key}
              />
            );
          })}
      </div>

      {/* Gráfico principal */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Progreso de {metricsConfig[selectedMetric]?.label}
              </h3>
              <div className="flex items-center space-x-2">
                {['1m', '3m', '6m', '1y', 'all'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={clsx(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      timeRange === range
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {range === 'all' ? 'Todo' : range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <Badge variant="outline" size="sm">
              {filteredHistory.length} registros
            </Badge>
          </div>
        </div>
        <div className="p-6">
          {filteredHistory.length > 0 ? (
            <ProgressChart
              data={filteredHistory}
              metric={selectedMetric}
              config={metricsConfig[selectedMetric]}
            />
          ) : (
            <EmptyState
              type="default"
              title="No hay datos suficientes"
              description="Agrega más mediciones para ver el progreso"
              size="sm"
            />
          )}
        </div>
      </Card>

      {/* Medidas corporales */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Medidas Corporales</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                icon={<Edit className="w-4 h-4" />}
              >
                Editar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Agregar
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(metricsConfig)
              .filter(([key, config]) => config.category === 'body')
              .map(([key, config]) => (
                <MeasurementItem
                  key={key}
                  label={config.label}
                  value={measurements[key]}
                  unit={config.unit}
                  icon={config.icon}
                  trend={calculateTrend(key)}
                />
              ))}
          </div>
          
          {measurements.lastUpdated && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Última actualización: {new Date(measurements.lastUpdated).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Análisis IMC
            </h4>
            {measurements.weight && measurements.height ? (
              <BMIAnalysis 
                weight={measurements.weight}
                height={measurements.height}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Agrega peso y altura para ver el análisis
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Objetivos
            </h4>
            <GoalsProgress measurements={measurements} />
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className={clsx('space-y-6', className)} {...props}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medidas Corporales</h2>
          <p className="text-gray-600">Registra y sigue tu progreso físico</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-4 h-4" />}
          >
            Importar
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Nueva Medición
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      {renderOverviewView()}

      {/* Modales */}
      <AddMeasurementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(data) => {
          onAddMeasurement(data);
          setShowAddModal(false);
          toast.success('Medición agregada correctamente');
        }}
        metricsConfig={metricsConfig}
      />

      <EditMeasurementModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentMeasurements={measurements}
        onSave={(data) => {
          onUpdate(data);
          setShowEditModal(false);
          toast.success('Mediciones actualizadas');
        }}
        metricsConfig={metricsConfig}
      />
    </div>
  );
};

// Componente para tarjeta de métrica
const MetricCard = ({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  color, 
  trend, 
  target, 
  onClick,
  selected = false 
}) => (
  <Card 
    className={clsx(
      'cursor-pointer transition-all duration-200 hover:shadow-md',
      selected && 'ring-2 ring-primary-500'
    )}
    onClick={onClick}
  >
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <div className={clsx(
            'flex items-center text-xs',
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
          )}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="w-3 h-3 mr-1" />
            ) : null}
            {Math.abs(trend.percentage).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value ? `${value}${unit}` : '—'}
        </p>
        {target && (
          <p className="text-xs text-gray-500">
            Objetivo: {target}{unit}
          </p>
        )}
      </div>
    </div>
  </Card>
);

// Componente para item de medida
const MeasurementItem = ({ label, value, unit, icon: Icon, trend }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-4 h-4 text-gray-400" />
      {trend && (
        <div className={clsx(
          'text-xs',
          trend.direction === 'up' ? 'text-green-600' : 
          trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
        )}>
          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}
        </div>
      )}
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="font-semibold text-gray-900">
      {value ? `${value}${unit}` : '—'}
    </p>
  </div>
);

// Componente para gráfico de progreso
const ProgressChart = ({ data, metric, config }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { 
            month: 'short', 
            day: 'numeric' 
          })}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
          formatter={(value) => [`${value}${config.unit}`, config.label]}
        />
        <Area
          type="monotone"
          dataKey={metric}
          stroke={config.color}
          fill={config.color + '20'}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Componente para análisis IMC
const BMIAnalysis = ({ weight, height }) => {
  const bmi = calculateBMI(weight, height);
  const classification = classifyBMI(parseFloat(bmi));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Tu IMC:</span>
        <span className="text-lg font-semibold">{bmi}</span>
      </div>
      <Badge className={classification.color} size="sm">
        {classification.label}
      </Badge>
      <div className="text-xs text-gray-500">
        <p>Rango normal: 18.5 - 24.9</p>
      </div>
    </div>
  );
};

// Componente para progreso de objetivos
const GoalsProgress = ({ measurements }) => {
  const goals = measurements.goals || {};
  
  if (!Object.keys(goals).length) {
    return (
      <p className="text-sm text-gray-500">
        No hay objetivos configurados
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {goals.targetWeight && (
        <GoalItem
          label="Peso objetivo"
          current={measurements.weight}
          target={goals.targetWeight}
          unit="kg"
        />
      )}
      {goals.targetBodyFat && (
        <GoalItem
          label="Grasa corporal"
          current={measurements.bodyFat}
          target={goals.targetBodyFat}
          unit="%"
        />
      )}
    </div>
  );
};

// Componente para item de objetivo
const GoalItem = ({ label, current, target, unit }) => {
  const progress = current && target ? (current / target) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Modal para agregar medición
const AddMeasurementModal = ({ isOpen, onClose, onSave, metricsConfig }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    waist: '',
    chest: '',
    arms: '',
    thighs: '',
    neck: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => value !== '')
    );
    onSave(cleanData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      waist: '',
      chest: '',
      arms: '',
      thighs: '',
      neck: '',
      notes: ''
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Medición">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="date"
          label="Fecha"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(metricsConfig)
            .filter(([key]) => key !== 'bmi')
            .map(([key, config]) => (
              <Input
                key={key}
                type="number"
                step="0.1"
                label={`${config.label} (${config.unit})`}
                value={formData[key]}
                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
              />
            ))}
        </div>

        <Input
          type="textarea"
          label="Notas (opcional)"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Medición
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal para editar medición actual
const EditMeasurementModal = ({ isOpen, onClose, currentMeasurements, onSave, metricsConfig }) => {
  const [formData, setFormData] = useState(currentMeasurements || {});

  React.useEffect(() => {
    setFormData(currentMeasurements || {});
  }, [currentMeasurements]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Medidas Actuales">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(metricsConfig)
            .filter(([key]) => key !== 'bmi')
            .map(([key, config]) => (
              <Input
                key={key}
                type="number"
                step="0.1"
                label={`${config.label} (${config.unit})`}
                value={formData[key] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
              />
            ))}
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Actualizar Medidas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MeasurementsTab;