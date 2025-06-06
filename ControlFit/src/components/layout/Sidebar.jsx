// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  User,
  BarChart3,
  Settings,
  Target,
  Calendar,
  Trophy,
  X,
  Scale,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { currentWorkout } = useApp();

  // Navegación principal
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Vista general de tu progreso',
    },
    {
      name: 'Entrenamientos',
      href: '/workouts',
      icon: Dumbbell,
      description: 'Rutinas y sesiones',
      badge: currentWorkout ? 'Activo' : null,
      badgeColor: 'bg-green-100 text-green-800',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Análisis de rendimiento',
    },
    {
      name: 'Mi Perfil',
      href: '/profile',
      icon: User,
      description: 'Datos personales y medidas',
    },
  ];

  // Navegación secundaria
  const secondaryNavigation = [
    {
      name: 'Calculadoras',
      href: '/calculators',
      icon: Scale,
      description: 'Grasa corporal, 1RM, etc.',
    },
    {
      name: 'Objetivos',
      href: '/goals',
      icon: Target,
      description: 'Establece y sigue tus metas',
    },
    {
      name: 'Calendario',
      href: '/calendar',
      icon: Calendar,
      description: 'Planifica tus entrenamientos',
    },
    {
      name: 'Logros',
      href: '/achievements',
      icon: Trophy,
      description: 'Tus récords personales',
    },
  ];

  const settingsNavigation = [
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      description: 'Preferencias de la app',
    },
  ];

  const isCurrentPath = (href) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const NavItem = ({ item, onClick }) => {
    const isActive = isCurrentPath(item.href);
    
    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={clsx(
          'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
          isActive
            ? 'bg-primary-100 text-primary-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <item.icon
          className={clsx(
            'flex-shrink-0 h-5 w-5 mr-3 transition-colors',
            isActive
              ? 'text-primary-600'
              : 'text-gray-400 group-hover:text-gray-600'
          )}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span>{item.name}</span>
            {item.badge && (
              <span className={clsx(
                'ml-2 px-2 py-1 text-xs font-medium rounded-full',
                item.badgeColor || 'bg-gray-100 text-gray-600'
              )}>
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600">
              {item.description}
            </p>
          )}
        </div>
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ASECGC</span>
        </Link>
        
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'Usuario'}
            </p>
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 text-green-500" />
              <p className="text-xs text-gray-500">
                {user?.profile?.experienceLevel === 'beginner' && 'Principiante'}
                {user?.profile?.experienceLevel === 'intermediate' && 'Intermedio'}
                {user?.profile?.experienceLevel === 'advanced' && 'Avanzado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {/* Main navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Principal
          </h3>
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                onClick={isMobile ? onClose : undefined}
              />
            ))}
          </div>
        </div>

        {/* Secondary navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Herramientas
          </h3>
          <div className="space-y-1">
            {secondaryNavigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                onClick={isMobile ? onClose : undefined}
              />
            ))}
          </div>
        </div>

        {/* Current workout status */}
        {currentWorkout && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-green-800">
                  Entrenamiento Activo
                </h4>
                <p className="text-xs text-green-600 mt-1">
                  {currentWorkout.exercises?.length || 0} ejercicios
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Link
                to="/workouts/active"
                onClick={isMobile ? onClose : undefined}
                className="text-xs text-green-700 hover:text-green-800 font-medium"
              >
                Continuar entrenamiento →
              </Link>
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Progreso de la semana
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Entrenamientos</span>
              <span className="font-medium text-gray-900">3/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: '60%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Racha: 12 días</span>
              <span>Meta: 5/semana</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings */}
      <div className="px-4 py-4 border-t border-gray-200">
        {settingsNavigation.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ASECGC v1.0.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2024 Arturo Reyes
          </p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile sidebar */}
        <div
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="flex flex-col w-64 fixed inset-y-0 z-30">
      {sidebarContent}
    </div>
  );
};

export default Sidebar;