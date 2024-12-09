import React, { useState } from 'react';
import { Select, SelectItem, Slider, Card, CardBody, Button } from '@nextui-org/react';

interface Virtud {
  nombre: string;
  descripcion: string;
}

const virtudes: Virtud[] = [
  {
    nombre: 'Comunicación',
    descripcion: 'Capacidad para transmitir ideas y escuchar activamente a otros.'
  },
  {
    nombre: 'Trabajo en Equipo',
    descripcion: 'Habilidad para colaborar y contribuir efectivamente en grupos.'
  },
  {
    nombre: 'Liderazgo',
    descripcion: 'Capacidad para guiar y motivar a otros hacia objetivos comunes.'
  },
  {
    nombre: 'Resolución de Problemas',
    descripcion: 'Habilidad para identificar y solucionar desafíos de manera efectiva.'
  },
  {
    nombre: 'Adaptabilidad',
    descripcion: 'Flexibilidad para ajustarse a cambios y nuevas situaciones.'
  },
  {
    nombre: 'Gestión del Tiempo',
    descripcion: 'Capacidad para organizar y priorizar tareas eficientemente.'
  },
  {
    nombre: 'Creatividad',
    descripcion: 'Habilidad para generar ideas innovadoras y soluciones originales.'
  },
  {
    nombre: 'Habilidades Técnicas',
    descripcion: 'Dominio de herramientas y conocimientos específicos del rol.'
  },
  {
    nombre: 'Iniciativa',
    descripcion: 'Capacidad para actuar proactivamente y tomar decisiones.'
  },
  {
    nombre: 'Profesionalismo',
    descripcion: 'Conducta ética y responsable en el entorno laboral.'
  }
];

const calificacionesDescriptivas = {
  1: 'Nunca',
  2: 'Casi Nunca',
  3: 'Neutro',
  4: 'Casi Siempre',
  5: 'Siempre'
};

const IniciarEvaluacion: React.FC = () => {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [calificaciones, setCalificaciones] = useState<{ [key: string]: number }>({});

  const manejarCambioCalificacion = (virtud: string, valor: number) => {
    setCalificaciones(prev => ({ ...prev, [virtud]: valor }));
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Calificaciones enviadas:', calificaciones);
    // Aquí iría la lógica de envío
  };

  return (
    <Card className="bg-background">
      <CardBody className="gap-6">
        <h3 className="text-xl font-semibold">Iniciar Nueva Evaluación</h3>
        
        <form onSubmit={manejarEnvio} className="space-y-8">
          <div>
            <Select
              label="Seleccionar Empleado"
              placeholder="Selecciona un empleado"
              value={empleadoSeleccionado}
              onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
              className="max-w-full"
            >
              <SelectItem key="1" value="1">Juan Pérez</SelectItem>
              <SelectItem key="2" value="2">María García</SelectItem>
              <SelectItem key="3" value="3">Carlos Rodríguez</SelectItem>
            </Select>
          </div>

          <div className="space-y-8">
            {virtudes.map((virtud) => (
              <div key={virtud.nombre} className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">{virtud.nombre}</h4>
                  <p className="text-sm text-foreground-500">{virtud.descripcion}</p>
                </div>

                <div className="space-y-2">
                  <Slider
                    label="Calificación"
                    step={1}
                    maxValue={5}
                    minValue={1}
                    value={calificaciones[virtud.nombre] || 1}
                    onChange={(value) => manejarCambioCalificacion(virtud.nombre, value as number)}
                    className="max-w-1/2"
                    showSteps={true}
                    marks={[
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                      { value: 4, label: "4" },
                      { value: 5, label: "5" }
                    ]}
                  />
                  {calificaciones[virtud.nombre] && (
                    <p className="text-sm text-primary font-medium">
                      {calificacionesDescriptivas[calificaciones[virtud.nombre] as keyof typeof calificacionesDescriptivas]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-divider">
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isDisabled={Object.keys(calificaciones).length === 0}
            >
              Enviar Evaluación
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default IniciarEvaluacion;