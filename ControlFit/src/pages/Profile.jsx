// pages/Profile.jsx - Versión actualizada con nuevos componentes
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
  Upload,
  Share2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Button, Input, Card, Badge, Modal } from '../components/ui';
import { MeasurementsTab, GoalsTab, AchievementsTab } from '../components/profile';
import { useProfile } from '../hooks/useProfile';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const {
    profileData,
    measurements,
    goals,
    achievements,
    stats,
    loading,
    updateProfile,
    updateMeasurements,
    addMeasurement,
    updateGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    shareAchievement
  } = useProfile();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    // Los datos se cargan automáticamente con el hook useProfile
  }, []);

  const handleEditProfile = () => {
    setEditForm(profileData);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
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

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ProfileHeader 
        profile={profileData}
        stats={stats}
        isEditing={isEditing}
        onEdit={handleEditProfile}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
        editForm={editForm}
        setEditForm={setEditForm}
      />

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
                {tab.id === 'achievements' && achievements.filter(a => a.isNew).length > 0 && (
                  <Badge variant="primary" size="sm">
                    {achievements.filter(a => a.isNew).length}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            profileData={profileData}
            measurements={measurements}
            goals={goals}
            achievements={achievements}
            stats={stats}
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
            measurements={measurements.current}
            history={measurements.history}
            onUpdate={updateMeasurements}
            onAddMeasurement={addMeasurement}
          />
        )}
        
        {activeTab === 'goals' && (
          <GoalsTab
            goals={goals}
            currentMeasurements={measurements.current}
            currentStats={stats}
            onUpdate={updateGoals}
            onAdd={addGoal}
            onUpdateGoal={updateGoal}
            onDelete={deleteGoal}
          />
        )}
        
        {activeTab === 'achievements' && (
          <AchievementsTab
            achievements={achievements}
            stats={stats}
            onShare={shareAchievement}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab
            profile={profileData}
            onUpdate={updateProfile}
          />
        )}
      </div>
    </div>
  );
};

// Componente Header del Perfil
const ProfileHeader = ({ 
  profile, 
  stats, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  editForm, 
  setEditForm 
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Profile Info */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.username || 'Usuario'}
                </h1>
                <Badge 
                  className={getExperienceLevelColor(profile.experienceLevel)}
                  size="sm"
                >
                  {profile.experienceLevel === 'beginner' ? 'Principiante' :
                   profile.experienceLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {calculateAge(profile.dateOfBirth)} años
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Desde {new Date(profile.joinDate).toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-600 max-w-md">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 lg:mt-0 flex items-center space-x-3">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Share2 className="w-4 h-4" />}
                >
                  Compartir Perfil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  icon={<Edit className="w-4 h-4" />}
                >
                  Editar Perfil
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  icon={<X className="w-4 h-4" />}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={onSave}
                  icon={<Save className="w-4 h-4" />}
                >
                  Guardar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</div>
            <div className="text-sm text-gray-600">Entrenamientos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Racha actual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.personalRecords}</div>
            <div className="text-sm text-gray-600">Récords</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{Math.round(stats.totalHours || 0)}h</div>
            <div className="text-sm text-gray-600">Tiempo total</div>
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={profile.avatar}
        onSave={(newAvatar) => {
          setEditForm(prev => ({ ...prev, avatar: newAvatar }));
          setShowAvatarModal(false);
        }}
      />
    </div>
  );
};

