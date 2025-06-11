// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  User,
  Camera,
  Edit,
  Save,
  X,
  Calendar,
  Scale,
  Ruler,
  Activity,
  Target,
  Award,
  TrendingUp,
  Heart,
  Zap,
  Clock,
  MapPin,
  Mail,
  Phone,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Button, Input, Card, Badge, Modal } from '../components/ui';
import toast from 'react-hot-toast';

// Datos simulados
const mockUserData = {
  profile: {
    username: 'carlos_fitness',
    email: 'carlos@ejemplo.com',
    dateOfBirth: '1995-05-15',
    gender: 'male',
    experienceLevel: 'intermediate',
    avatar: null,
    bio: 'Entusiasta del fitness, enfocado en fuerza y hipertrofia. Entrenando desde hace 3 años.',
    location: 'Madrid, España',
    phone: '+34 600 123 456',
    joinDate: '2023-01-15',
    goals: ['muscle_gain', 'strength'],
    preferences: {
      units: 'metric',
      language: 'es',
      privacy: {
        profileVisible: true,
        shareProgress: false
      }
    }
  },
  currentMeasurements: {
    weight: 78.5,
    height: 175,
    bodyFat: 15.8,
    bmi: 25.6,
    waist: 82,
    neck: 38,
    chest: 104,
    arms: 36,
    thighs: 58,
    lastUpdated: '2024-01-21'
  },
  measurementHistory: [
    { date: '2024-01-01', weight: 79.2, bodyFat: 16.5, bmi: 25.9 },
    { date: '2024-01-07', weight: 78.8, bodyFat: 16.2, bmi: 25.7 },
    { date: '2024-01-14', weight: 78.6, bodyFat: 16.0, bmi: 25.6 },
    { date: '2024-01-21', weight: 78.5, bodyFat: 15.8, bmi: 25.6 }
  ],
  goals: {
    targetWeight: 80,
    targetBodyFat: 12,
    targetBMI: 26.1,
    deadline: '2024-06-01',
    notes: 'Ganar músculo magro manteniendo definición'
  },
  achievements: [
    { id: 1, title: 'Primera Sesión', description: 'Completaste tu primer entrenamiento', date: '2023-01-20', type: 'milestone' },
    { id: 2, title: 'Racha de 7 días', description: '7 días consecutivos entrenando', date: '2024-01-15', type: 'consistency' },
    { id: 3, title: 'PR en Press Banca', description: 'Nuevo récord personal: 85kg', date: '2024-01-10', type: 'strength' }
  ],
  stats: {
    totalWorkouts: 156,
    totalHours: 234,
    currentStreak: 12,
    longestStreak: 21,
    personalRecords: 8,
    favoriteExercise: 'Press de Banca'
  }
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState(mockUserData);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar datos del usuario
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleEditProfile = () => {
    setEditForm(userData.profile);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData(prev => ({
        ...prev,
        profile: { ...prev.profile, ...editForm }
      }));
      
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    return today.getFullYear() - birth.getFullYear();
  };

  const getExperienceLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: User },
    { id: 'measurements', name: 'Medidas', icon: Scale },
    { id: 'goals', name: 'Objetivos', icon: Target },
    { id: 'achievements', name: 'Logros', icon: Award },
    { id: 'settings', name: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Profile Header */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-24 w-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {userData.profile.avatar ? (
                    <img
                      src={userData.profile.avatar}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    userData.profile.username.charAt(0).toUpperCase()
                  )}
                </div>
                <button className="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData.profile.username}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getExperienceLevelColor(userData.profile.experienceLevel)}>
                    {userData.profile.experienceLevel === 'beginner' && 'Principiante'}
                    {userData.profile.experienceLevel === 'intermediate' && 'Intermedio'}
                    {userData.profile.experienceLevel === 'advanced' && 'Avanzado'}
                  </Badge>
                  <span className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {calculateAge(userData.profile.dateOfBirth)} años
                  </span>
                  {userData.profile.location && (
                    <span className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {userData.profile.location}
                    </span>
                  )}
                </div>
                {userData.profile.bio && (
                  <p className="text-gray-600 mt-2 max-w-md">{userData.profile.bio}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 lg:mt-0 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userData.stats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Entrenamientos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userData.stats.currentStreak}</div>
                <div className="text-sm text-gray-600">Racha actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userData.stats.personalRecords}</div>
                <div className="text-sm text-gray-600">Récords</div>
              </div>
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
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            userData={userData}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            onEdit={handleEditProfile}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
            loading={loading}
          />
        )}
        
        {activeTab === 'measurements' && (
          <MeasurementsTab
            measurements={userData.currentMeasurements}
            history={userData.measurementHistory}
            onUpdate={() => setShowMeasurementsModal(true)}
          />
        )}
        
        {activeTab === 'goals' && (
          <GoalsTab
            goals={userData.goals}
            currentMeasurements={userData.currentMeasurements}
            onUpdate={() => setShowGoalsModal(true)}
          />
        )}
        
        {activeTab === 'achievements' && (
          <AchievementsTab achievements={userData.achievements} stats={userData.stats} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab profile={userData.profile} />
        )}
      </div>

      {/* Modals */}
      {showMeasurementsModal && (
        <MeasurementsModal
          isOpen={showMeasurementsModal}
          onClose={() => setShowMeasurementsModal(false)}
          currentMeasurements={userData.currentMeasurements}
          onSave={(newMeasurements) => {
            setUserData(prev => ({
              ...prev,
              currentMeasurements: { ...prev.currentMeasurements, ...newMeasurements }
            }));
            setShowMeasurementsModal(false);
            toast.success('Medidas actualizadas correctamente');
          }}
        />
      )}

      {showGoalsModal && (
        <GoalsModal
          isOpen={showGoalsModal}
          onClose={() => setShowGoalsModal(false)}
          goals={userData.goals}
          onSave={(newGoals) => {
            setUserData(prev => ({
              ...prev,
              goals: { ...prev.goals, ...newGoals }
            }));
            setShowGoalsModal(false);
            toast.success('Objetivos actualizados correctamente');
          }}
        />
      )}
    </div>
  );
};

