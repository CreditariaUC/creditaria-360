import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, Input, Button, Divider } from '@nextui-org/react';

const PasswordReset: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      toast.error('Enlace de recuperación inválido');
      navigate('/');
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      toast.success('Contraseña actualizada exitosamente');
      navigate('/');
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

  if (!searchParams.get('code')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
        <Card className="max-w-md w-full">
          <CardBody>
            <p className="text-center text-default-500">
              Enlace de recuperación inválido. Por favor solicita uno nuevo.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-center">Restablecer contraseña</h2>
          <p className="text-center text-default-500">
            Por favor ingresa tu nueva contraseña
          </p>
        </CardHeader>
        <Divider/>
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="password"
              name="password"
              type="password"
              label="Nueva Contraseña"
              placeholder="Ingresa tu nueva contraseña"
              startContent={<Lock className="text-default-400" size={20}/>}
              isRequired
              minLength={6}
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar Nueva Contraseña"
              placeholder="Confirma tu nueva contraseña"
              startContent={<Lock className="text-default-400" size={20}/>}
              isRequired
              minLength={6}
            />

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
              spinner={<Loader2 className="animate-spin" size={20}/>}
            >
              Restablecer Contraseña
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PasswordReset;