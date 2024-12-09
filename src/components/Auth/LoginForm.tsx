import React, { useState } from 'react';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Input, Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        toast.success('Revisa tu correo para restablecer la contraseña');
        setResetMode(false);
        return;
      }
      
      loginSchema.parse({ email, password });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Credenciales inválidas');
        }
        throw error;
      }
      
      toast.success('¡Bienvenido de nuevo!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    try {
      setLoading(true);
      
      if (!email) {
        throw new Error('Por favor ingresa tu correo electrónico');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      toast.success('Revisa tu correo para el enlace mágico');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al enviar el enlace mágico');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="flex flex-col gap-2 items-center">
        <h2 className="text-2xl font-bold">Eval 360°</h2>
        <p className="text-sm text-default-500">
          {resetMode ? 'Ingresa tu correo para restablecer la contraseña' : 'Ingresa tus credenciales para acceder'}
        </p>
      </CardHeader>
      <Divider/>
      <CardBody className="gap-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<Mail className="text-default-400" size={20}/>}
            isRequired
          />

          {!resetMode && (
            <Input
              type="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock className="text-default-400" size={20}/>}
              isRequired
            />
          )}

          <Button
            type="submit"
            color="default"
            className="w-full font-semibold"
            size="lg"
            isLoading={loading}
            spinner={<Loader2 className="animate-spin" size={20}/>}
            variant="shadow"
          >
            {resetMode ? 'Enviar enlace' : 'Iniciar sesión'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Divider/>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-content1 text-default-500">O continuar con</span>
          </div>
        </div>

        <Button
          onClick={handleMagicLink}
          variant="bordered"
          startContent={<Sparkles className="text-primary" size={20}/>}
          className="w-full"
          size="lg"
          isLoading={loading}
          spinner={<Loader2 className="animate-spin" size={20}/>}
        >
          Enlace mágico
        </Button>

        <Button
          onClick={() => setResetMode(!resetMode)}
          variant="light"
          className="w-full"
          size="lg"
        >
          {resetMode ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
        </Button>
      </CardBody>
    </Card>
  );
};

export default LoginForm;