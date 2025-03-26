import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardBody, Button, Slider } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import EvaluatedEmployeeCard from './EvaluatedEmployeeCard';

interface Criterio {
  id: string;
  name: string;
  description: string;
}

interface ParticipantStatus {
  id: string;
  status: 'pendiente' | 'en_progreso' | 'completado';
  evaluated?: 'pendiente' | 'completado';
}

interface EvaluatedEmployee {
  full_name: string;
  department: string;
}

const calificacionesDescriptivas = {
  1: 'Nunca',
  2: 'Casi Nunca',
  3: 'Neutro',
  4: 'Casi Siempre',
  5: 'Siempre'
};

const RealizarEvaluacion: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const evaluatedId = searchParams.get('evaluated');
  const [loading, setLoading] = useState(true);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [calificaciones, setCalificaciones] = useState<{ [key: string]: number }>({});
  const [evaluacionTitle, setEvaluacionTitle] = useState('');
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [evaluatedEmployee, setEvaluatedEmployee] = useState<EvaluatedEmployee | null>(null);
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

   useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    cargarDatosEvaluacion();
  }, [id, evaluatedId]);

  const cargarDatosEvaluacion = async () => {
    try {
      setLoading(true);
      
      // Cargar detalles de la evaluación
      const { data: evaluacion, error: evaluacionError } = await supabase
        .from('evaluations')
        .select('title, evaluation_criteria, participants, evaluated_id')
        .eq('id', id)
        .single();

      if (evaluacionError) throw evaluacionError;
      
      if (evaluacion) {
        setEvaluacionTitle(evaluacion.title);
        setParticipants(evaluacion.participants);
        
        // Cargar datos del empleado evaluado
        const targetId = evaluatedId || evaluacion.evaluated_id;
        const { data: evaluatedData, error: evaluatedError } = await supabase
          .from('profiles')
          .select('full_name, department')
          .eq('id', targetId)
          .single();

        if (evaluatedError) throw evaluatedError;
        if (evaluatedData) {
          setEvaluatedEmployee(evaluatedData);
        }
        
        // Cargar criterios
        const { data: criteriosData, error: criteriosError } = await supabase
          .from('evaluation_criteria')
          .select('id, name, description')
          .in('id', evaluacion.evaluation_criteria);

        if (criteriosError) throw criteriosError;
        
        if (criteriosData) {
          setCriterios(criteriosData);
          // Inicializar calificaciones
          const calificacionesIniciales = criteriosData.reduce((acc, criterio) => ({
            ...acc,
            [criterio.id]: 1
          }), {});
          setCalificaciones(calificacionesIniciales);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos de la evaluación:', error);
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleCalificacionChange = (criterioId: string, valor: number) => {
    setCalificaciones(prev => ({ ...prev, [criterioId]: valor }));
  };

  const updateParticipantStatus = async () => {
    try {
      if (!user) throw new Error('No user found');

      const { data: evaluacion } = await supabase
        .from('evaluations')
        .select('evaluation_type, evaluated_id')
        .eq('id', id)
        .single();

      if (!evaluacion) throw new Error('Evaluation not found');
      const isEvaluated = evaluacion.evaluated_id === user.id;
      const is360Evaluation = evaluacion.evaluation_type === '360';

      let updatedParticipants;

      if (is360Evaluation && isEvaluated) {
        // If it's a 360° evaluation and the current user is the evaluated person
        updatedParticipants = participants.map(p => ({
          ...p,
          evaluated: p.id === evaluatedId ? 'completado' : p.evaluated || 'pendiente',
          // Update status to 'completado' if all evaluations are completed
          status: p.id === user.id && 
                 participants.every(participant => 
                   participant.evaluated === 'completado' || 
                   participant.id === evaluatedId
                 ) ? 'completado' : p.status
        }));
      } else {
        // For simple evaluations or when the user is a participant in a 360° evaluation
        updatedParticipants = participants.map(p => ({
          ...p,
          status: p.id === user.id ? 'completado' : p.status
        }));
      }

      const { error } = await supabase
        .from('evaluations')
        .update({ 
          participants: updatedParticipants,
          status: checkEvaluationCompletion(updatedParticipants, evaluacion.evaluation_type) ? 
                 'completado' : 
                 'iniciado'
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error al actualizar el estado del participante:', error);
      throw error;
    }
  };

  const checkEvaluationCompletion = (participants: ParticipantStatus[], evaluationType: string): boolean => {
    if (evaluationType === '360') {
      // For 360° evaluations, check if all participants have both status and evaluated as 'completado'
      return participants.every(p => {
        const hasCompletedStatus = p.status === 'completado';
        const hasCompletedEvaluation = p.evaluated === 'completado';
        return hasCompletedStatus && hasCompletedEvaluation;
      });
    }
    return participants.every(p => p.status === 'completado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Get evaluation type
      const { data: evaluacion } = await supabase
        .from('evaluations')
        .select('evaluation_type, evaluated_id')
        .eq('id', id)
        .single();

      // First, save the evaluation responses
      const { error: responseError } = await supabase
        .from('evaluation_responses')
        .insert({
          evaluation_id: id,
          evaluation_participant_id: user?.id,
          evaluated_id: evaluatedId || undefined,
          responses: calificaciones,
        });

      if (responseError) throw responseError;

      // Then, update the participant's status
      await updateParticipantStatus();
      
      toast.success('Evaluación enviada exitosamente');
      
      // If it's a 360° evaluation and the user is the evaluated person, return to the participants list
      if (evaluacion?.evaluation_type === '360' && evaluacion?.evaluated_id === user?.id) {
        navigate(`/evaluacion-360/${id}`);
      } else {
        navigate('/mis-evaluaciones');
      }

    } catch (error) {
      console.error('Error al enviar la evaluación:', error);
      toast.error('Error al enviar la evaluación');
    } finally {
      setLoading(false);
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
    <div className="space-y-6 ">
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
        <CardBody className="gap-6">
          <h2 className="text-2xl font-bold">{evaluacionTitle}</h2>
          
          {evaluatedEmployee && (
            <EvaluatedEmployeeCard
              fullName={evaluatedEmployee.full_name}
              department={evaluatedEmployee.department}
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8 flex justify-center">
            <div className="space-y-8 ">
              {criterios.map((criterio) => (
                <div key={criterio.id} className="space-y-3 ">
                  <div>
                    <h4 className="font-medium text-foreground">{criterio.name}</h4>
                    <p className="text-sm text-foreground-500">{criterio.description}</p>
                  </div>

                  <div className="space-y-2 ">
                    <Slider
                      label="Calificación"
                      step={1}
                      maxValue={5}
                      minValue={1}
                      value={calificaciones[criterio.id] || 1}
                      onChange={(value) => handleCalificacionChange(criterio.id, value as number)}
                      className="max-w-md"
                      showSteps={true}
                      marks={[
                        { value: 1, label: "1" },
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                        { value: 5, label: "5" }
                      ]}
                    />
                    {calificaciones[criterio.id] && (
                      <p className="text-sm text-primary font-medium">
                        {calificacionesDescriptivas[calificaciones[criterio.id] as keyof typeof calificacionesDescriptivas]}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-between gap-3">
              <Button
                variant="ghost"
                color="danger"
                onPress={() => navigate('/mis-evaluaciones')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
              >
                Enviar Evaluación
              </Button>
            </div>
            </div>

            
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default RealizarEvaluacion;