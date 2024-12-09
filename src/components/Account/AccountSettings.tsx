import React, { useState } from 'react';
import { User, Shield, Loader2 } from 'lucide-react';
import { profileService } from '../../services/profile.service';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import type { Profile } from '../../types/auth.types';
import { supabase } from '../../lib/supabase';

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres'),
  department: z.string().min(2, 'El departamento es requerido'),
});

const AccountSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { user, profile } = useAuth();

  const updateProfile = async (formData: FormData) => {
    if (!user) return;

    try {
      setLoading(true);

      const updates = {
        full_name: formData.get('full_name') as string,
        department: formData.get('department') as string,
        updated_at: new Date().toISOString(),
      };

      profileSchema.parse(updates);
      await profileService.updateProfile(user.id, updates);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Error al actualizar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (formData: FormData) => {
    try {
      setLoading(true);
      const password = formData.get('new_password') as string;
      const confirmPassword = formData.get('confirm_password') as string;

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      toast.success('Contraseña actualizada exitosamente');
      
      const form = document.getElementById('password-form') as HTMLFormElement;
      form.reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al actualizar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'Seguridad', icon: <Shield className="w-5 h-5" /> }
  ];

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Pestañas">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile(new FormData(e.currentTarget));
              }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  defaultValue={profile.full_name || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Departamento
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  defaultValue={profile.department || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form
              id="password-form"
              onSubmit={(e) => {
                e.preventDefault();
                updatePassword(new FormData(e.currentTarget));
              }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;