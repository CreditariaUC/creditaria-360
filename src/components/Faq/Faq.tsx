import React, { useState, useMemo } from 'react';
import FaqBuscador from './FaqBuscador';
import FaqCategoria from './FaqCategoria';
import FaqItem from './FaqItem';
import { HelpCircle } from 'lucide-react';

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

interface CategoriaPreguntas {
  [key: string]: PreguntaFrecuente[];
}

const preguntas: CategoriaPreguntas = {
  general: [
    {
      pregunta: "¿Qué es una evaluación 360°?",
      respuesta: "Una evaluación 360° es un sistema integral de evaluación del desempeño que recopila retroalimentación de múltiples fuentes: supervisores, compañeros, subordinados y autoevaluación. Este enfoque holístico proporciona una visión completa y objetiva del rendimiento del empleado, permitiendo identificar fortalezas y áreas de mejora desde diferentes perspectivas."
    },
    {
      pregunta: "¿Con qué frecuencia se realizan las evaluaciones?",
      respuesta: "Las evaluaciones se realizan trimestralmente para mantener un seguimiento constante del desarrollo profesional. El calendario específico se comunica con anticipación para permitir una adecuada preparación. En casos especiales, pueden programarse evaluaciones adicionales para proyectos específicos o períodos de prueba."
    },
    {
      pregunta: "¿Cuáles son los beneficios de este tipo de evaluación?",
      respuesta: "Los beneficios incluyen: 1) Retroalimentación más completa y objetiva, 2) Mayor conciencia de las fortalezas y áreas de mejora, 3) Mejor comprensión del impacto en diferentes niveles organizacionales, 4) Desarrollo de habilidades más efectivo y dirigido, y 5) Mejora en la comunicación y colaboración entre equipos."
    }
  ],
  proceso: [
    {
      pregunta: "¿Cómo funciona el proceso de evaluación?",
      respuesta: "El proceso se desarrolla en tres fases principales: 1) Selección de evaluadores y configuración de la evaluación, donde se identifican los participantes y se establecen los criterios, 2) Período de evaluación activa, durante el cual cada participante completa sus evaluaciones asignadas con reflexiones detalladas, y 3) Análisis y retroalimentación, que incluye la generación de informes detallados y sesiones de feedback constructivo."
    },
    {
      pregunta: "¿Cuánto tiempo tengo para completar una evaluación?",
      respuesta: "Se asigna un período de dos semanas para completar las evaluaciones asignadas. Recibirás recordatorios periódicos antes de la fecha límite. Es importante dedicar tiempo suficiente para proporcionar retroalimentación thoughtful y constructiva. Si necesitas más tiempo, puedes solicitar una extensión a través de tu supervisor."
    }
  ],
  confidencialidad: [
    {
      pregunta: "¿Las evaluaciones son anónimas?",
      respuesta: "Sí, todas las evaluaciones son completamente anónimas para fomentar la honestidad y transparencia. Los informes finales muestran solo promedios y tendencias agregadas, sin identificar a evaluadores específicos. Los comentarios cualitativos también se presentan de manera anónima para mantener la confidencialidad."
    },
    {
      pregunta: "¿Quién tiene acceso a los resultados?",
      respuesta: "El acceso a los resultados está estrictamente controlado: 1) El evaluado ve su informe completo pero anónimo, 2) El supervisor directo accede al informe para guiar el desarrollo profesional, 3) RR.HH. utiliza datos agregados para análisis y planificación, siempre manteniendo el anonimato individual. Todos los datos se manejan según las políticas de privacidad de la empresa."
    }
  ]
};

const Faq: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');

  const preguntasFiltradas = useMemo(() => {
    if (!busqueda) return preguntas;

    const busquedaLower = busqueda.toLowerCase();
    const resultado: CategoriaPreguntas = {};

    Object.entries(preguntas).forEach(([categoria, items]) => {
      const itemsFiltrados = items.filter(
        item =>
          item.pregunta.toLowerCase().includes(busquedaLower) ||
          item.respuesta.toLowerCase().includes(busquedaLower)
      );

      if (itemsFiltrados.length > 0) {
        resultado[categoria] = itemsFiltrados;
      }
    });

    return resultado;
  }, [busqueda]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-b from-primary-600 to-primary-700 text-white rounded-lg p-8 mb-8">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Centro de Ayuda
          </h2>
          <p className="text-primary-100 text-lg">
            Encuentra respuestas a las preguntas más frecuentes sobre el sistema de evaluación 360°.
            Estamos aquí para ayudarte a sacar el máximo provecho de tu experiencia.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <FaqBuscador busqueda={busqueda} setBusqueda={setBusqueda} />

        {Object.keys(preguntasFiltradas).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron resultados para tu búsqueda.</p>
            <p className="text-sm text-gray-400 mt-2">
              Intenta con otros términos o contacta a tu supervisor para ayuda específica.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {preguntasFiltradas.general && (
              <FaqCategoria titulo="Información General">
                {preguntasFiltradas.general.map((item, index) => (
                  <FaqItem key={index} {...item} />
                ))}
              </FaqCategoria>
            )}

            {preguntasFiltradas.proceso && (
              <FaqCategoria titulo="Proceso de Evaluación">
                {preguntasFiltradas.proceso.map((item, index) => (
                  <FaqItem key={index} {...item} />
                ))}
              </FaqCategoria>
            )}

            {preguntasFiltradas.confidencialidad && (
              <FaqCategoria titulo="Confidencialidad y Acceso">
                {preguntasFiltradas.confidencialidad.map((item, index) => (
                  <FaqItem key={index} {...item} />
                ))}
              </FaqCategoria>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Faq;