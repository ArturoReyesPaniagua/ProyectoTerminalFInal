// components/shared/Pagination.jsx
import React from 'react';
import { clsx } from 'clsx';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight,
  FiMoreHorizontal
} from 'react-icons/fi';
import { Button, Select } from '../ui';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  showItemsPerPage = true,
  showPageInfo = true,
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  maxPageNumbers = 7,
  itemsPerPageOptions = [10, 25, 50, 100],
  size = 'md',
  variant = 'default',
  className = '',
  disabled = false,
  ...props
}) => {
  // Calcular elementos mostrados
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar números de página visibles
  const getVisiblePages = () => {
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);

    if (end - start < maxPageNumbers - 1) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }

    const pages = [];
    
    // Primera página
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Páginas del medio
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Última página
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Clases según tamaño
  const sizeClasses = {
    sm: {
      button: 'h-8 w-8 text-sm',
      select: 'text-xs h-8',
      text: 'text-xs'
    },
    md: {
      button: 'h-9 w-9 text-sm',
      select: 'text-sm h-9',
      text: 'text-sm'
    },
    lg: {
      button: 'h-10 w-10 text-base',
      select: 'text-base h-10',
      text: 'text-base'
    }
  };

  // Clases según variante
  const variantClasses = {
    default: 'border border-gray-300',
    minimal: 'border-0',
    outlined: 'border border-gray-200 bg-white'
  };

  const currentSize = sizeClasses[size];
  
  if (totalPages <= 1 && !showItemsPerPage && !showPageInfo) {
    return null;
  }

  return (
    <div 
      className={clsx(
        'flex items-center justify-between space-y-4 md:space-y-0',
        className
      )}
      {...props}
    >
      {/* Información de página */}
      {showPageInfo && (
        <div className={clsx('text-gray-700', currentSize.text)}>
          {totalItems > 0 ? (
            <>
              Mostrando <span className="font-medium">{startItem}</span> a{' '}
              <span className="font-medium">{endItem}</span> de{' '}
              <span className="font-medium">{totalItems}</span> resultados
            </>
          ) : (
            'No hay resultados'
          )}
        </div>
      )}

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          {/* Primera página */}
          {showFirstLast && (
            <Button
              variant="outline"
              size={size}
              onClick={() => onPageChange(1)}
              disabled={disabled || currentPage === 1}
              icon={<FiChevronsLeft className="w-4 h-4" />}
              className={currentSize.button}
            />
          )}

          {/* Página anterior */}
          {showPrevNext && (
            <Button
              variant="outline"
              size={size}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={disabled || currentPage === 1}
              icon={<FiChevronLeft className="w-4 h-4" />}
              className={currentSize.button}
            />
          )}

          {/* Números de página */}
          {showPageNumbers && (
            <div className="flex items-center space-x-1">
              {visiblePages.map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <div className="flex items-center justify-center w-9 h-9">
                      <FiMoreHorizontal className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : (
                    <Button
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size={size}
                      onClick={() => onPageChange(page)}
                      disabled={disabled}
                      className={clsx(
                        currentSize.button,
                        currentPage === page && 'bg-primary-600 text-white border-primary-600'
                      )}
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Página siguiente */}
          {showPrevNext && (
            <Button
              variant="outline"
              size={size}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={disabled || currentPage === totalPages}
              icon={<FiChevronRight className="w-4 h-4" />}
              className={currentSize.button}
            />
          )}

          {/* Última página */}
          {showFirstLast && (
            <Button
              variant="outline"
              size={size}
              onClick={() => onPageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              icon={<FiChevronsRight className="w-4 h-4" />}
              className={currentSize.button}
            />
          )}
        </div>
      )}

      {/* Selector de elementos por página */}
      {showItemsPerPage && (
        <div className="flex items-center space-x-2">
          <span className={clsx('text-gray-700', currentSize.text)}>
            Mostrar
          </span>
          <Select
            value={itemsPerPage}
            onChange={(value) => onItemsPerPageChange(parseInt(value))}
            disabled={disabled}
            size={size}
            className={clsx('w-20', currentSize.select)}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <span className={clsx('text-gray-700', currentSize.text)}>
            por página
          </span>
        </div>
      )}
    </div>
  );
};

// Componente simplificado para paginación básica
export const SimplePagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  disabled = false,
  className = '',
  ...props
}) => {
  if (totalPages <= 1) return null;

  return (
    <div 
      className={clsx('flex items-center justify-center space-x-2', className)}
      {...props}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        icon={<FiChevronLeft className="w-4 h-4" />}
      />
      
      <span className="text-sm text-gray-700 px-3">
        {currentPage} de {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        icon={<FiChevronRight className="w-4 h-4" />}
      />
    </div>
  );
};

// Componente para paginación compacta (móvil)
export const CompactPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  disabled = false,
  className = '',
  ...props
}) => {
  if (totalPages <= 1) return null;

  return (
    <div 
      className={clsx(
        'flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200',
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
        >
          <FiChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>
      </div>

      <div className="text-sm text-gray-700">
        Página {currentPage} de {totalPages}
      </div>

      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
        >
          Siguiente
          <FiChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Hook personalizado para manejo de paginación
export const usePagination = ({
  data = [],
  itemsPerPage = 10,
  initialPage = 1
}) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(itemsPerPage);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
  };

  return {
    currentPage,
    totalPages,
    pageSize,
    currentData,
    totalItems: data.length,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1
  };
};

export default Pagination;