// Tab de Resumen
const OverviewTab = ({ userData, isEditing, editForm, setEditForm, onEdit, onSave, onCancel, loading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Información Personal */}
      <div className="lg:col-span-2">
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={onEdit} icon={<Edit className="w-4 h-4" />}>
                  Editar
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={onCancel} icon={<X className="w-4 h-4" />}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={onSave} loading={loading} icon={<Save className="w-4 h-4" />}>
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre de usuario"
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <Input
                  label="Biografía"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Cuéntanos sobre tus objetivos fitness..."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ubicación"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <Input
                    label="Teléfono"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{userData.profile.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Fecha de nacimiento</div>
                        <div className="font-medium">
                          {new Date(userData.profile.dateOfBirth).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Nivel de experiencia</div>
                        <div className="font-medium capitalize">{userData.profile.experienceLevel}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {userData.profile.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Teléfono</div>
                          <div className="font-medium">{userData.profile.phone}</div>
                        </div>
                      </div>
                    )}
                    
                    {userData.profile.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Ubicación</div>
                          <div className="font-medium">{userData.profile.location}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Miembro desde</div>
                        <div className="font-medium">
                          {new Date(userData.profile.joinDate).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Progreso Reciente */}
        <Card className="mt-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Progreso de Peso</h3>
          </div>
          <div className="p-6">
            <ProgressChart data={userData.measurementHistory} />
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Medidas Actuales */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Medidas Actuales</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Peso</span>
              <span className="font-semibold">{userData.currentMeasurements.weight} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Altura</span>
              <span className="font-semibold">{userData.currentMeasurements.height} cm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Grasa corporal</span>
              <span className="font-semibold">{userData.currentMeasurements.bodyFat}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">IMC</span>
              <span className="font-semibold">{userData.currentMeasurements.bmi}</span>
            </div>
          </div>
        </Card>

        {/* Estadísticas */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-gray-600">
                <Zap className="w-4 h-4 mr-2" />
                Racha más larga
              </span>
              <span className="font-semibold">{userData.stats.longestStreak} días</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Horas totales
              </span>
              <span className="font-semibold">{userData.stats.totalHours}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-gray-600">
                <Heart className="w-4 h-4 mr-2" />
                Ejercicio favorito
              </span>
              <span className="font-semibold text-sm">{userData.stats.favoriteExercise}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Tab de Medidas
const MeasurementsTab = ({ measurements, history, onUpdate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Medidas Corporales</h3>
            <Button onClick={onUpdate} icon={<Edit className="w-4 h-4" />}>
              Actualizar Medidas
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <MeasurementItem label="Peso" value={`${measurements.weight} kg`} icon={<Scale />} />
              <MeasurementItem label="Altura" value={`${measurements.height} cm`} icon={<Ruler />} />
              <MeasurementItem label="Grasa corporal" value={`${measurements.bodyFat}%`} icon={<Activity />} />
              <MeasurementItem label="IMC" value={measurements.bmi} icon={<TrendingUp />} />
            </div>
            
            <div className="space-y-4">
              <MeasurementItem label="Cintura" value={`${measurements.waist} cm`} />
              <MeasurementItem label="Cuello" value={`${measurements.neck} cm`} />
              <MeasurementItem label="Pecho" value={`${measurements.chest} cm`} />
              <MeasurementItem label="Brazos" value={`${measurements.arms} cm`} />
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            Última actualización: {new Date(measurements.lastUpdated).toLocaleDateString('es-ES')}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Peso</h3>
        </div>
        <div className="p-6">
          <ProgressChart data={history} />
        </div>
      </Card>
    </div>
  );
};

// Tab de Objetivos
const GoalsTab = ({ goals, currentMeasurements, onUpdate }) => {
  const calculateProgress = (current, target) => {
    return Math.min(Math.abs((current / target) * 100), 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Objetivos Actuales</h3>
            <Button onClick={onUpdate} icon={<Edit className="w-4 h-4" />}>
              Editar Objetivos
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <GoalProgress
            label="Peso objetivo"
            current={currentMeasurements.weight}
            target={goals.targetWeight}
            unit="kg"
            progress={calculateProgress(currentMeasurements.weight, goals.targetWeight)}
          />
          
          <GoalProgress
            label="Grasa corporal objetivo"
            current={currentMeasurements.bodyFat}
            target={goals.targetBodyFat}
            unit="%"
            progress={100 - Math.abs(((currentMeasurements.bodyFat - goals.targetBodyFat) / goals.targetBodyFat) * 100)}
          />
          
          <GoalProgress
            label="IMC objetivo"
            current={currentMeasurements.bmi}
            target={goals.targetBMI}
            unit=""
            progress={calculateProgress(currentMeasurements.bmi, goals.targetBMI)}
          />
          
          {goals.notes && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Notas</div>
              <p className="text-gray-600 text-sm">{goals.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cronograma</h3>
        </div>
        <div className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {Math.ceil((new Date(goals.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-gray-600">días restantes</div>
            <div className="text-sm text-gray-500 mt-2">
              hasta el {new Date(goals.deadline).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Tab de Logros
const AchievementsTab = ({ achievements, stats }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <div className="text-2xl font-bold text-gray-900">{achievements.length}</div>
          <div className="text-gray-600">Logros desbloqueados</div>
        </Card>
        
        <Card className="text-center p-6">
          <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <div className="text-2xl font-bold text-gray-900">{stats.personalRecords}</div>
          <div className="text-gray-600">Récords personales</div>
        </Card>
        
        <Card className="text-center p-6">
          <Zap className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <div className="text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
          <div className="text-gray-600">Racha más larga</div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Logros Recientes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(achievement.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Badge>{achievement.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Tab de Configuración
const SettingsTab = ({ profile }) => {
  return (
    <div className="space-y-8">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Preferencias</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidades
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="metric">Métricas (kg, cm)</option>
                <option value="imperial">Imperiales (lb, in)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Privacidad</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Perfil visible</div>
              <div className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</div>
            </div>
            <input type="checkbox" defaultChecked={profile.preferences.privacy.profileVisible} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Compartir progreso</div>
              <div className="text-sm text-gray-600">Comparte automáticamente tus logros</div>
            </div>
            <input type="checkbox" defaultChecked={profile.preferences.privacy.shareProgress} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Datos</h3>
        </div>
        <div className="p-6 space-y-4">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Exportar mis datos
          </Button>
          
          <Button variant="outline" icon={<Upload className="w-4 h-4" />}>
            Importar datos
          </Button>
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Componentes auxiliares
const MeasurementItem = ({ label, value, icon }) => (
  <div className="flex items-center space-x-3">
    {icon && <div className="text-gray-400">{icon}</div>}
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  </div>
);

const GoalProgress = ({ label, current, target, unit, progress }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-600">
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

const ProgressChart = ({ data }) => (
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
          formatter={(value, name) => [
            `${value} ${name === 'weight' ? 'kg' : name === 'bodyFat' ? '%' : ''}`,
            name === 'weight' ? 'Peso' : name === 'bodyFat' ? 'Grasa corporal' : 'IMC'
          ]}
        />
        <Line type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }} />
        <Line type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Modal de medidas
const MeasurementsModal = ({ isOpen, onClose, currentMeasurements, onSave }) => {
  const [measurements, setMeasurements] = useState(currentMeasurements);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...measurements, lastUpdated: new Date().toISOString() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Actualizar Medidas" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={measurements.weight}
            onChange={(e) => setMeasurements(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
          />
          <Input
            label="Grasa corporal (%)"
            type="number"
            step="0.1"
            value={measurements.bodyFat}
            onChange={(e) => setMeasurements(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) }))}
          />
          <Input
            label="Cintura (cm)"
            type="number"
            value={measurements.waist}
            onChange={(e) => setMeasurements(prev => ({ ...prev, waist: parseFloat(e.target.value) }))}
          />
          <Input
            label="Cuello (cm)"
            type="number"
            value={measurements.neck}
            onChange={(e) => setMeasurements(prev => ({ ...prev, neck: parseFloat(e.target.value) }))}
          />
          <Input
            label="Pecho (cm)"
            type="number"
            value={measurements.chest}
            onChange={(e) => setMeasurements(prev => ({ ...prev, chest: parseFloat(e.target.value) }))}
          />
          <Input
            label="Brazos (cm)"
            type="number"
            value={measurements.arms}
            onChange={(e) => setMeasurements(prev => ({ ...prev, arms: parseFloat(e.target.value) }))}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Medidas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de objetivos
const GoalsModal = ({ isOpen, onClose, goals, onSave }) => {
  const [formData, setFormData] = useState(goals);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Objetivos" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Peso objetivo (kg)"
            type="number"
            step="0.1"
            value={formData.targetWeight}
            onChange={(e) => setFormData(prev => ({ ...prev, targetWeight: parseFloat(e.target.value) }))}
          />
          <Input
            label="Grasa corporal objetivo (%)"
            type="number"
            step="0.1"
            value={formData.targetBodyFat}
            onChange={(e) => setFormData(prev => ({ ...prev, targetBodyFat: parseFloat(e.target.value) }))}
          />
          <Input
            label="IMC objetivo"
            type="number"
            step="0.1"
            value={formData.targetBMI}
            onChange={(e) => setFormData(prev => ({ ...prev, targetBMI: parseFloat(e.target.value) }))}
          />
          <Input
            label="Fecha objetivo"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Describe tus objetivos y estrategia..."
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Objetivos
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Profile;