import React, { useState } from 'react';
import { Mail, Users, Calendar, Send, AlertCircle } from 'lucide-react';

interface Destinatario {
  id: string;
  nombre: string;
  email: string;
  departamento: string;
}

const EnviarCampana: React.FC = () => {
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState('');
  const [destinatarios, setDestinatarios] = useState<string[]>([]);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const empleados: Destinatario[] = [
    { id: '1', nombre: 'Ana García', email: 'ana.garcia@empresa.com', departamento: 'Desarrollo' },
    { id: '2', nombre: 'Carlos Rodríguez', email: 'carlos.rodriguez@empresa.com', departamento: 'Diseño' },
    { id: '3', nombre: 'María López', email: 'maria.lopez@empresa.com', departamento: 'Marketing' },
    { id: '4', nombre: 'Juan Pérez', email: 'juan.perez@empresa.com', departamento: 'Desarrollo' },
    { id: '5', nombre: 'Laura Torres', email: 'laura.torres@empresa.com', departamento: 'Recursos Humanos' }
  ];

  const tiposCampana = [
    { id: 'autoevaluacion', nombre: 'Autoevaluación', descripcion: 'El empleado se evalúa a sí mismo' },
    { id: 'evaluacion-pares', nombre: 'Evaluación de Pares', descripcion: 'Evaluación entre compañeros del mismo nivel' },
    { id: 'evaluacion-superior', nombre: 'Evaluación Superior', descripcion: 'Evaluación del jefe directo' },
    { id: 'evaluacion-subordinado', nombre: 'Evaluación de Subordinados', descripcion: 'Evaluación de los empleados a cargo' }
  ];

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      tipo,
      destinatarios,
      asunto,
      mensaje,
      fechaInicio,
      fechaFin
    });
    // Aquí iría la lógica de envío
  };

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Seleccionar Tipo de Campaña</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tiposCampana.map((tipoCampana) => (
                <button
                  key={tipoCampana.id}
                  onClick={() => {
                    setTipo(tipoCampana.id);
                    setPaso(2);
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    tipo === tipoCampana.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <h5 className="font-medium text-gray-900">{tipoCampana.nombre}</h5>
                  <p className="text-sm text-gray-500 mt-1">{tipoCampana.descripcion}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Seleccionar Destinatarios</h4>
            <div className="border rounded-lg divide-y">
              {empleados.map((empleado) => (
                <div key={empleado.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{empleado.nombre}</p>
                    <p className="text-sm text-gray-500">{empleado.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                      {empleado.departamento}
                    </span>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={destinatarios.includes(empleado.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDestinatarios([...destinatarios, empleado.id]);
                        } else {
                          setDestinatarios(destinatarios.filter(id => id !== empleado.id));
                        }
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setPaso(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Atrás
              </button>
              <button
                onClick={() => setPaso(3)}
                disabled={destinatarios.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Configurar Campaña</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-700">
                  Asunto del Correo
                </label>
                <input
                  type="text"
                  id="asunto"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ej: Evaluación 360° - Primer Trimestre 2024"
                />
              </div>
              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  rows={4}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Escribe el mensaje para los participantes..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    id="fechaFin"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setPaso(2)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Atrás
              </button>
              <button
                onClick={manejarEnvio}
                disabled={!asunto || !mensaje || !fechaInicio || !fechaFin}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Campaña
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800">Nueva Campaña de Evaluación</h3>
        <div className="mt-4">
          <div className="flex items-center justify-between relative">
            {[1, 2, 3].map((numeroPaso) => (
              <div
                key={numeroPaso}
                className={`flex items-center ${numeroPaso < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    paso >= numeroPaso
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {numeroPaso === 1 && <Mail size={16} />}
                  {numeroPaso === 2 && <Users size={16} />}
                  {numeroPaso === 3 && <Calendar size={16} />}
                </div>
                {numeroPaso < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      paso > numeroPaso ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-medium">Tipo</span>
            <span className="text-xs font-medium">Destinatarios</span>
            <span className="text-xs font-medium">Configuración</span>
          </div>
        </div>
      </div>
      {renderPaso()}
    </div>
  );
};

export default EnviarCampana;