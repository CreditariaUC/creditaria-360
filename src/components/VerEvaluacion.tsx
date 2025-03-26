import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Card,
  CardBody,
  Spinner,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Progress,
  Tabs,
  Tab
} from '@nextui-org/react';
import { ArrowLeft, Trash2, Users, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import EvaluationResults from './Evaluacion/EvaluationResults';
import EvaluatedEmployeeCard from './Evaluacion/EvaluatedEmployeeCard';

interface Participant {
  id: string;
  full_name: string;
  email: string;
  department: string;
  status: 'pendiente' | 'en_progreso' | 'completado';
}

interface ParticipantData {
  id: string;
  status: 'pendiente' | 'en_progreso' | 'completado';
}

interface EvaluatedEmployee {
  full_name: string;
  department: string;
}

const VerEvaluacion: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evaluationTitle, setEvaluationTitle] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { profile } = useAuth();
  const [evaluatedEmployee, setEvaluatedEmployee] = useState<EvaluatedEmployee | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchEvaluationDetails();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('evaluation_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'evaluations',
          filter: `id=eq.${id}`
        },
        async (payload) => {
          // When evaluation is updated, refresh participant data
          const updatedParticipants = payload.new.participants as ParticipantData[];
          await updateParticipantsData(updatedParticipants);
        }
      )
      .subscribe();

    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

   useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const calculateCompletionPercentage = (participants: Participant[]) => {
    const completedCount = participants.filter(p => p.status === 'completado').length;
    return Math.round((completedCount / participants.length) * 100);
  };

  const updateParticipantsData = async (participantsData: ParticipantData[]) => {
    try {
      const participantIds = participantsData.map(p => p.id);
      
      // Create a map of participant statuses
      const statusMap = participantsData.reduce((acc, p) => ({
        ...acc,
        [p.id]: p.status
      }), {} as { [key: string]: string });
      
      // Fetch participants details
      const { data: participantsDetails, error: participantsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .in('id', participantIds);

      if (participantsError) throw participantsError;
      
      if (participantsDetails) {
        // Combine participant details with their status
        const participantsWithStatus = participantsDetails.map(p => ({
          ...p,
          status: statusMap[p.id]
        }));
        setParticipants(participantsWithStatus);
        setCompletionPercentage(calculateCompletionPercentage(participantsWithStatus));
      }
    } catch (error) {
      console.error('Error updating participants data:', error);
      toast.error('Error al actualizar los datos de los participantes');
    }
  };

  const fetchEvaluationDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch evaluation details
      const { data: evaluation, error: evaluationError } = await supabase
        .from('evaluations')
        .select('title, participants, evaluated_id')
        .eq('id', id)
        .single();

      if (evaluationError) throw evaluationError;
      
      if (evaluation) {
        setEvaluationTitle(evaluation.title);
        await updateParticipantsData(evaluation.participants as ParticipantData[]);

        // Fetch evaluated employee details
        const { data: evaluatedData, error: evaluatedError } = await supabase
          .from('profiles')
          .select('full_name, department')
          .eq('id', evaluation.evaluated_id)
          .single();

        if (evaluatedError) throw evaluatedError;
        if (evaluatedData) {
          setEvaluatedEmployee(evaluatedData);
        }
      }
    } catch (error) {
      console.error('Error fetching evaluation details:', error);
      toast.error('Error al cargar los detalles de la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Evaluación eliminada exitosamente');
      navigate('/evaluaciones');
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('Error al eliminar la evaluación');
    } finally {
      setDeleteLoading(false);
      onClose();
    }
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
        <Spinner size="lg" />
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

      <div className={`flex justify-between gap-4 ${isScrolled ? 'invisible' : ''}`}>
        <Button
          variant="light"
          startContent={<ArrowLeft size={20} />}
          onPress={() => navigate('/evaluaciones')}
        >
          Regresar
        </Button>
        {profile?.role === 'admin' && (
          <Button
            color="danger"
            
            variant="ghost"
            startContent={<Trash2 size={20} />}
            onPress={onOpen}
          >
            Eliminar Evaluación
          </Button>
        )}
      </div>
    
   

      <Card className="max-w-6xl mx-auto">
        <CardBody>
          <h2 className="text-2xl font-bold mb-6">{evaluationTitle}</h2>
          
          {evaluatedEmployee && (
            <div className="mb-6">
              <EvaluatedEmployeeCard
                fullName={evaluatedEmployee.full_name}
                department={evaluatedEmployee.department}
              />
            </div>
          )}
          
          <Tabs aria-label="Evaluación" color="primary">
            <Tab
              
              key="participants"
              title={
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>Participantes</span>
                </div>
              }
            >
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Participantes</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Progreso: {completionPercentage}%
                    </span>
                    <Progress 
                      aria-label="Progreso de la evaluación"
                      value={completionPercentage}
                      className="w-32"
                      color={completionPercentage === 100 ? "success" : "primary"}
                    />
                  </div>
                </div>
                <Table aria-label="Tabla de participantes">
                  <TableHeader>
                    <TableColumn>Nombre</TableColumn>
                    <TableColumn>Correo</TableColumn>
                    <TableColumn>Departamento</TableColumn>
                    <TableColumn>Estado</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.full_name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
            <Tab
              key="results"
              title={
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  <span>Resultados</span>
                </div>
              }
            >
              <div className="py-4">
                <EvaluationResults evaluationId={id || ''} />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={deleteLoading}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default VerEvaluacion;