// frontend/src/components/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Mail, Lock, Calendar, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Select, Card } from '../ui';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      termsAccepted: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      // Validar que las contraseñas coincidan
      if (data.password !== data.confirmPassword) {
        setError('confirmPassword', {
          message: 'Las contraseñas no coinciden',
        });
        return;
      }

      // Validar términos y condiciones
      if (!data.termsAccepted) {
        toast.error('Debes aceptar los términos y condiciones');
        return;
      }

      // Preparar datos para envío
      const registrationData = {
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      };

      const result = await registerUser(registrationData);

      if (result.success) {
        toast.success('¡Cuenta creada exitosamente! Bienvenido a ASECGC');
        navigate('/dashboard');
      } else {
        // Manejar errores específicos
        if (result.error.includes('email')) {
          setError('email', { message: result.error });
        } else if (result.error.includes('usuario')) {
          setError('username', { message: result.error });
        }
      }
    } catch (error) {
      console.error('Error inesperado en registro:', error);
      toast.error('Error inesperado. Por favor intenta de nuevo.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validar edad mínima
  const validateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      return 'Debes tener al menos 13 años para registrarte';
    }
    if (age > 120) {
      return 'Por favor ingresa una fecha válida';
    }
    return true;
  };

  // Opciones de género
  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Dumbbell className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Únete a ASECGC
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Comienza tu transformación fitness hoy
          </p>
        </div>

        {/* Formulario */}
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Nombre de usuario */}
            <Input
              id="username"
              label="Nombre de usuario"
              type="text"
              icon={<User className="w-4 h-4" />}
              placeholder="Elige tu nombre de usuario"
              error={errors.username?.message}
              {...register('username', {
                required: 'Nombre de usuario es requerido',
                minLength: {
                  value: 3,
                  message: 'Mínimo 3 caracteres',
                },
                maxLength: {
                  value: 30,
                  message: 'Máximo 30 caracteres',
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Solo letras, números y guiones bajos',
                },
              })}
            />

            {/* Email */}
            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              icon={<Mail className="w-4 h-4" />}
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email no válido',
                },
              })}
            />

            {/* Contraseña */}
            <div className="relative">
              <Input
                id="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                icon={<Lock className="w-4 h-4" />}
                placeholder="Crea una contraseña segura"
                error={errors.password?.message}
                helperText="Mínimo 8 caracteres, incluye mayúscula, minúscula, número y símbolo"
                {...register('password', {
                  required: 'Contraseña es requerida',
                  minLength: {
                    value: 8,
                    message: 'Mínimo 8 caracteres',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Debe incluir mayúscula, minúscula, número y símbolo',
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Confirmar contraseña */}
            <div className="relative">
              <Input
                id="confirmPassword"
                label="Confirmar contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={<Lock className="w-4 h-4" />}
                placeholder="Repite tu contraseña"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (value) =>
                    value === password || 'Las contraseñas no coinciden',
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Fecha de nacimiento */}
            <Input
              id="dateOfBirth"
              label="Fecha de nacimiento"
              type="date"
              icon={<Calendar className="w-4 h-4" />}
              error={errors.dateOfBirth?.message}
              max={new Date().toISOString().split('T')[0]} // No fechas futuras
              {...register('dateOfBirth', {
                required: 'Fecha de nacimiento es requerida',
                validate: validateAge,
              })}
            />

            {/* Género */}
            <Select
              id="gender"
              label="Género"
              options={genderOptions}
              placeholder="Selecciona tu género"
              error={errors.gender?.message}
              {...register('gender', {
                required: 'Género es requerido',
              })}
            />

            {/* Términos y condiciones */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  {...register('termsAccepted', {
                    required: 'Debes aceptar los términos y condiciones',
                  })}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="termsAccepted" className="text-gray-700">
                  Acepto los{' '}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:text-primary-500"
                    target="_blank"
                  >
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-500"
                    target="_blank"
                  >
                    política de privacidad
                  </Link>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            </div>

            {/* Botón de envío */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            {/* Link a login */}
            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </Card>

        {/* Beneficios del registro */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Al unirte obtienes:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  Seguimiento personalizado de progreso
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  Rutinas adaptadas a tu nivel
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  Analytics detallados y recomendaciones
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">
                  ¡Completamente gratis!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;