import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Button,
  Card,
  CardBody,
  Avatar,
  Chip
} from '@nextui-org/react';
import { ArrowLeft, User, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Participant {
  id: string;
  full_name: string;
  email: string;
  department: string;
  status: 'pendiente' | 'en_progreso' | 'completado';
  evaluated?: 'pendiente' | 'completado';
  evaluated: 'pendiente' | 'completado';
}

const Evaluacion360: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evaluationTitle, setEvaluationTitle] = useState('');
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatosEvaluacion();
    }
  }, [id]);

    useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cargarDatosEvaluacion = async () => {
    try {
      setLoading(true);

      // Cargar detalles de la evaluación
      const { data: evaluacion, error: evaluacionError } = await supabase
        .from('evaluations')
        .select('title, participants')
        .eq('id', id)
        .single();

      if (evaluacionError) throw evaluacionError;

      if (evaluacion) {
        setEvaluationTitle(evaluacion.title);

        // Get all participants including evaluated user
        const participantIds = evaluacion.participants.map(
          (p: { id: string; status: string; evaluated?: string; }) => ({
            id: p.id,
            status: p.status,
            evaluated: p.evaluated
          })
        );

        const { data: participantsData, error: participantsError } = await supabase
          .from('profiles')
          .select('id, full_name, email, department')
          .in('id', participantIds.map(p => p.id));

        if (participantsError) throw participantsError;

        // Combinar datos de perfiles con estados
        const participantsWithStatus = participantsData?.map(participant => ({
          ...participant,
          status: participantIds.find(p => p.id === participant.id)?.status || 'pendiente',
          status: participantIds.find(p => p.id === participant.id)?.status || 'pendiente',
          evaluated: participantIds.find(p => p.id === participant.id)?.evaluated || 'pendiente'
        }));

        setParticipants(participantsWithStatus || []);
      }
    } catch (error) {
      console.error('Error al cargar datos de la evaluación:', error);
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarEvaluacion = (participantId: string) => {
    navigate(`/realizar-evaluacion/${id}?evaluated=${participantId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado':
        return 'success';
      case 'en_progreso':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_progreso':
        return 'En Progreso';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`fixed top-4 left-[283px] z-50 transition-opacity duration-300 ${
        isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <Button
          variant="solid"
          color="primary"
          startContent={<ArrowLeft size={20} />}
          onPress={() => navigate('/evaluaciones')}
          className="shadow-lg"
        >
          Regresar
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="light"
          startContent={<ArrowLeft size={20} />}
          onPress={() => navigate('/mis-evaluaciones')}
        >
          Regresar
        </Button>
      </div>

      <Card>
        <CardBody>
          <h2 className="text-2xl font-bold mb-6">{evaluationTitle}</h2>

          <Table aria-label="Tabla de participantes">
            <TableHeader>
              <TableColumn>Participante</TableColumn>
              <TableColumn>Departamento</TableColumn>
              <TableColumn>Estado</TableColumn>
              <TableColumn>Evaluado</TableColumn>
              <TableColumn>Acciones</TableColumn>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow 
                  key={participant.id}
                  className={participant.id === user?.id ? " bg-primary-50 border-solid border-1 border-secondary-100 "  : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        icon={<User size={20} />}
                        classNames={{
                          base: "bg-default/40",
                          icon: "text-default-600"
                        }}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{participant.full_name}</p>
                        <p className="text-small text-default-500">{participant.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{participant.department}</TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(participant.status)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusText(participant.status)}
                    </Chip>
                   
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(participant.evaluated)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusText(participant.evaluated)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {participant.evaluated !== 'completado' && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="ghost"
                        
                        startContent={<Play size={18} />}
                        onClick={() => handleIniciarEvaluacion(participant.id)}
                      >
                        Iniciar Evaluación
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default Evaluacion360;