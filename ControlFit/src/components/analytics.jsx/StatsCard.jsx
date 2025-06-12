import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Target,
  Calendar,
  Clock,
  Activity,
  Award,
  Zap,
  BarChart3,
  Users,
  Heart
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const StatsCard = ({
  title,
  value,
  unit = '',
  change,
  changeType = 'percentage', // 'percentage', 'absolute', 'none'
  trend, // 'up', 'down', 'stable'
  icon,
  iconColor = 'text-blue-500',
  iconBgColor = 'bg-blue-100',
  size = 'default', // 'sm', 'default', 'lg'
  variant = 'default', // 'default', 'minimal', 'outlined', 'gradient'
  subtitle,
  description,
  progress, // { current, target, percentage }
  badge,
  loading = false,
  error = null,
  onClick,
  className = '',
  children
}) => {
  // Determinar el ícono por defecto basado en el tipo de stat
  const getDefaultIcon = () => {
    if (icon) return icon;
    
    const iconMap = {
      'entrenamientos': Activity,
      'workouts': Activity,
      'volumen': BarChart3,
      'volume': BarChart3,
      'peso': Target,
      'weight': Target,
      'grasa': Target,
      'bodyFat': Target,
      'racha': Award,
      'streak': Award,
      'tiempo': Clock,
      'duration': Clock,
      'consistencia': Calendar,
      'consistency': Calendar,
      'fuerza': Zap,
      'strength': Zap,
      'usuarios': Users,
      'users': Users,
      'salud': Heart,
      'health': Heart
    };

    const titleLower = title?.toLowerCase() || '';
    for (const [key, IconComponent] of Object.entries(iconMap)) {
      if (titleLower.includes(key)) {
        return IconComponent;
      }
    }
    
    return BarChart3;
  };

  const IconComponent = getDefaultIcon();

  // Determinar el color de la tendencia
  const getTrendStyle = () => {
    if (!change && trend !== 'stable') return {};
    
    switch (trend) {
      case 'up':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: TrendingUp
        };
      case 'down':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: TrendingDown
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: Minus
        };
    }
  };

  const trendStyle = getTrendStyle();
  const TrendIcon = trendStyle.icon;

  // Formatear el valor del cambio
  const formatChange = () => {
    if (!change) return '';
    
    const prefix = change > 0 ? '+' : '';
    
    switch (changeType) {
      case 'percentage':
        return `${prefix}${change.toFixed(1)}%`;
      case 'absolute':
        return `${prefix}${change}${unit ? ` ${unit}` : ''}`;
      default:
        return change;
    }
  };

  // Obtener estilos por tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'p-4',
          titleSize: 'text-sm',
          valueSize: 'text-lg',
          iconSize: 'w-4 h-4',
          iconContainer: 'w-8 h-8'
        };
      case 'lg':
        return {
          padding: 'p-8',
          titleSize: 'text-lg',
          valueSize: 'text-4xl',
          iconSize: 'w-8 h-8',
          iconContainer: 'w-16 h-16'
        };
      default:
        return {
          padding: 'p-6',
          titleSize: 'text-sm',
          valueSize: 'text-2xl',
          iconSize: 'w-5 h-5',
          iconContainer: 'w-10 h-10'
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Obtener estilos por variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent border-0 shadow-none';
      case 'outlined':
        return 'bg-white border-2 border-gray-200 shadow-none hover:border-gray-300';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg';
      default:
        return 'bg-white border border-gray-200 shadow-sm hover:shadow-md';
    }
  };

  const variantStyles = getVariantStyles();

  // Estado de loading
  if (loading) {
    return (
      <div className={`rounded-lg transition-all duration-200 ${variantStyles} ${sizeStyles.padding} ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`${sizeStyles.iconContainer} bg-gray-200 rounded-lg`}></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          {progress && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={`rounded-lg transition-all duration-200 ${variantStyles} ${sizeStyles.padding} ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">Error</div>
          <div className="text-xs text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-lg transition-all duration-200 ${variantStyles} ${sizeStyles.padding} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Header con ícono y badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`${sizeStyles.iconContainer} ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <IconComponent className={`${sizeStyles.iconSize} ${iconColor}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className={`font-medium text-gray-600 ${sizeStyles.titleSize}`}>
                {title}
              </h3>
              
              {badge && (
                <Badge size="sm" variant={badge.variant || 'secondary'}>
                  {badge.text}
                </Badge>
              )}
            </div>
            
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Indicador de tendencia */}
        {(change !== undefined || trend) && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trendStyle.bgColor}`}>
            <TrendIcon className={`w-3 h-3 ${trendStyle.color}`} />
            {change !== undefined && (
              <span className={`text-xs font-medium ${trendStyle.color}`}>
                {formatChange()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="mb-3">
        <div className="flex items-baseline space-x-1">
          <span className={`font-bold text-gray-900 ${sizeStyles.valueSize}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && (
            <span className="text-sm text-gray-500 font-medium">
              {unit}
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Barra de progreso */}
      {progress && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{progress.current} / {progress.target}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress.percentage || 0, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>{progress.target}</span>
          </div>
        </div>
      )}

      {/* Contenido adicional */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

      {/* Footer con información adicional */}
      {(progress?.percentage !== undefined || change !== undefined) && (
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          {progress?.percentage !== undefined && (
            <span>{progress.percentage.toFixed(1)}% completado</span>
          )}
          
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <span>vs período anterior</span>
              <Info className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente especializado para comparaciones
export const ComparisonStatsCard = ({ 
  title, 
  current, 
  previous, 
  unit = '',
  icon,
  ...props 
}) => {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  
  return (
    <StatsCard
      title={title}
      value={current}
      unit={unit}
      change={change}
      changeType="percentage"
      trend={trend}
      icon={icon}
      description={`Anterior: ${previous}${unit ? ` ${unit}` : ''}`}
      {...props}
    />
  );
};

// Componente especializado para objetivos
export const GoalStatsCard = ({ 
  title, 
  current, 
  target, 
  unit = '',
  icon,
  deadline,
  ...props 
}) => {
  const percentage = target !== 0 ? (current / target) * 100 : 0;
  const remaining = target - current;
  
  return (
    <StatsCard
      title={title}
      value={current}
      unit={unit}
      icon={icon}
      progress={{
        current,
        target,
        percentage
      }}
      description={deadline ? `Meta: ${new Date(deadline).toLocaleDateString('es-ES')}` : undefined}
      badge={
        percentage >= 100 
          ? { text: 'Completado', variant: 'success' }
          : percentage >= 80 
            ? { text: 'Cerca', variant: 'warning' }
            : { text: `Faltan ${remaining.toFixed(1)}${unit}`, variant: 'secondary' }
      }
      {...props}
    />
  );
};

// Componente especializado para métricas de tiempo
export const TimeStatsCard = ({ 
  title, 
  seconds, 
  icon,
  ...props 
}) => {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <StatsCard
      title={title}
      value={formatTime(seconds)}
      icon={icon || Clock}
      {...props}
    />
  );
};

export default StatsCard;