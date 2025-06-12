// components/shared/EmptyState.jsx
import React from 'react';
import { clsx } from 'clsx';
import { 
  FiTarget, 
  FiUsers, 
  FiActivity, 
  FiBarChart3, 
  FiSearch,
  FiFileText,
  FiPlus,
  FiInbox
} from 'react-icons/fi';
import { Button } from '../ui';

const EmptyState = ({
  type = 'default',
  title,
  description,
  icon: CustomIcon,
  action,
  className = '',
  size = 'md',
  ...props
}) => {
  // Configuraciones predefinidas para diferentes tipos de estados vacíos
  const emptyStates = {
    workouts: {
      icon: FiActivity,
      title: 'No hay entrenamientos',
      description: 'Comienza creando tu primer entrenamiento personalizado',
      action: {
        label: 'Crear Entrenamiento',
        variant: 'primary'
      }
    },
    templates: {
      icon: FiFileText,
      title: 'No hay plantillas',
      description: 'Crea plantillas de entrenamiento para usarlas múltiples veces',
      action: {
        label: 'Crear Plantilla',
        variant: 'primary'
      }
    },
    exercises: {
      icon: FiTarget,
      title: 'No hay ejercicios',
      description: 'Agrega ejercicios a tu biblioteca para crear entrenamientos',
      action: {
        label: 'Agregar Ejercicio',
        variant: 'primary'
      }
    },
    sessions: {
      icon: FiBarChart3,
      title: 'No hay sesiones registradas',
      description: 'Completa tu primer entrenamiento para ver las estadísticas',
      action: null
    },
    search: {
      icon: FiSearch,
      title: 'No se encontraron resultados',
      description: 'Intenta ajustar los filtros o cambia los términos de búsqueda',
      action: null
    },
    users: {
      icon: FiUsers,
      title: 'No hay usuarios',
      description: 'No se han registrado usuarios en el sistema',
      action: null
    },
    default: {
      icon: FiInbox,
      title: 'No hay elementos',
      description: 'No se han encontrado elementos para mostrar',
      action: null
    }
  };

  const config = emptyStates[type] || emptyStates.default;
  
  // Usar props personalizados o valores por defecto
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalAction = action || config.action;
  const IconComponent = CustomIcon || config.icon;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div 
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        currentSize.container,
        className
      )}
      {...props}
    >
      {/* Icono */}
      <div className="flex items-center justify-center mb-4">
        <div className="p-4 bg-gray-100 rounded-full">
          <IconComponent 
            className={clsx(
              currentSize.icon,
              'text-gray-400'
            )} 
          />
        </div>
      </div>

      {/* Título */}
      <h3 className={clsx(
        'font-semibold text-gray-900 mb-2',
        currentSize.title
      )}>
        {finalTitle}
      </h3>

      {/* Descripción */}
      <p className={clsx(
        'text-gray-500 max-w-md mb-6',
        currentSize.description
      )}>
        {finalDescription}
      </p>

      {/* Acción */}
      {finalAction && (
        <Button
          variant={finalAction.variant || 'primary'}
          size={size}
          onClick={finalAction.onClick}
          icon={finalAction.icon ? <FiPlus className="w-4 h-4" /> : null}
        >
          {finalAction.label}
        </Button>
      )}
    </div>
  );
};

// Componente específico para estados de búsqueda vacía
export const EmptySearchState = ({ searchTerm, onClear, ...props }) => (
  <EmptyState
    type="search"
    title="No se encontraron resultados"
    description={
      searchTerm
        ? `No se encontraron resultados para "${searchTerm}"`
        : 'No se encontraron resultados con los filtros aplicados'
    }
    action={
      onClear && {
        label: 'Limpiar búsqueda',
        variant: 'outline',
        onClick: onClear
      }
    }
    {...props}
  />
);

// Componente específico para estados de carga
export const EmptyLoadingState = ({ message = 'Cargando...', ...props }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="loading-spinner w-8 h-8 mb-4" />
    <p className="text-gray-500">{message}</p>
  </div>
);

// Componente específico para errores
export const EmptyErrorState = ({ 
  title = 'Error al cargar los datos',
  description = 'Ha ocurrido un error inesperado',
  onRetry,
  ...props 
}) => (
  <EmptyState
    icon={FiTarget}
    title={title}
    description={description}
    action={
      onRetry && {
        label: 'Intentar de nuevo',
        variant: 'primary',
        onClick: onRetry
      }
    }
    {...props}
  />
);

export default EmptyState;