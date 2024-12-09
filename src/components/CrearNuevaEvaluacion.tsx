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
  const [tipoEvaluacion, setTipoEvaluacion] = useState<EvaluationType | ''>('');
  const [nombreEvaluacion, setNombreEvaluacion] = useState<string>('');
  const [fechaLimite, setFechaLimite] = useState<string>('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>('');
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [criteriosSeleccionados, setCriteriosSeleccionados] = useState<Selection>(new Set([]));
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<Selection>(new Set([]));
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'full_name',
    direction: 'ascending'
  });
  const [filterValue, setFilterValue] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string>('all');

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

  useEffect(() => {
    if (empleadoSeleccionado) {
      const empleado = usuarios.find(user => user.id === empleadoSeleccionado);
      if (empleado) {
        setDepartamentoSeleccionado(empleado.department || 'all');
        
        const subordinados = usuarios.filter(user => 
          user.parent_id === empleadoSeleccionado && 
          user.department === empleado.department
        );
        const subordinadosIds = new Set(subordinados.map(sub => sub.id));
        setUsuariosSeleccionados(subordinadosIds);
        setRowsPerPage(filteredUsers.length);
        setPage(1);
      }
    } else {
      setUsuariosSeleccionados(new Set([]));
      setDepartamentoSeleccionado('all');
      setRowsPerPage(5);
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
        .select('id, full_name, email, department, parent_id');
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar la lista de usuarios');
    }
  };

  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(filterValue.toLowerCase()) ||
      user.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
      user.department?.toLowerCase().includes(filterValue.toLowerCase());

    const matchesDepartment = 
      departamentoSeleccionado === 'all' || 
      user.department === departamentoSeleccionado;

    return matchesSearch && matchesDepartment;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof Usuario];
    const second = b[sortDescriptor.column as keyof Usuario];
    const cmp = first < second ? -1 : first > second ? 1 : 0;
    
    return sortDescriptor.direction === 'descending' ? -cmp : cmp;
  });

  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const items = sortedUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleGuardar = async () => {
    try {
      if (!tipoEvaluacion || !nombreEvaluacion || !fechaLimite || 
          !criteriosSeleccionados.size || !usuariosSeleccionados.size || !empleadoSeleccionado) {
        toast.error('Por favor complete todos los campos requeridos');
        return;
      }

      const evaluationData = {
        evaluation_type: tipoEvaluacion,
        title: nombreEvaluacion,
        end_date: fechaLimite,
        evaluated_id: empleadoSeleccionado,
        evaluation_criteria: Array.from(criteriosSeleccionados) as string[],
        participants: Array.from(usuariosSeleccionados) as string[]
      };

      await evaluationService.createEvaluation(evaluationData);
      toast.success('Evaluación creada exitosamente');
      navigate('/mis-evaluaciones');
    } catch (error) {
      console.error('Error al guardar la evaluación:', error);
      toast.error('Error al crear la evaluación');
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold">Crear Nueva Evaluación</h2>

      <div className="space-y-4">
        <RadioGroup
          label="Tipo de Evaluación"
          value={tipoEvaluacion}
          onValueChange={setTipoEvaluacion as (value: string) => void}
        >
          <Radio value="180" description="Evaluación entre pares y supervisor directo">
            Evaluación 180°
          </Radio>
          <Radio value="simple" description="Evaluación individual o específica">
            Evaluación Simple
          </Radio>
        </RadioGroup>

        <Input
          label="Nombre de la Evaluación"
          placeholder="Ingrese el nombre de la evaluación"
          value={nombreEvaluacion}
          onChange={(e) => setNombreEvaluacion(e.target.value)}
        />

        <Input
          type="date"
          label="Fecha Límite"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
        />

        <Autocomplete
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
          <CheckboxGroup
            label="Criterios a Evaluar"
            value={Array.from(criteriosSeleccionados)}
            onChange={(value) => setCriteriosSeleccionados(new Set(value))}
          >
            {criterios.map((criterio) => (
              <Checkbox key={criterio.id} value={criterio.id}>
                {criterio.name}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="flex gap-4 flex-1">
              <Input
                placeholder="Buscar usuarios..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-72"
              />
              <Select
                label="Departamento"
                placeholder="Filtrar por departamento"
                selectedKeys={[departamentoSeleccionado]}
                onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
                className="w-72"
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
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat">
                  Filas por página: {rowsPerPage}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filas por página"
                onAction={(key) => setRowsPerPage(Number(key))}
              >
                {[5, 10, 20, 'todos'].map((amount) => (
                  <DropdownItem key={amount === 'todos' ? filteredUsers.length : amount}>
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
            onSelectionChange={setUsuariosSeleccionados}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
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

        <div className="flex justify-end gap-4 mt-6">
          <Button
            color="danger"
            variant="light"
            onClick={() => navigate('/mis-evaluaciones')}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={handleGuardar}
          >
            Guardar Evaluación
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrearNuevaEvaluacion;