// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Shield,
  Globe,
  Smartphone,
  Moon,
  Sun,
  Save,
  Check,
  X,
  User,
  Lock,
  Mail,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  ChevronRight,
  Volume2,
  Dumbbell,
  Clock,
  Eye,
  EyeOff,
  Palette,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Button, Input, Card, Badge, Modal } from '../components/ui';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { units, language, theme, preferences, setUnits, setLanguage, setTheme, setPreferences } = useApp();
  
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Estados de formulario
  const [formData, setFormData] = useState({
    general: {
      units: units || 'metric',
      language: language || 'es',
      theme: theme || 'light',
      timezone: user?.profile?.timezone || 'Europe/Madrid'
    },
    notifications: {
      workoutReminders: user?.profile?.preferences?.notifications?.workoutReminders ?? true,
      progressUpdates: user?.profile?.preferences?.notifications?.progressUpdates ?? true,
      emailNotifications: user?.profile?.preferences?.notifications?.emailNotifications ?? true,
      pushNotifications: user?.profile?.preferences?.notifications?.pushNotifications ?? true,
      reminderTime: user?.profile?.preferences?.notifications?.reminderTime || '08:00',
      reminderDays: user?.profile?.preferences?.notifications?.reminderDays || ['mon', 'tue', 'wed', 'thu', 'fri']
    },
    privacy: {
      profileVisible: user?.profile?.preferences?.privacy?.profileVisible ?? true,
      shareProgress: user?.profile?.preferences?.privacy?.shareProgress ?? false,
      showStats: user?.profile?.preferences?.privacy?.showStats ?? true,
      allowFriendRequests: user?.profile?.preferences?.privacy?.allowFriendRequests ?? true
    },
    workout: {
      defaultRestTime: preferences?.defaultRestTime || 60,
      autoAdvance: user?.profile?.preferences?.workout?.autoAdvance ?? true,
      soundEffects: user?.profile?.preferences?.workout?.soundEffects ?? true,
      showTips: user?.profile?.preferences?.workout?.showTips ?? true,
      vibration: user?.profile?.preferences?.workout?.vibration ?? true,
      keepScreenOn: user?.profile?.preferences?.workout?.keepScreenOn ?? true
    },
    account: {
      email: user?.email || '',
      username: user?.username || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Detectar cambios
  useEffect(() => {
    const originalData = {
      general: {
        units: units || 'metric',
        language: language || 'es',
        theme: theme || 'light',
        timezone: user?.profile?.timezone || 'Europe/Madrid'
      }
    };
    
    const hasModifications = JSON.stringify(formData.general) !== JSON.stringify(originalData.general);
    setHasChanges(hasModifications);
  }, [formData, units, language, theme, user]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSection = async (section) => {
    setLoading(true);
    try {
      switch (section) {
        case 'general':
          setUnits(formData.general.units);
          setLanguage(formData.general.language);
          setTheme(formData.general.theme);
          break;
          
        case 'notifications':
          // Aquí iría la llamada a la API para actualizar notificaciones
          break;
          
        case 'privacy':
          // Aquí iría la llamada a la API para actualizar privacidad
          break;
          
        case 'workout':
          setPreferences({
            ...preferences,
            defaultRestTime: formData.workout.defaultRestTime
          });
          break;
      }
      
      toast.success('Configuración actualizada correctamente');
      setHasChanges(false);
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.account.newPassword !== formData.account.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para cambiar contraseña
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Contraseña actualizada correctamente');
      setShowPasswordModal(false);
      setFormData(prev => ({
        ...prev,
        account: {
          ...prev.account,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }));
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Simular exportación de datos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En producción, esto descargaría un archivo JSON con todos los datos del usuario
      const exportData = {
        profile: user,
        preferences: formData,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `controlfit-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast.success('Datos exportados correctamente');
      setShowExportModal(false);
    } catch (error) {
      toast.error('Error al exportar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // En producción, esto requeriría confirmación adicional y eliminaría la cuenta
    toast.error('Esta función está deshabilitada en modo demo');
    setShowDeleteModal(false);
  };

  const sections = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'privacy', name: 'Privacidad', icon: Shield },
    { id: 'workout', name: 'Entrenamiento', icon: Dumbbell },
    { id: 'account', name: 'Cuenta', icon: User },
    { id: 'data', name: 'Datos', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-gray-600">Personaliza tu experiencia en ControlFit</p>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <section.icon className="w-5 h-5 mr-3" />
                        {section.name}
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </nav>
              </div>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sección General */}
            {activeSection === 'general' && (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Preferencias Generales</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sistema de unidades
                    </label>
                    <select
                      value={formData.general.units}
                      onChange={(e) => handleInputChange('general', 'units', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="metric">Métrico (kg, cm)</option>
                      <option value="imperial">Imperial (lb, in)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={formData.general.language}
                      onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleInputChange('general', 'theme', 'light')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.general.theme === 'light'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Sun className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">Claro</span>
                      </button>
                      <button
                        onClick={() => handleInputChange('general', 'theme', 'dark')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.general.theme === 'dark'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Moon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">Oscuro</span>
                      </button>
                      <button
                        onClick={() => handleInputChange('general', 'theme', 'auto')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.general.theme === 'auto'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Palette className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">Auto</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona horaria
                    </label>
                    <select
                      value={formData.general.timezone}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                      <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => handleSaveSection('general')}
                      loading={loading}
                      disabled={!hasChanges}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Sección Notificaciones */}
            {activeSection === 'notifications' && (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Recordatorios de entrenamiento</div>
                        <div className="text-sm text-gray-600">Recibe recordatorios para tus sesiones</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notifications.workoutReminders}
                        onChange={(e) => handleInputChange('notifications', 'workoutReminders', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Actualizaciones de progreso</div>
                        <div className="text-sm text-gray-600">Notificaciones sobre tu progreso semanal</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notifications.progressUpdates}
                        onChange={(e) => handleInputChange('notifications', 'progressUpdates', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Notificaciones por email</div>
                        <div className="text-sm text-gray-600">Recibe resúmenes y actualizaciones por correo</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notifications.emailNotifications}
                        onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Notificaciones push</div>
                        <div className="text-sm text-gray-600">Recibe notificaciones en tu dispositivo</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notifications.pushNotifications}
                        onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {formData.notifications.workoutReminders && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Configurar recordatorios</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hora del recordatorio
                          </label>
                          <input
                            type="time"
                            value={formData.notifications.reminderTime}
                            onChange={(e) => handleInputChange('notifications', 'reminderTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días de recordatorio
                          </label>
                          <div className="grid grid-cols-7 gap-2">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => {
                              const dayValue = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][index];
                              const isSelected = formData.notifications.reminderDays.includes(dayValue);
                              
                              return (
                                <button
                                  key={dayValue}
                                  onClick={() => {
                                    const newDays = isSelected
                                      ? formData.notifications.reminderDays.filter(d => d !== dayValue)
                                      : [...formData.notifications.reminderDays, dayValue];
                                    handleInputChange('notifications', 'reminderDays', newDays);
                                  }}
                                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                                    isSelected
                                      ? 'bg-primary-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={() => handleSaveSection('notifications')}
                      loading={loading}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Guardar configuración
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Sección Privacidad */}
            {activeSection === 'privacy' && (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Privacidad</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Perfil visible</div>
                        <div className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.privacy.profileVisible}
                        onChange={(e) => handleInputChange('privacy', 'profileVisible', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Compartir progreso</div>
                        <div className="text-sm text-gray-600">Comparte automáticamente tus logros</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.privacy.shareProgress}
                        onChange={(e) => handleInputChange('privacy', 'shareProgress', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Mostrar estadísticas</div>
                        <div className="text-sm text-gray-600">Muestra tus estadísticas en tu perfil público</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.privacy.showStats}
                        onChange={(e) => handleInputChange('privacy', 'showStats', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Permitir solicitudes de amistad</div>
                        <div className="text-sm text-gray-600">Otros usuarios pueden enviarte solicitudes</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.privacy.allowFriendRequests}
                        onChange={(e) => handleInputChange('privacy', 'allowFriendRequests', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => handleSaveSection('privacy')}
                      loading={loading}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Guardar configuración
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Sección Entrenamiento */}
            {activeSection === 'workout' && (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Preferencias de Entrenamiento</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de descanso predeterminado (segundos)
                    </label>
                    <input
                      type="number"
                      value={formData.workout.defaultRestTime}
                      onChange={(e) => handleInputChange('workout', 'defaultRestTime', parseInt(e.target.value))}
                      min="10"
                      max="300"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Avance automático</div>
                        <div className="text-sm text-gray-600">Avanza automáticamente al siguiente ejercicio</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.workout.autoAdvance}
                        onChange={(e) => handleInputChange('workout', 'autoAdvance', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Efectos de sonido</div>
                        <div className="text-sm text-gray-600">Reproduce sonidos durante el entrenamiento</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.workout.soundEffects}
                        onChange={(e) => handleInputChange('workout', 'soundEffects', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Mostrar consejos</div>
                        <div className="text-sm text-gray-600">Muestra consejos durante los ejercicios</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.workout.showTips}
                        onChange={(e) => handleInputChange('workout', 'showTips', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Vibración</div>
                        <div className="text-sm text-gray-600">Vibra al completar series o ejercicios</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.workout.vibration}
                        onChange={(e) => handleInputChange('workout', 'vibration', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Mantener pantalla encendida</div>
                        <div className="text-sm text-gray-600">Evita que la pantalla se apague durante el entrenamiento</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.workout.keepScreenOn}
                        onChange={(e) => handleInputChange('workout', 'keepScreenOn', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => handleSaveSection('workout')}
                      loading={loading}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Guardar configuración
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Sección Cuenta */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <Card>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Información de Cuenta</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="email"
                          value={formData.account.email}
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <Badge variant="success" size="sm">Verificado</Badge>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={formData.account.username}
                        onChange={(e) => handleInputChange('account', 'username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordModal(true)}
                        icon={<Lock className="w-4 h-4" />}
                      >
                        Cambiar contraseña
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Zona de Peligro</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div className="ml-3">
                            <h4 className="font-medium text-red-900">Eliminar cuenta</h4>
                            <p className="mt-1 text-sm text-red-700">
                              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, estás seguro.
                            </p>
                            <Button
                              variant="outline"
                              className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => setShowDeleteModal(true)}
                              icon={<Trash2 className="w-4 h-4" />}
                            >
                              Eliminar mi cuenta
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Sección Datos */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <Card>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Exportar Datos</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      Descarga todos tus datos de ControlFit en formato JSON. Esto incluye tu perfil, 
                      entrenamientos, medidas y configuraciones.
                    </p>
                    <Button
                      onClick={() => setShowExportModal(true)}
                      icon={<Download className="w-4 h-4" />}
                    >
                      Exportar mis datos
                    </Button>
                  </div>
                </Card>

                <Card>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Importar Datos</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      Importa datos desde un archivo de exportación anterior de ControlFit.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Arrastra un archivo aquí o haz clic para seleccionar
                      </p>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          // Manejar importación
                          toast.info('Función de importación en desarrollo');
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Cambiar contraseña"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña actual
            </label>
            <Input
              type="password"
              value={formData.account.currentPassword}
              onChange={(e) => handleInputChange('account', 'currentPassword', e.target.value)}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <Input
              type="password"
              value={formData.account.newPassword}
              onChange={(e) => handleInputChange('account', 'newPassword', e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              value={formData.account.confirmPassword}
              onChange={(e) => handleInputChange('account', 'confirmPassword', e.target.value)}
              placeholder="Confirma tu nueva contraseña"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} loading={loading}>
              Cambiar contraseña
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de exportación */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exportar datos"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Se descargará un archivo JSON con todos tus datos. Este archivo incluye:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
            <li>Información de perfil</li>
            <li>Historial de entrenamientos</li>
            <li>Medidas corporales</li>
            <li>Configuraciones y preferencias</li>
            <li>Logros y estadísticas</li>
          </ul>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExportData} loading={loading} icon={<Download className="w-4 h-4" />}>
              Descargar datos
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de eliminación de cuenta */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar cuenta"
      >
        <div>
          <div className="flex items-start mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="ml-3">
              <p className="text-gray-600">
                Esta acción no se puede deshacer. Se eliminarán permanentemente:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                <li>Tu perfil y toda la información personal</li>
                <li>Todos tus entrenamientos y rutinas</li>
                <li>Tus medidas y progreso</li>
                <li>Tus logros y estadísticas</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-red-800">
              Por favor, escribe <strong>ELIMINAR</strong> para confirmar.
            </p>
          </div>

          <Input
            placeholder="Escribe ELIMINAR"
            className="mb-4"
          />

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              Sí, eliminar mi cuenta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;