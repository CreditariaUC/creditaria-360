import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RadioGroup, 
  Radio, 
  Input, 
  CheckboxGroup, 
  Checkbox,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Selection,
  SortDescriptor,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem
} from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { evaluationService } from '../services/evaluation.service';
import type { EvaluationType } from '../types/evaluation.types';

interface Criterio {
  id: string;
  name: string;
  description: string;
}

interface Usuario {
  id: string;
  full_name: string;
  email: string;
  department: string;
  parent_id: string | null;
}

const CrearNuevaEvaluacion: React.FC = () => {
  const navigate = useNavigate();
  const [tipoEvaluacion, setTipoEvaluacion] = useState<EvaluationType | ''>('simple');
  const [nombreEvaluacion, setNombreEvaluacion] = useState<string>('');
  const [fechaLimite, setFechaLimite] = useState<string>('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>('');
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [criteriosSeleccionados, setCriteriosSeleccionados] = useState<Selection>(new Set([]));
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<Selection>(new Set([]));
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [participantesObligatorios, setParticipantesObligatorios] = useState<Set<string>>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'full_name',
    direction: 'ascending'
  });
  const [filterValue, setFilterValue] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const filteredUsers = useMemo(() => {
    return usuarios.filter(user => {
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.department?.toLowerCase().includes(filterValue.toLowerCase());

      const matchesDepartment = 
        departamentoSeleccionado === 'all' || 
        user.department === departamentoSeleccionado;

      return matchesSearch && matchesDepartment;
    }).sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [usuarios, filterValue, departamentoSeleccionado]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Usuario];
      const second = b[sortDescriptor.column as keyof Usuario];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [filteredUsers, sortDescriptor]);

  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const items = sortedUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const departamentos = useMemo(() => {
    const deps = new Set(usuarios.map(user => user.department).filter(Boolean));
    return Array.from(deps).sort();
  }, [usuarios]);

  const empleadoActual = useMemo(() => {
    return usuarios.find(user => user.id === empleadoSeleccionado);
  }, [empleadoSeleccionado, usuarios]);

  useEffect(() => {
    cargarCriterios();
    cargarUsuarios();
  }, []);

  // Función recursiva para obtener todos los subordinados
  const obtenerTodosLosSubordinados = (userId: string, users: Usuario[]): string[] => {
    const subordinadosDirectos = users.filter(user => user.parent_id === userId);
    let todosLosSubordinados: string[] = subordinadosDirectos.map(user => user.id);
    
    for (const subordinado of subordinadosDirectos) {
      const subordinadosRecursivos = obtenerTodosLosSubordinados(subordinado.id, users);
      todosLosSubordinados = [...todosLosSubordinados, ...subordinadosRecursivos];
    }
    
    return todosLosSubordinados;
  };

  // Función para obtener subordinados directos
  const obtenerSubordinadosDirectos = (userId: string, users: Usuario[]): string[] => {
    return users
      .filter(user => user.parent_id === userId)
      .map(user => user.id);
  };

  useEffect(() => {
    if (empleadoSeleccionado && tipoEvaluacion) {
      let participantesIds: string[] = [empleadoSeleccionado]; // Siempre incluir al empleado evaluado
      let obligatorios = new Set([empleadoSeleccionado]);

      if (tipoEvaluacion === '360') {
        // Para evaluación 360, incluir todos los subordinados
        const todosLosSubordinados = obtenerTodosLosSubordinados(empleadoSeleccionado, usuarios);
        participantesIds = [...participantesIds, ...todosLosSubordinados];
        todosLosSubordinados.forEach(id => obligatorios.add(id));
      } else if (tipoEvaluacion === 'simple') {
        // Para evaluación simple, solo incluir subordinados directos
        const subordinadosDirectos = obtenerSubordinadosDirectos(empleadoSeleccionado, usuarios);
        participantesIds = [...participantesIds, ...subordinadosDirectos];
        subordinadosDirectos.forEach(id => obligatorios.add(id));
      }

      // Actualizar selección
      setUsuariosSeleccionados(new Set(participantesIds));
      setParticipantesObligatorios(obligatorios);
    }
  }, [empleadoSeleccionado, tipoEvaluacion, usuarios]);

  const handleSelectionChange = (selection: Selection) => {
    // Ensure the evaluated employee is always included in the selection
    if (empleadoSeleccionado) {
      const newSelection = new Set(selection);
      newSelection.add(empleadoSeleccionado);
      setUsuariosSeleccionados(newSelection);
      setSelectedCount(newSelection.size);
    } else {
      setUsuariosSeleccionados(selection);
      setSelectedCount(selection.size);
    }
  };

  // Update selected count when employee is selected
  useEffect(() => {
    if (empleadoSeleccionado && usuariosSeleccionados.size > 0) {
      setSelectedCount(usuariosSeleccionados.size);
    }
  }, [empleadoSeleccionado, usuariosSeleccionados]);

  // Efecto separado para manejar el cambio inicial de departamento
  useEffect(() => {
    if (empleadoSeleccionado) {
      const empleado = usuarios.find(u => u.id === empleadoSeleccionado);
      if (empleado?.department) {
        setDepartamentoSeleccionado(empleado.department);
      }
    }
  }, [empleadoSeleccionado, usuarios]);

  const cargarCriterios = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluation_criteria')
        .select('id, name, description');
      
      if (error) throw error;
      setCriterios(data || []);
    } catch (error) {
      console.error('Error al cargar criterios:', error);
      toast.error('Error al cargar los criterios de evaluación');
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department, parent_id')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar la lista de usuarios');
    }
  };

  const handleSelectAllCriteria = () => {
    if (criteriosSeleccionados.size === criterios.length) {
      setCriteriosSeleccionados(new Set([]));
    } else {
      setCriteriosSeleccionados(new Set(criterios.map(c => c.id)));
    }
  };


  const handleGuardar = async () => {
    try {
      if (!tipoEvaluacion || !nombreEvaluacion || !fechaLimite || 
          !criteriosSeleccionados.size || !usuariosSeleccionados.size || !empleadoSeleccionado) {
        toast.error('Por favor complete todos los campos requeridos');
        return;
      }

      // Convertir los IDs de usuarios seleccionados a objetos con estado
      const participantsWithStatus = Array.from(usuariosSeleccionados).map(id => ({
        id: id.toString(),
        status: 'pendiente',
        evaluated: tipoEvaluacion === '360' ? 'pendiente' : undefined
      }));

      const evaluationData = {
        evaluation_type: tipoEvaluacion,
        title: nombreEvaluacion,
        end_date: fechaLimite,
        evaluated_id: empleadoSeleccionado,
        evaluation_criteria: Array.from(criteriosSeleccionados) as string[],
        participants: participantsWithStatus
      };

      await evaluationService.createEvaluation(evaluationData);
      toast.success('Evaluación creada exitosamente');
      navigate('/evaluaciones');
    } catch (error) {
      console.error('Error al guardar la evaluación:', error);
      toast.error('Error al crear la evaluación');
    }
  };

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

      <div className={`flex items-center gap-4 ${isScrolled ? 'invisible' : ''}`}>
        <Button
          variant="light"
          startContent={<ArrowLeft size={20} />}
          onPress={() => navigate('/evaluaciones')}
        >
          Regresar
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Crear Nueva Evaluación</h2>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleGuardar();
        }} className="space-y-6">
          <RadioGroup
            label="Tipo de Evaluación"
            value={tipoEvaluacion}
            orientation="horizontal"
            isRequired
            onValueChange={setTipoEvaluacion as (value: string) => void}
          >
            {/*<Radio value="360" description="Evaluación entre pares y supervisor directo">
              Evaluación 360°
            </Radio>*/}
            <Radio value="simple" description="Evaluación individual o específica">
              Evaluación Simple
            </Radio>
          </RadioGroup>

          <Input
            isRequired
            isInvalid={nombreEvaluacion.length > 0 && nombreEvaluacion.length < 3}
            errorMessage={nombreEvaluacion.length > 0 && nombreEvaluacion.length < 3 && "El nombre debe tener al menos 3 caracteres"}
            label="Nombre de la Evaluación"
            placeholder="Ingrese el nombre de la evaluación"
            value={nombreEvaluacion}
            onChange={(e) => setNombreEvaluacion(e.target.value)}
          />

          <Input
            type="date"
            isRequired
            label="Fecha Límite"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />

          <Autocomplete
            isRequired
            isInvalid={!empleadoSeleccionado}
            errorMessage={!empleadoSeleccionado && "Debe seleccionar un empleado"}
            label="Empleado a Evaluar"
            placeholder="Seleccione un empleado"
            selectedKey={empleadoSeleccionado}
            onSelectionChange={(key) => setEmpleadoSeleccionado(key as string)}
            className="max-w-full"
          >
            {usuarios.map((usuario) => (
              <AutocompleteItem key={usuario.id} value={usuario.id} textValue={usuario.full_name}>
                {usuario.full_name} - {usuario.department}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          <div>
            <div className="flex justify-between items-center mb-4 gap-4">
              <div className="flex gap-4 flex-1">
                
                <Select
                  classNames={{
                    base: "max-w-xs",
                  }}
                  label="Departamento"
                  placeholder="Filtrar por departamento"
                  selectedKeys={[departamentoSeleccionado]}
                  onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
                
                >
                  
                  <SelectItem key="all" value="all">
                    Todos los departamentos
                  </SelectItem>
                  {departamentos.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  placeholder="Buscar usuarios..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="max-w-xs"
                  label="Filtrar"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-small text-default-500">
                  {selectedCount} seleccionados
                </span>
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat">
                    Filas por página: {rowsPerPage === filteredUsers.length ? 'Todos' : rowsPerPage}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filas por página"
                  onAction={(key) => {
                    const newValue = key === String(filteredUsers.length) ? filteredUsers.length : Number(key);
                    setRowsPerPage(newValue);
                  }}
                >
                  {[10, 20, 50, 'Todos'].map((amount) => (
                    <DropdownItem key={amount === 'Todos' ? filteredUsers.length : amount}>
                      {amount}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            <Table
              aria-label="Tabla de usuarios"
              selectionMode="multiple"
              selectedKeys={usuariosSeleccionados}
              onSelectionChange={handleSelectionChange}
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
               {...empleadoSeleccionado ? { disabledKeys: [empleadoSeleccionado] } : {}}>
              <TableHeader>
                <TableColumn key="full_name" allowsSorting>Nombre</TableColumn>
                <TableColumn key="email" allowsSorting>Correo</TableColumn>
                <TableColumn key="department" allowsSorting>Departamento</TableColumn>
              </TableHeader>
              <TableBody items={items}>
                {(item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.full_name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.department}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex justify-center mt-4">
              <Pagination
                total={pages}
                page={page}
                onChange={setPage}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Criterios a Evaluar</h3>
              <Button
                size="sm"
                variant="flat"
                onPress={handleSelectAllCriteria}
              >
                {criteriosSeleccionados.size === criterios.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </Button>
            </div>
            <CheckboxGroup
              value={Array.from(criteriosSeleccionados)}
              onChange={(value) => setCriteriosSeleccionados(new Set(value))}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criterios.map((criterio) => (
                  <div key={criterio.id} className="p-4 border rounded-lg bg-default-50">
                    <Checkbox value={criterio.id} className="mb-2">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{criterio.name}</p>
                        <p className="text-sm text-gray-500">{criterio.description}</p>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </CheckboxGroup>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              color="danger"
              type="button"
              variant="ghost"
              onClick={() => navigate('/evaluaciones')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="ghost"
              isDisabled={!tipoEvaluacion || !nombreEvaluacion || !fechaLimite || 
                !criteriosSeleccionados.size || !usuariosSeleccionados.size || !empleadoSeleccionado}
            >
              Guardar Evaluación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearNuevaEvaluacion;