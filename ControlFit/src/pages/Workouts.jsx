// frontend/src/pages/Workouts.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Play,
  Clock,
  BarChart3,
  Copy,
  Edit,
  Trash2,
  Star,
  Calendar,
  Target,
  Activity,
  ChevronRight,
  BookOpen,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Input, Modal, Card, Badge } from '../components/ui';
import toast from 'react-hot-toast';

// Datos simulados
const mockData = {
  templates: [
    {
      id: '1',
      name: 'Push Day - Pecho y Tríceps',
      description: 'Entrenamiento enfocado en músculos de empuje',
      exercises: [
        { name: 'Press Banca', sets: 4, reps: '8-12' },
        { name: 'Press Inclinado', sets: 3, reps: '10-12' },
        { name: 'Fondos', sets: 3, reps: '12-15' },
        { name: 'Press Francés', sets: 3, reps: '10-12' }
      ],
      estimatedDuration: 65,
      difficulty: 'intermediate',
      timesUsed: 8,
      lastUsed: '2024-01-20',
      tags: ['pecho', 'triceps', 'fuerza'],
      isPublic: false
    },
    {
      id: '2',
      name: 'Pull Day - Espalda y Bíceps',
      description: 'Entrenamiento enfocado en músculos de tracción',
      exercises: [
        { name: 'Dominadas', sets: 4, reps: '6-10' },
        { name: 'Remo con Barra', sets: 4, reps: '8-12' },
        { name: 'Curl con Barra', sets: 3, reps: '10-12' },
        { name: 'Curl Martillo', sets: 3, reps: '12-15' }
      ],
      estimatedDuration: 60,
      difficulty: 'intermediate',
      timesUsed: 6,
      lastUsed: '2024-01-18',
      tags: ['espalda', 'biceps', 'fuerza'],
      isPublic: false
    },
    {
      id: '3',
      name: 'Leg Day - Piernas Completo',
      description: 'Entrenamiento completo de tren inferior',
      exercises: [
        { name: 'Sentadillas', sets: 4, reps: '8-12' },
        { name: 'Peso Muerto Rumano', sets: 3, reps: '10-12' },
        { name: 'Prensa', sets: 3, reps: '12-15' },
        { name: 'Curl Femoral', sets: 3, reps: '12-15' },
        { name: 'Extensión Cuádriceps', sets: 3, reps: '12-15' }
      ],
      estimatedDuration: 75,
      difficulty: 'advanced',
      timesUsed: 4,
      lastUsed: '2024-01-16',
      tags: ['piernas', 'glúteos', 'fuerza'],
      isPublic: false
    }
  ],
  recentSessions: [
    {
      id: '1',
      name: 'Push Day - Pecho y Tríceps',
      date: '2024-01-21',
      duration: 68,
      completed: true,
      metrics: { totalVolume: 1850, completedSets: 13, totalSets: 13 }
    },
    {
      id: '2',
      name: 'Pull Day - Espalda y Bíceps',
      date: '2024-01-19',
      duration: 62,
      completed: true,
      metrics: { totalVolume: 1720, completedSets: 12, totalSets: 14 }
    },
    {
      id: '3',
      name: 'Cardio HIIT',
      date: '2024-01-17',
      duration: 25,
      completed: true,
      metrics: { totalVolume: 0, completedSets: 8, totalSets: 8 }
    }
  ],
  exercises: [
    { id: '1', name: 'Press de Banca', category: 'strength', muscleGroups: ['pecho', 'triceps'], equipment: 'barbell' },
    { id: '2', name: 'Sentadillas', category: 'strength', muscleGroups: ['piernas', 'glúteos'], equipment: 'barbell' },
    { id: '3', name: 'Peso Muerto', category: 'strength', muscleGroups: ['espalda', 'piernas'], equipment: 'barbell' },
    { id: '4', name: 'Dominadas', category: 'strength', muscleGroups: ['espalda', 'biceps'], equipment: 'bodyweight' },
    { id: '5', name: 'Press Militar', category: 'strength', muscleGroups: ['hombros', 'triceps'], equipment: 'barbell' }
  ]
};

const Workouts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

  // Determinar la pestaña activa basada en la URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/sessions')) setActiveTab('sessions');
    else if (path.includes('/exercises')) setActiveTab('exercises');
    else setActiveTab('templates');
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'templates') navigate('/workouts');
    else navigate(`/workouts/${tab}`);
  };

  const handleStartWorkout = (template) => {
    console.log('Iniciando entrenamiento:', template.name);
    toast.success(`Iniciando ${template.name}`);
    // Aquí iría la lógica para iniciar el entrenamiento
  };

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      setData(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== templateId)
      }));
      toast.success('Plantilla eliminada correctamente');
    }
  };

  const handleDuplicateTemplate = (template) => {
    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copia)`,
      timesUsed: 0,
      lastUsed: null
    };
    
    setData(prev => ({
      ...prev,
      templates: [duplicated, ...prev.templates]
    }));
    
    toast.success('Plantilla duplicada correctamente');
  };

  const filteredTemplates = data.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
                           template.tags.includes(filterCategory) ||
                           template.difficulty === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredExercises = data.exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscleGroups.some(group => group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Entrenamientos</h1>
              <p className="mt-2 text-gray-600">
                Gestiona tus rutinas, ejercicios y sesiones de entrenamiento
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCreateTemplate}
                icon={<Plus className="w-4 h-4" />}
                className="bg-green-600 hover:bg-green-700"
              >
                Nueva Rutina
              </Button>
              <Button
                onClick={() => handleStartWorkout({ name: 'Entrenamiento Rápido' })}
                icon={<Play className="w-4 h-4" />}
              >
                Entrenar Ahora
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <nav className="flex space-x-8">
              {[
                { id: 'templates', name: 'Plantillas', icon: BookOpen },
                { id: 'sessions', name: 'Historial', icon: Calendar },
                { id: 'exercises', name: 'Ejercicios', icon: Dumbbell }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder={`Buscar ${activeTab === 'templates' ? 'plantillas' : activeTab === 'exercises' ? 'ejercicios' : 'sesiones'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="pecho">Pecho</option>
              <option value="espalda">Espalda</option>
              <option value="piernas">Piernas</option>
              <option value="hombros">Hombros</option>
            </select>
          </div>
        </div>

        {/* Content based on active tab */}
        <Routes>
          <Route path="/" element={
            <TemplatesView 
              templates={filteredTemplates}
              onStart={handleStartWorkout}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
              loading={loading}
            />
          } />
          <Route path="/sessions" element={
            <SessionsView sessions={data.recentSessions} loading={loading} />
          } />
          <Route path="/exercises" element={
            <ExercisesView exercises={filteredExercises} loading={loading} />
          } />
        </Routes>
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          exercises={data.exercises}
        />
      )}
    </div>
  );
};

