// components/profile/GoalsTab.jsx
import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  Target, 
  Plus, 
  Edit, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Trash2,
  BarChart3,
  Award,
  Flag,
  Timer,
  Zap,
  Activity,
  Scale,
  Dumbbell
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button, Card, Badge, Modal, Input, Select } from '../ui';
import { EmptyState } from '../shared';
import toast from 'react-hot-toast';

const GoalsTab = ({
  goals = [],
  currentMeasurements = {},
  currentStats = {},
  onUpdate = () => {},
  onAdd = () => {},
  onDelete = () => {},
  className = '',
  ...props
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards, list, progress

  // Categorías de objetivos
  const goalCategories = {
    fitness: {
      label: 'Fitness',
      icon: Activity,
      color: 'bg-blue-100 text-blue-700'
    },
    strength: {
      label: 'Fuerza',
      icon: Dumbbell,
      color: 'bg-red-100 text-red-700'
    },
    body: {
      label: 'Composición Corporal',
      icon: Scale,
      color: 'bg-green-100 text-green-700'
    },
    performance: {
      label: 'Rendimiento',
      icon: Zap,
      color: 'bg-yellow-100 text-yellow-700'
    },
    habit: {
      label: 'Hábitos',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-700'
    }
  };

  // Tipos de objetivos predefinidos
  const goalTemplates = {
    // Objetivos de peso
    weight_loss: {
      title: 'Perder Peso',
      category: 'body',
      type: 'numeric',
      unit: 'kg',
      targetKey: 'weight',
      description: 'Reducir peso corporal'
    },
    weight_gain: {
      title: 'Ganar Peso',
      category: 'body',
      type: 'numeric',
      unit: 'kg',
      targetKey: 'weight',
      description: 'Incrementar peso corporal'
    },
    body_fat: {
      title: 'Reducir Grasa Corporal',
      category: 'body',
      type: 'numeric',
      unit: '%',
      targetKey: 'bodyFat',
      description: 'Disminuir porcentaje de grasa'
    },
    muscle_gain: {
      title: 'Ganar Masa Muscular',
      category: 'body',
      type: 'numeric',
      unit: 'kg',
      targetKey: 'muscleMass',
      description: 'Incrementar masa muscular'
    },
    
    // Objetivos de fuerza
    bench_press: {
      title: 'Press de Banca',
      category: 'strength',
      type: 'numeric',
      unit: 'kg',
      targetKey: 'benchPress',
      description: 'Récord en press de banca'
    },
    squat: {
      title: 'Sentadilla',
      category: 'strength',
      type: 'numeric',
      unit: 'kg',
      targetKey: 'squat',
      description: 'Récord en sentadilla'
    },
    deadlift: {
      title: 'Peso Muerto',
      category: 'strength',
      type: 'numeric',
      unit: 'kg',
      targetKey: 'deadlift',
      description: 'Récord en peso muerto'
    },
    
    // Objetivos de fitness
    workouts_per_week: {
      title: 'Entrenamientos por Semana',
      category: 'fitness',
      type: 'numeric',
      unit: 'entrenamientos',
      targetKey: 'weeklyWorkouts',
      description: 'Frecuencia de entrenamiento semanal'
    },
    workout_streak: {
      title: 'Racha de Entrenamientos',
      category: 'habit',
      type: 'numeric',
      unit: 'días',
      targetKey: 'workoutStreak',
      description: 'Días consecutivos entrenando'
    },
    
    // Objetivos de rendimiento
    running_time: {
      title: 'Tiempo de Carrera (5K)',
      category: 'performance',
      type: 'time',
      unit: 'min',
      targetKey: 'running5k',
      description: 'Mejorar tiempo en 5 kilómetros'
    }
  };

  // Filtrar objetivos por categoría
  const filteredGoals = useMemo(() => {
    if (selectedCategory === 'all') return goals;
    return goals.filter(goal => goal.category === selectedCategory);
  }, [goals, selectedCategory]);

  // Calcular progreso de un objetivo
  const calculateProgress = (goal) => {
    if (!goal.targetKey || !goal.targetValue) return 0;
    
    let currentValue = currentMeasurements[goal.targetKey] || currentStats[goal.targetKey] || 0;
    
    if (goal.type === 'time') {
      // Para objetivos de tiempo, menor es mejor
      return goal.currentValue ? Math.max(0, 100 - ((goal.currentValue - goal.targetValue) / goal.targetValue) * 100) : 0;
    }
    
    if (goal.isReduction) {
      // Para objetivos de reducción (peso, grasa corporal)
      const totalReduction = goal.startValue - goal.targetValue;
      const currentReduction = goal.startValue - currentValue;
      return totalReduction > 0 ? Math.min(100, (currentReduction / totalReduction) * 100) : 0;
    }
    
    // Para objetivos de incremento
    return goal.startValue ? Math.min(100, ((currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100) : 0;
  };

  // Obtener estado del objetivo
  const getGoalStatus = (goal) => {
    const progress = calculateProgress(goal);
    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    
    if (progress >= 100) return { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    if (daysLeft !== null && daysLeft < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-700', icon: AlertCircle };
    if (daysLeft !== null && daysLeft <= 7) return { label: 'Urgente', color: 'bg-orange-100 text-orange-700', icon: Clock };
    if (progress >= 75) return { label: 'Casi listo', color: 'bg-blue-100 text-blue-700', icon: TrendingUp };
    return { label: 'En progreso', color: 'bg-gray-100 text-gray-700', icon: Target };
  };

  // Manejar edición de objetivo
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowEditModal(true);
  };

  // Manejar eliminación de objetivo
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este objetivo?')) {
      onDelete(goalId);
      toast.success('Objetivo eliminado');
    }
  };

  // Renderizar vista de tarjetas
  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGoals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          progress={calculateProgress(goal)}
          status={getGoalStatus(goal)}
          onEdit={() => handleEditGoal(goal)}
          onDelete={() => handleDeleteGoal(goal.id)}
        />
      ))}
    </div>
  );

  // Renderizar vista de lista
  const renderListView = () => (
    <Card>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Objetivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Límite
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGoals.map(goal => {
              const progress = calculateProgress(goal);
              const status = getGoalStatus(goal);
              
              return (
                <tr key={goal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={clsx(
                        'p-2 rounded-lg mr-3',
                        goalCategories[goal.category]?.color || 'bg-gray-100 text-gray-600'
                      )}>
                        {React.createElement(goalCategories[goal.category]?.icon || Target, { 
                          className: "w-4 h-4" 
                        })}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{goal.title}</div>
                        <div className="text-sm text-gray-500">{goal.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900 min-w-0">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={status.color} size="sm">
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                        icon={<Edit className="w-4 h-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // Renderizar vista de progreso
  const renderProgressView = () => (
    <div className="space-y-6">
      {Object.entries(goalCategories).map(([categoryKey, category]) => {
        const categoryGoals = filteredGoals.filter(goal => goal.category === categoryKey);
        if (categoryGoals.length === 0) return null;
        
        return (
          <Card key={categoryKey}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className={clsx('p-2 rounded-lg mr-3', category.color)}>
                  <category.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
                <Badge variant="outline" size="sm" className="ml-2">
                  {categoryGoals.length}
                </Badge>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryGoals.map(goal => (
                  <ProgressCard
                    key={goal.id}
                    goal={goal}
                    progress={calculateProgress(goal)}
                    status={getGoalStatus(goal)}
                  />
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className={clsx('space-y-6', className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Objetivos</h2>
          <p className="text-gray-600">Define y sigue tus metas de fitness</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Objetivo
        </Button>
      </div>

      {/* Filtros y controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Categoría:</span>
            <Select
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value)}
              className="w-40"
            >
              <option value="all">Todas</option>
              {Object.entries(goalCategories).map(([key, category]) => (
                <option key={key} value={key}>{category.label}</option>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-gray-200 p-1">
            {[
              { key: 'cards', label: 'Tarjetas', icon: BarChart3 },
              { key: 'list', label: 'Lista', icon: Target },
              { key: 'progress', label: 'Progreso', icon: TrendingUp }
            ].map(view => (
              <button
                key={view.key}
                onClick={() => setViewMode(view.key)}
                className={clsx(
                  'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                  viewMode === view.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <view.icon className="w-4 h-4 mr-2" />
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-semibold">{goals.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-xl font-semibold">
                {goals.filter(goal => calculateProgress(goal) >= 100).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En progreso</p>
              <p className="text-xl font-semibold">
                {goals.filter(goal => {
                  const progress = calculateProgress(goal);
                  return progress > 0 && progress < 100;
                }).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progreso promedio</p>
              <p className="text-xl font-semibold">
                {goals.length > 0 ? 
                  Math.round(goals.reduce((acc, goal) => acc + calculateProgress(goal), 0) / goals.length) : 0
                }%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Contenido principal */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          type="default"
          title="No hay objetivos"
          description={selectedCategory === 'all' 
            ? "Crea tu primer objetivo para comenzar a seguir tu progreso"
            : `No hay objetivos en la categoría ${goalCategories[selectedCategory]?.label}`
          }
          action={{
            label: 'Crear Objetivo',
            onClick: () => setShowAddModal(true)
          }}
        />
      ) : (
        <>
          {viewMode === 'cards' && renderCardsView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'progress' && renderProgressView()}
        </>
      )}

      {/* Modales */}
      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(goalData) => {
          onAdd(goalData);
          setShowAddModal(false);
          toast.success('Objetivo creado correctamente');
        }}
        goalTemplates={goalTemplates}
        goalCategories={goalCategories}
        currentMeasurements={currentMeasurements}
      />

      <EditGoalModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={(goalData) => {
          onUpdate(editingGoal.id, goalData);
          setShowEditModal(false);
          setEditingGoal(null);
          toast.success('Objetivo actualizado');
        }}
        goalCategories={goalCategories}
      />
    </div>
  );
};

// Componente para tarjeta de objetivo
const GoalCard = ({ goal, progress, status, onEdit, onDelete }) => (
  <Card className="overflow-hidden">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={clsx(
            'p-2 rounded-lg mr-3',
            goal.category === 'fitness' ? 'bg-blue-100 text-blue-700' :
            goal.category === 'strength' ? 'bg-red-100 text-red-700' :
            goal.category === 'body' ? 'bg-green-100 text-green-700' :
            goal.category === 'performance' ? 'bg-yellow-100 text-yellow-700' :
            'bg-purple-100 text-purple-700'
          )}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{goal.title}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            icon={<Edit className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            icon={<Trash2 className="w-4 h-4" />}
            className="text-red-600 hover:text-red-700"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progreso</span>
          <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge className={status.color} size="sm">
          <status.icon className="w-3 h-3 mr-1" />
          {status.label}
        </Badge>
        {goal.deadline && (
          <span className="text-xs text-gray-500">
            {new Date(goal.deadline).toLocaleDateString('es-ES')}
          </span>
        )}
      </div>

      {goal.targetValue && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Meta:</span> {goal.targetValue} {goal.unit}
          </p>
        </div>
      )}
    </div>
  </Card>
);

// Componente para tarjeta de progreso
const ProgressCard = ({ goal, progress, status }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-sm">{goal.title}</h4>
        <p className="text-xs text-gray-600">{goal.description}</p>
      </div>
      <div className="w-12 h-12 ml-3">
        <CircularProgressbar
          value={Math.min(progress, 100)}
          text={`${progress.toFixed(0)}%`}
          styles={buildStyles({
            textSize: '24px',
            pathColor: progress >= 100 ? '#10B981' : '#3B82F6',
            textColor: '#374151',
            trailColor: '#E5E7EB'
          })}
        />
      </div>
    </div>
    <Badge className={status.color} size="sm">
      {status.label}
    </Badge>
  </div>
);

// Modal para agregar objetivo
const AddGoalModal = ({ isOpen, onClose, onSave, goalTemplates, goalCategories, currentMeasurements }) => {
  const [formData, setFormData] = useState({
    template: '',
    title: '',
    description: '',
    category: 'fitness',
    type: 'numeric',
    targetValue: '',
    unit: '',
    deadline: '',
    isReduction: false,
    startValue: '',
    notes: ''
  });

  const handleTemplateChange = (templateKey) => {
    const template = goalTemplates[templateKey];
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: templateKey,
        title: template.title,
        description: template.description,
        category: template.category,
        type: template.type,
        unit: template.unit,
        startValue: currentMeasurements[template.targetKey] || '',
        isReduction: ['weight_loss', 'body_fat'].includes(templateKey)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const goalData = {
      id: Date.now().toString(),
      ...formData,
      targetKey: goalTemplates[formData.template]?.targetKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(goalData);
    setFormData({
      template: '',
      title: '',
      description: '',
      category: 'fitness',
      type: 'numeric',
      targetValue: '',
      unit: '',
      deadline: '',
      isReduction: false,
      startValue: '',
      notes: ''
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Objetivo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Plantilla de Objetivo"
          value={formData.template}
          onChange={(value) => handleTemplateChange(value)}
          placeholder="Selecciona una plantilla o crea uno personalizado"
        >
          <option value="">Objetivo personalizado</option>
          {Object.entries(goalTemplates).map(([key, template]) => (
            <option key={key} value={key}>{template.title}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <Select
            label="Categoría"
            value={formData.category}
            onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            required
          >
            {Object.entries(goalCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.label}</option>
            ))}
          </Select>
        </div>

        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            step="0.1"
            label="Valor Objetivo"
            value={formData.targetValue}
            onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
            required
          />
          
          <Input
            label="Unidad"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            placeholder="kg, %, min, etc."
          />
          
          <Input
            type="number"
            step="0.1"
            label="Valor Inicial"
            value={formData.startValue}
            onChange={(e) => setFormData(prev => ({ ...prev, startValue: e.target.value }))}
          />
        </div>

        <Input
          type="date"
          label="Fecha Límite (opcional)"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
        />

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
            Crear Objetivo
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal para editar objetivo
const EditGoalModal = ({ isOpen, onClose, goal, onSave, goalCategories }) => {
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (goal) {
      setFormData(goal);
    }
  }, [goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
  };

  if (!goal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Objetivo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Título"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <Select
            label="Categoría"
            value={formData.category || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            required
          >
            {Object.entries(goalCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.label}</option>
            ))}
          </Select>
        </div>

        <Input
          label="Descripción"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            step="0.1"
            label="Valor Objetivo"
            value={formData.targetValue || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
            required
          />
          
          <Input
            label="Unidad"
            value={formData.unit || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
          />
          
          <Input
            type="number"
            step="0.1"
            label="Valor Inicial"
            value={formData.startValue || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, startValue: e.target.value }))}
          />
        </div>

        <Input
          type="date"
          label="Fecha Límite"
          value={formData.deadline || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
        />

        <Input
          type="textarea"
          label="Notas"
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Actualizar Objetivo
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalsTab;