import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Card, CardHeader, CardBody, Input, Button, Divider } from '@nextui-org/react';

const signUpSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'El nombre completo es requerido'),
});

const SignUpForm: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      signUpSchema.parse({ email, password, fullName });
      
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: (await supabase.auth.getUser()).data.user?.id, 
          full_name: fullName,
          role: 'user'
        }]);

      if (profileError) throw profileError;
      
      toast.success('¡Revisa tu correo para confirmar tu cuenta!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ocurrió un error durante el registro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-center">Crear cuenta</h2>
      </CardHeader>
      <Divider/>
      <CardBody className="gap-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Nombre Completo"
            placeholder="Ingresa tu nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            startContent={<User className="text-default-400" size={20}/>}
            isRequired
          />

          <Input
            type="email"
            label="Correo Electrónico"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<Mail className="text-default-400" size={20}/>}
            isRequired
          />

          <Input
            type="password"
            label="Contraseña"
            placeholder="Crea una contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<Lock className="text-default-400" size={20}/>}
            isRequired
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
            spinner={<Loader2 className="animate-spin" size={20}/>}
          >
            Registrarse
          </Button>
        </form>

        <Button
          onClick={onToggle}
          variant="light"
          className="w-full"
        >
          ¿Ya tienes una cuenta? Inicia sesión
        </Button>
      </CardBody>
    </Card>
  );
};

export default SignUpForm;