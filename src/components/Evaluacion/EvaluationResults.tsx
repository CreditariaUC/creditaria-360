import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Spinner, Button } from '@nextui-org/react';
import { Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { generatePDF } from '../../utils/pdfUtils';

interface EvaluationResultsProps {
  evaluationId: string;
}

interface CriteriaResponse {
  id: string;
  name: string;
  description: string;
  average: number;
  selfEvaluation: number;
}

interface EvaluationInfo {
  title: string;
  evaluatedName: string;
  evaluatedDepartment: string;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({ evaluationId }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<CriteriaResponse[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [evaluationInfo, setEvaluationInfo] = useState<EvaluationInfo | null>(null);

  useEffect(() => {
    loadResults();
  }, [evaluationId]);

  const loadResults = async () => {
    try {
      setLoading(true);

      // Fetch evaluation details including title and evaluated user
      const { data: evaluation, error: evaluationError } = await supabase
        .from('evaluations')
        .select('title, evaluation_criteria, evaluated_id')
        .eq('id', evaluationId)
        .single();

      if (evaluationError) throw evaluationError;

      // Fetch evaluated user details
      const { data: evaluatedUser, error: userError } = await supabase
        .from('profiles')
        .select('full_name, department')
        .eq('id', evaluation.evaluated_id)
        .single();

      if (userError) throw userError;

      setEvaluationInfo({
        title: evaluation.title,
        evaluatedName: evaluatedUser.full_name,
        evaluatedDepartment: evaluatedUser.department
      });

      const { data: criteriaData, error: criteriaError } = await supabase
        .from('evaluation_criteria')
        .select('id, name, description')
        .in('id', evaluation.evaluation_criteria);

      if (criteriaError) throw criteriaError;

      const { data: responsesData, error: responsesError } = await supabase
        .from('evaluation_responses')
        .select('responses, evaluation_participant_id')
        .eq('evaluation_id', evaluationId);

      if (responsesError) throw responsesError;

      const results = criteriaData.map(criterion => {
        const selfEvaluation = responsesData
          .find(response => response.evaluation_participant_id === evaluation.evaluated_id)
          ?.responses[criterion.id] || 0;

        const otherResponses = responsesData
          .filter(response => response.evaluation_participant_id !== evaluation.evaluated_id)
          .map(response => response.responses[criterion.id])
          .filter(Boolean);

        const average = otherResponses.length
          ? otherResponses.reduce((sum: number, score: number) => sum + score, 0) / otherResponses.length
          : 0;

        return {
          ...criterion,
          average: Number(average.toFixed(2)),
          selfEvaluation: Number(selfEvaluation.toFixed(2))
        };
      });

      setResults(results);
    } catch (error) {
      console.error('Error loading evaluation results:', error);
      toast.error('Error al cargar los resultados de la evaluación');
    } finally {
      setLoading(false);
    }
  };

  // In src/components/Evaluacion/EvaluationResults.tsx
// Update the handleDownloadPDF function:

const handleDownloadPDF = async () => {
  try {
    setDownloading(true);
    if (!evaluationInfo) {
      throw new Error('Evaluation information not available');
    }

    // Format current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    // Format filename
    const fileName = `${evaluationInfo.title.replace(/\s+/g, '_')}_${evaluationInfo.evaluatedName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
    
    await generatePDF(
      'evaluation-results', 
      fileName,
      evaluationInfo
    );
    toast.success('PDF generado exitosamente');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Error al generar el PDF');
  } finally {
    setDownloading(false);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const chartData = results.map(result => ({
    name: result.name,
    percepcion: result.average,
    autoevaluacion: result.selfEvaluation,
    fullMark: 5
  }));

  return (
    <div className="space-y-6">
      <div id="evaluation-results" className="space-y-6 bg-white p-6 rounded-lg">
        

        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar
                name="Percepción"
                dataKey="percepcion"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.6}
              />
              <Radar
                name="Autoevaluación"
                dataKey="autoevaluacion"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Detalle por Criterio</h4>
          <div className="grid gap-4">
            {results.map((result) => (
              <div key={result.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-800">{result.name}</h5>
                    <p className="text-sm text-gray-600">{result.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Percepción</p>
                      <p className="text-lg font-semibold text-primary">{result.average}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Autoevaluación</p>
                      <p className="text-lg font-semibold text-green-600">{result.selfEvaluation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          color="primary"
          variant="ghost"
          startContent={<Download size={20} />}
          onPress={handleDownloadPDF}
          isLoading={downloading}
        >
          Descargar Resultados
        </Button>
      </div>
    </div>
  );
};

export default EvaluationResults;