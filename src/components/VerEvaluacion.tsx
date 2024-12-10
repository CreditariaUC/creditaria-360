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
  Button
} from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Participant {
  id: string;
  full_name: string;
  email: string;
  department: string;
}

const VerEvaluacion: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evaluationTitle, setEvaluationTitle] = useState('');

  useEffect(() => {
    fetchEvaluationDetails();
  }, [id]);

  const fetchEvaluationDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch evaluation details
      const { data: evaluation, error: evaluationError } = await supabase
        .from('evaluations')
        .select('title, participants')
        .eq('id', id)
        .single();

      if (evaluationError) throw evaluationError;
      
      if (evaluation) {
        setEvaluationTitle(evaluation.title);
        
        // Fetch participants details
        const { data: participantsData, error: participantsError } = await supabase
          .from('profiles')
          .select('id, full_name, email, department')
          .in('id', evaluation.participants);

        if (participantsError) throw participantsError;
        
        if (participantsData) {
          setParticipants(participantsData);
        }
      }
    } catch (error) {
      console.error('Error fetching evaluation details:', error);
      toast.error('Error al cargar los detalles de la evaluación');
    } finally {
      setLoading(false);
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="light"
          startContent={<ArrowLeft size={20} />}
          onPress={() => navigate('/mis-evaluaciones')}
        >
          Regresar
        </Button>
      </div>

      <Card className="max-w-6xl mx-auto">
        <CardBody>
          <h2 className="text-2xl font-bold mb-6">{evaluationTitle}</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Participantes</h3>
            <Table aria-label="Tabla de participantes">
              <TableHeader>
                <TableColumn>Nombre</TableColumn>
                <TableColumn>Correo</TableColumn>
                <TableColumn>Departamento</TableColumn>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>{participant.full_name}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>{participant.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default VerEvaluacion;