// Vista de Plantillas
const TemplatesView = ({ templates, onStart, onEdit, onDelete, onDuplicate, loading }) => {
  if (loading) {
    return <LoadingView />;
  }

  if (templates.length === 0) {
    return <EmptyState type="templates" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onStart={onStart}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
};

// Vista de Sesiones
const SessionsView = ({ sessions, loading }) => {
  if (loading) {
    return <LoadingView />;
  }

  if (sessions.length === 0) {
    return <EmptyState type="sessions" />;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
};

// Vista de Ejercicios
const ExercisesView = ({ exercises, loading }) => {
  if (loading) {
    return <LoadingView />;
  }

  if (exercises.length === 0) {
    return <EmptyState type="exercises" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

// Componente de tarjeta de plantilla
const TemplateCard = ({ template, onStart, onEdit, onDelete, onDuplicate }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => onEdit(template)}
              className="p-1 text-gray-400 hover:text-primary-600 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(template)}
              className="p-1 text-gray-400 hover:text-green-600 rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getDifficultyColor(template.difficulty)}>
            {template.difficulty === 'beginner' && 'Principiante'}
            {template.difficulty === 'intermediate' && 'Intermedio'}
            {template.difficulty === 'advanced' && 'Avanzado'}
          </Badge>
          {template.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <Dumbbell className="w-4 h-4 mr-1" />
              {template.exercises.length} ejercicios
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {template.estimatedDuration} min
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Usado {template.timesUsed} veces</span>
              {template.lastUsed && (
                <span>Último: {new Date(template.lastUsed).toLocaleDateString('es-ES')}</span>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={() => onStart(template)}
          className="w-full"
          icon={<Play className="w-4 h-4" />}
        >
          Comenzar Entrenamiento
        </Button>
      </div>
    </Card>
  );
};

// Componente de tarjeta de sesión
const SessionCard = ({ session }) => {
  const completionRate = session.metrics.totalSets > 0 
    ? (session.metrics.completedSets / session.metrics.totalSets) * 100 
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{session.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(session.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-medium text-gray-900">{session.duration} min</div>
              <div>Duración</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{Math.round(session.metrics.totalVolume)} kg</div>
              <div>Volumen</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{completionRate.toFixed(0)}%</div>
              <div>Completado</div>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Card>
  );
};

// Componente de tarjeta de ejercicio
const ExerciseCard = ({ exercise }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-gray-900">{exercise.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{exercise.category}</p>
          </div>
          <Badge variant="secondary">{exercise.equipment}</Badge>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {exercise.muscleGroups.map((group) => (
            <Badge key={group} variant="outline" size="sm">
              {group}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Estados vacíos
const EmptyState = ({ type }) => {
  const content = {
    templates: {
      icon: BookOpen,
      title: 'No hay plantillas',
      description: 'Crea tu primera plantilla de entrenamiento',
      action: 'Crear Plantilla'
    },
    sessions: {
      icon: Calendar,
      title: 'No hay sesiones',
      description: 'Inicia tu primer entrenamiento para ver el historial',
      action: 'Entrenar Ahora'
    },
    exercises: {
      icon: Dumbbell,
      title: 'No hay ejercicios',
      description: 'Explora nuestra biblioteca de ejercicios',
      action: 'Explorar Ejercicios'
    }
  };

  const { icon: Icon, title, description, action } = content[type];

  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <Button>{action}</Button>
    </div>
  );
};

// Vista de carga
const LoadingView = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="flex space-x-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

// Modal para crear/editar plantilla
const CreateTemplateModal = ({ isOpen, onClose, template, exercises }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    exercises: template?.exercises || [],
    tags: template?.tags?.join(', ') || '',
    difficulty: template?.difficulty || 'beginner',
    estimatedDuration: template?.estimatedDuration || 60
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const templateData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      id: template?.id || Date.now().toString()
    };

    console.log('Guardando plantilla:', templateData);
    toast.success(template ? 'Plantilla actualizada' : 'Plantilla creada');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la plantilla"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Push Day - Pecho y Tríceps"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificultad
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        </div>

        <Input
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe brevemente esta rutina"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Duración estimada (minutos)"
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
            min="5"
            max="180"
          />
          
          <Input
            label="Etiquetas (separadas por comas)"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="pecho, triceps, fuerza"
          />
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {template ? 'Actualizar' : 'Crear'} Plantilla
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default Workouts;