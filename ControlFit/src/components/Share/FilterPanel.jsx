// components/shared/FilterPanel.jsx
import React, { useState } from 'react';
import { clsx } from 'clsx';
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiX, 
  FiSliders,
  FiCalendar,
  FiDollarSign,
  FiTag,
  FiUsers,
  FiRefreshCw
} from 'react-icons/fi';
import { Button, Badge, Input, Select } from '../ui';

const FilterPanel = ({
  filters = [],
  activeFilters = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
  onApplyFilters = () => {},
  collapsible = true,
  defaultCollapsed = false,
  showApplyButton = false,
  showClearButton = true,
  className = '',
  title = 'Filtros',
  ...props
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandedSections, setExpandedSections] = useState({});

  // Contar filtros activos
  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] !== undefined && activeFilters[key] !== '' && 
           (Array.isArray(activeFilters[key]) ? activeFilters[key].length > 0 : true)
  ).length;

  // Toggle sección expandida
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Manejar cambio de filtro
  const handleFilterChange = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div 
      className={clsx(
        'bg-white border border-gray-200 rounded-lg',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FiSliders className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-900">{title}</h3>
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {showClearButton && activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              icon={<FiRefreshCw className="w-4 h-4" />}
            >
              Limpiar
            </Button>
          )}
          
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <FiChevronDown className="w-4 h-4" /> : <FiChevronUp className="w-4 h-4" />}
            />
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-4 space-y-6">
          {filters.map((filter, index) => (
            <FilterSection
              key={filter.key || index}
              filter={filter}
              value={activeFilters[filter.key]}
              onChange={(value) => handleFilterChange(filter.key, value)}
              expanded={expandedSections[filter.key] !== false}
              onToggle={() => toggleSection(filter.key)}
            />
          ))}

          {/* Apply button */}
          {showApplyButton && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                size="md"
                onClick={onApplyFilters}
                className="w-full"
              >
                Aplicar Filtros
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para cada sección de filtro
const FilterSection = ({ filter, value, onChange, expanded, onToggle }) => {
  const renderFilterContent = () => {
    switch (filter.type) {
      case 'checkbox':
        return (
          <CheckboxFilter
            options={filter.options}
            value={value || []}
            onChange={onChange}
            multiple={filter.multiple}
          />
        );

      case 'radio':
        return (
          <RadioFilter
            options={filter.options}
            value={value}
            onChange={onChange}
          />
        );

      case 'range':
        return (
          <RangeFilter
            min={filter.min}
            max={filter.max}
            step={filter.step}
            value={value || { min: filter.min, max: filter.max }}
            onChange={onChange}
            format={filter.format}
          />
        );

      case 'date':
        return (
          <DateFilter
            value={value}
            onChange={onChange}
            mode={filter.mode} // 'single', 'range'
          />
        );

      case 'select':
        return (
          <SelectFilter
            options={filter.options}
            value={value}
            onChange={onChange}
            placeholder={filter.placeholder}
            multiple={filter.multiple}
          />
        );

      case 'search':
        return (
          <SearchFilter
            value={value || ''}
            onChange={onChange}
            placeholder={filter.placeholder}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          {filter.icon && <filter.icon className="w-4 h-4 text-gray-500" />}
          <h4 className="font-medium text-gray-900 text-sm">{filter.title}</h4>
          {value && getValueCount(value) > 0 && (
            <Badge variant="primary" size="sm">
              {getValueCount(value)}
            </Badge>
          )}
        </div>
        {expanded ? 
          <FiChevronUp className="w-4 h-4 text-gray-400" /> : 
          <FiChevronDown className="w-4 h-4 text-gray-400" />
        }
      </div>

      {/* Section content */}
      {expanded && (
        <div className="ml-6">
          {renderFilterContent()}
        </div>
      )}
    </div>
  );
};

// Filtro de checkbox
const CheckboxFilter = ({ options, value, onChange, multiple = true }) => {
  const handleChange = (optionValue, checked) => {
    if (multiple) {
      const newValue = checked 
        ? [...value, optionValue]
        : value.filter(v => v !== optionValue);
      onChange(newValue);
    } else {
      onChange(checked ? [optionValue] : []);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <label key={option.value || index} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
          {option.count !== undefined && (
            <span className="text-xs text-gray-500">({option.count})</span>
          )}
        </label>
      ))}
    </div>
  );
};

// Filtro de radio
const RadioFilter = ({ options, value, onChange }) => {
  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <label key={option.value || index} className="flex items-center space-x-2">
          <input
            type="radio"
            name={`radio-${Date.now()}`}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
          {option.count !== undefined && (
            <span className="text-xs text-gray-500">({option.count})</span>
          )}
        </label>
      ))}
    </div>
  );
};

// Filtro de rango
const RangeFilter = ({ min, max, step = 1, value, onChange, format = 'number' }) => {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN'
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{formatValue(value.min)}</span>
        <span>{formatValue(value.max)}</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: parseInt(e.target.value) })}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.max}
          onChange={(e) => onChange({ ...value, max: parseInt(e.target.value) })}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={value.min}
          onChange={(e) => onChange({ ...value, min: parseInt(e.target.value) || min })}
          min={min}
          max={value.max}
          size="sm"
        />
        <Input
          type="number"
          value={value.max}
          onChange={(e) => onChange({ ...value, max: parseInt(e.target.value) || max })}
          min={value.min}
          max={max}
          size="sm"
        />
      </div>
    </div>
  );
};

// Filtro de fecha
const DateFilter = ({ value, onChange, mode = 'single' }) => {
  if (mode === 'range') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={value?.start || ''}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          size="sm"
        />
        <Input
          type="date"
          value={value?.end || ''}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          size="sm"
        />
      </div>
    );
  }

  return (
    <Input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
    />
  );
};

// Filtro de select
const SelectFilter = ({ options, value, onChange, placeholder, multiple }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      multiple={multiple}
      size="sm"
    >
      {options.map((option, index) => (
        <option key={option.value || index} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

// Filtro de búsqueda
const SearchFilter = ({ value, onChange, placeholder = 'Buscar...' }) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      size="sm"
      icon={<FiTag className="w-4 h-4" />}
    />
  );
};

// Función auxiliar para contar valores activos
const getValueCount = (value) => {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).filter(key => value[key] !== undefined && value[key] !== '').length;
  }
  return value ? 1 : 0;
};

export default FilterPanel;