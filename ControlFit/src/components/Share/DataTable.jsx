// components/shared/DataTable.jsx
import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  FiChevronUp, 
  FiChevronDown, 
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiCopy
} from 'react-icons/fi';
import { Button, Badge } from '../ui';
import EmptyState from './EmptyState';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  selectable = false,
  sortable = true,
  actions = null,
  onRowClick = null,
  selectedRows = [],
  onSelectionChange = () => {},
  emptyStateProps = {},
  className = '',
  size = 'md',
  variant = 'default',
  stickyHeader = false,
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [hoveredRow, setHoveredRow] = useState(null);

  // Memoizar datos ordenados
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Manejar ordenamiento
  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Manejar selección de filas
  const handleRowSelection = (rowId, checked) => {
    if (checked) {
      onSelectionChange([...selectedRows, rowId]);
    } else {
      onSelectionChange(selectedRows.filter(id => id !== rowId));
    }
  };

  // Manejar selección de todas las filas
  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(data.map(row => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  // Renderizar celda
  const renderCell = (row, column) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'badge') {
      return (
        <Badge 
          variant={column.getBadgeVariant?.(value) || 'default'}
          size="sm"
        >
          {value}
        </Badge>
      );
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'currency') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(value);
    }

    return value;
  };

  // Clases según tamaño
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Clases según variante
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    minimal: 'bg-white',
    card: 'bg-white rounded-lg shadow-sm border border-gray-200'
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState type="search" {...emptyStateProps} />;
  }

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div 
      className={clsx(
        'overflow-hidden',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead 
            className={clsx(
              'bg-gray-50',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {/* Checkbox de selección */}
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}

              {/* Columnas */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider',
                    sizeClasses[size],
                    column.sortable !== false && sortable && 'cursor-pointer hover:bg-gray-100',
                    column.className
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable !== false && sortable && (
                      <div className="flex flex-col">
                        <FiChevronUp 
                          className={clsx(
                            'w-3 h-3 -mb-1',
                            sortConfig.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-primary-600' 
                              : 'text-gray-300'
                          )}
                        />
                        <FiChevronDown 
                          className={clsx(
                            'w-3 h-3',
                            sortConfig.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-primary-600' 
                              : 'text-gray-300'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {/* Columna de acciones */}
              {actions && (
                <th className="px-6 py-3 text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, index) => (
              <tr
                key={row.id || index}
                className={clsx(
                  'hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer',
                  selectedRows.includes(row.id) && 'bg-primary-50'
                )}
                onClick={() => onRowClick?.(row)}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Checkbox de selección */}
                {selectable && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelection(row.id, e.target.checked);
                      }}
                    />
                  </td>
                )}

                {/* Celdas de datos */}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx(
                      'px-6 py-4 whitespace-nowrap',
                      sizeClasses[size],
                      column.cellClassName
                    )}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}

                {/* Acciones */}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <RowActions 
                      row={row} 
                      actions={actions}
                      visible={hoveredRow === index}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente para acciones de fila
const RowActions = ({ row, actions, visible }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Acciones predefinidas
  const defaultActions = {
    view: { icon: FiEye, label: 'Ver', variant: 'ghost' },
    edit: { icon: FiEdit, label: 'Editar', variant: 'ghost' },
    delete: { icon: FiTrash2, label: 'Eliminar', variant: 'ghost' },
    copy: { icon: FiCopy, label: 'Copiar', variant: 'ghost' },
    download: { icon: FiDownload, label: 'Descargar', variant: 'ghost' }
  };

  if (typeof actions === 'function') {
    return actions(row);
  }

  if (Array.isArray(actions)) {
    const visibleActions = actions.filter(action => !action.hidden?.(row));

    if (visibleActions.length <= 2) {
      return (
        <div className={clsx(
          'flex items-center space-x-1 transition-opacity',
          visible ? 'opacity-100' : 'opacity-0'
        )}>
          {visibleActions.map((action, index) => {
            const config = defaultActions[action.key] || action;
            return (
              <Button
                key={index}
                variant={config.variant || 'ghost'}
                size="sm"
                icon={config.icon && <config.icon className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.(row);
                }}
                disabled={action.disabled?.(row)}
              >
                {config.showLabel && config.label}
              </Button>
            );
          })}
        </div>
      );
    }

    // Dropdown para múltiples acciones
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          icon={<FiMoreVertical className="w-4 h-4" />}
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
        />

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {visibleActions.map((action, index) => {
                const config = defaultActions[action.key] || action;
                return (
                  <button
                    key={index}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.(row);
                      setShowDropdown(false);
                    }}
                    disabled={action.disabled?.(row)}
                  >
                    {config.icon && <config.icon className="w-4 h-4 mr-2" />}
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DataTable;