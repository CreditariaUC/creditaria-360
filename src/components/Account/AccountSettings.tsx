import React, { useState } from 'react';
import { User, Shield, Loader2 } from 'lucide-react';
import { profileService } from '../../services/profile.service';
import toast from 'react-hot-toast';
import { Tabs, Tab, Input, Button, Spinner } from '@nextui-org/react';
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
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs 
        color="primary" variant="bordered"
        aria-label="Opciones"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab
          key="profile"
          title={
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>Perfil</span>
            </div>
          }
        >
          <div className="mt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile(new FormData(e.currentTarget));
              }}
              className="space-y-6"
            >
      

              <Input
                type="text"
                label="Nombre Completo"
                name="full_name"
                defaultValue={profile.full_name || ''}
              />

              <Input
                type="text"
                label="Departamento"
                name="department"
                defaultValue={profile.department || ''}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="primary"
                  isLoading={loading}
                  spinner={<Spinner size="sm" />}
                >
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </Tab>

        <Tab
          key="security"
          title={
            <div className="flex items-center gap-2">
              <Shield size={18} />
              <span>Seguridad</span>
            </div>
          }
        >
          <div className="mt-4">
            <form
              id="password-form"
              onSubmit={(e) => {
                e.preventDefault();
                updatePassword(new FormData(e.currentTarget));
              }}
              className="space-y-6"
            >
              <Input
                type="password"
                label="Nueva Contraseña"
                name="new_password"
                required
                minLength={6}
              />

              <Input
                type="password"
                label="Confirmar Nueva Contraseña"
                name="confirm_password"
                required
                minLength={6}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="primary"
                  isLoading={loading}
                  spinner={<Spinner size="sm" />}
                >
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AccountSettings;