// Tab de Resumen mejorado
const OverviewTab = ({ 
  profileData, 
  measurements, 
  goals, 
  achievements, 
  stats,
  isEditing,
  editForm,
  setEditForm,
  onEdit,
  onSave,
  onCancel,
  loading
}) => {
  const recentAchievements = achievements
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Información Personal */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={onEdit} icon={<Edit className="w-4 h-4" />}>
                  Editar
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              <ProfileEditForm
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={onSave}
                onCancel={onCancel}
                loading={loading}
              />
            ) : (
              <ProfileInfoDisplay profile={profileData} />
            )}
          </div>
        </Card>

        {/* Progreso Reciente */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Progreso Reciente</h3>
          </div>
          <div className="p-6">
            <RecentProgressChart measurements={measurements.history} />
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
            <MeasurementItem label="Peso" value={`${measurements.current.weight} kg`} icon={<Scale />} />
            <MeasurementItem label="Grasa corporal" value={`${measurements.current.bodyFat}%`} icon={<Activity />} />
            <MeasurementItem label="IMC" value={measurements.current.bmi} icon={<TrendingUp />} />
          </div>
        </Card>

        {/* Objetivos Activos */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Objetivos Activos</h3>
          </div>
          <div className="p-6">
            {activeGoals.length > 0 ? (
              <div className="space-y-4">
                {activeGoals.map(goal => (
                  <GoalProgressItem key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay objetivos activos</p>
            )}
          </div>
        </Card>

        {/* Logros Recientes */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Logros Recientes</h3>
          </div>
          <div className="p-6">
            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {recentAchievements.map(achievement => (
                  <AchievementItem key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay logros recientes</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Componentes auxiliares...
const ProfileEditForm = ({ editForm, setEditForm, onSave, onCancel, loading }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Nombre de usuario"
        value={editForm.username || ''}
        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
        required
      />
      <Input
        label="Email"
        type="email"
        value={editForm.email || ''}
        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
        required
      />
    </div>
    
    <Input
      label="Biografía"
      type="textarea"
      rows={3}
      value={editForm.bio || ''}
      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
      placeholder="Cuenta un poco sobre ti..."
    />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Fecha de nacimiento"
        type="date"
        value={editForm.dateOfBirth || ''}
        onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
      />
      <select
        className="input"
        value={editForm.experienceLevel || ''}
        onChange={(e) => setEditForm(prev => ({ ...prev, experienceLevel: e.target.value }))}
      >
        <option value="">Selecciona nivel</option>
        <option value="beginner">Principiante</option>
        <option value="intermediate">Intermedio</option>
        <option value="advanced">Avanzado</option>
      </select>
    </div>

    <div className="flex justify-end space-x-3 pt-4">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" loading={loading}>
        Guardar Cambios
      </Button>
    </div>
  </form>
);

const ProfileInfoDisplay = ({ profile }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <p className="text-gray-900">{profile.email}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Teléfono</label>
        <p className="text-gray-900">{profile.phone || 'No especificado'}</p>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Género</label>
        <p className="text-gray-900">{profile.gender === 'male' ? 'Masculino' : 'Femenino'}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Ubicación</label>
        <p className="text-gray-900">{profile.location || 'No especificada'}</p>
      </div>
    </div>
  </div>
);

const MeasurementItem = ({ label, value, icon }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center text-gray-600">
      {icon}
      <span className="ml-2">{label}</span>
    </span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const GoalProgressItem = ({ goal }) => {
  const progress = 75; // Calcular progreso real
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{goal.title}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const AchievementItem = ({ achievement }) => (
  <div className="flex items-center space-x-3">
    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
      <Award className="w-4 h-4 text-yellow-600" />
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
      <p className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString('es-ES')}</p>
    </div>
  </div>
);

const RecentProgressChart = ({ measurements }) => (
  <div className="h-48">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={measurements}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-8">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 bg-gray-300 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
    <div className="px-6 py-8">
      <div className="h-64 bg-gray-300 rounded"></div>
    </div>
  </div>
);

const AvatarUploadModal = ({ isOpen, onClose, currentAvatar, onSave }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar);

  const handleFileUpload = async (file) => {
    setUploading(true);
    // Simular upload
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setUploading(false);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Avatar">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Imagen
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={() => onSave(preview)} 
            disabled={!preview || uploading}
            loading={uploading}
          >
            Guardar Avatar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const SettingsTab = ({ profile, onUpdate }) => (
  <div className="space-y-6">
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Privacidad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Perfil público</h4>
              <p className="text-sm text-gray-600">Permitir que otros usuarios vean tu perfil</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Compartir progreso</h4>
              <p className="text-sm text-gray-600">Mostrar tu progreso en la comunidad</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default Profile;