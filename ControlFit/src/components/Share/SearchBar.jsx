// components/shared/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { 
  FiSearch, 
  FiX, 
  FiFilter,
  FiChevronDown,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';
import { Button, Badge } from '../ui';

const SearchBar = ({
  value = '',
  onChange = () => {},
  onSearch = () => {},
  placeholder = 'Buscar...',
  suggestions = [],
  recentSearches = [],
  quickFilters = [],
  activeFilters = [],
  onFilterToggle = () => {},
  onClear = () => {},
  showFilters = false,
  onFiltersToggle = () => {},
  loading = false,
  debounceMs = 300,
  size = 'md',
  variant = 'default',
  className = '',
  autoFocus = false,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Sincronizar valor interno con prop externa
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
        onSearch(internalValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [internalValue, debounceMs, onChange, onSearch, value]);

  // Manejar cambio de input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setSelectedSuggestion(-1);
    
    // Mostrar sugerencias si hay texto
    if (newValue.trim() && (suggestions.length > 0 || recentSearches.length > 0)) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Manejar teclas
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const allSuggestions = [...suggestions, ...recentSearches];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          const suggestion = allSuggestions[selectedSuggestion];
          handleSuggestionClick(suggestion);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Manejar clic en sugerencia
  const handleSuggestionClick = (suggestion) => {
    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
    setInternalValue(suggestionText);
    onChange(suggestionText);
    onSearch(suggestionText);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  // Manejar búsqueda
  const handleSearch = () => {
    onSearch(internalValue);
    setShowSuggestions(false);
  };

  // Limpiar búsqueda
  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Clases según tamaño
  const sizeClasses = {
    sm: {
      container: 'h-8',
      input: 'text-sm px-3',
      icon: 'w-4 h-4',
      button: 'p-1'
    },
    md: {
      container: 'h-10',
      input: 'text-sm px-4',
      icon: 'w-4 h-4',
      button: 'p-2'
    },
    lg: {
      container: 'h-12',
      input: 'text-base px-4',
      icon: 'w-5 h-5',
      button: 'p-2'
    }
  };

  // Clases según variante
  const variantClasses = {
    default: 'border-gray-300 focus-within:border-primary-500 focus-within:ring-primary-500',
    minimal: 'border-transparent bg-gray-100 focus-within:bg-white focus-within:border-gray-300',
    filled: 'border-transparent bg-gray-100 focus-within:bg-gray-50'
  };

  const currentSize = sizeClasses[size];
  const allSuggestions = [...suggestions, ...recentSearches];

  return (
    <div className={clsx('relative', className)} {...props}>
      {/* Contenedor principal */}
      <div
        className={clsx(
          'flex items-center border rounded-lg transition-all duration-200',
          variantClasses[variant],
          currentSize.container,
          showSuggestions && 'rounded-b-none'
        )}
      >
        {/* Icono de búsqueda */}
        <div className={clsx('flex items-center justify-center text-gray-400', currentSize.button)}>
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <FiSearch className={currentSize.icon} />
          )}
        </div>

        {/* Campo de entrada */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (internalValue.trim() && allSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            // Delay para permitir clic en sugerencias
            setTimeout(() => {
              if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
                setSelectedSuggestion(-1);
              }
            }, 150);
          }}
          placeholder={placeholder}
          className={clsx(
            'flex-1 border-0 bg-transparent focus:outline-none focus:ring-0',
            currentSize.input
          )}
        />

        {/* Filtros activos */}
        {activeFilters.length > 0 && (
          <div className="flex items-center space-x-1 mr-2">
            {activeFilters.slice(0, 2).map((filter, index) => (
              <Badge
                key={index}
                variant="primary"
                size="sm"
                className="cursor-pointer"
                onClick={() => onFilterToggle(filter)}
              >
                {filter.label}
                <FiX className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {activeFilters.length > 2 && (
              <Badge variant="outline" size="sm">
                +{activeFilters.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Botón de limpiar */}
        {internalValue && (
          <button
            onClick={handleClear}
            className={clsx(
              'flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors',
              currentSize.button
            )}
          >
            <FiX className={currentSize.icon} />
          </button>
        )}

        {/* Botón de filtros */}
        {quickFilters.length > 0 && (
          <button
            onClick={onFiltersToggle}
            className={clsx(
              'flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors border-l border-gray-200 ml-2',
              currentSize.button,
              showFilters && 'text-primary-600'
            )}
          >
            <FiFilter className={currentSize.icon} />
          </button>
        )}
      </div>

      {/* Panel de sugerencias */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-300 rounded-b-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* Sugerencias de búsqueda */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                Sugerencias
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={clsx(
                    'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2',
                    selectedSuggestion === index && 'bg-primary-50'
                  )}
                >
                  <FiTrendingUp className="w-4 h-4 text-gray-400" />
                  <span>{typeof suggestion === 'string' ? suggestion : suggestion.text}</span>
                  {typeof suggestion === 'object' && suggestion.count && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {suggestion.count} resultados
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Búsquedas recientes */}
          {recentSearches.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                Búsquedas recientes
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className={clsx(
                    'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2',
                    selectedSuggestion === suggestions.length + index && 'bg-primary-50'
                  )}
                >
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel de filtros rápidos */}
      {showFilters && quickFilters.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-40 mt-2 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Filtros rápidos</h4>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => onFilterToggle(filter)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-sm border transition-colors',
                    activeFilters.some(f => f.key === filter.key)
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <button
              onClick={() => {
                activeFilters.forEach(filter => onFilterToggle(filter));
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar filtros
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={onFiltersToggle}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;