import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Edit, Search, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  contact: string;
  position: string;
  custom_position?: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_active: boolean;
  work_start_time?: string;
  work_end_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  reference_photo_url?: string;
}

interface EmployeeManagementProps {
  branchData: any;
  onBack: () => void;
}

const EmployeeManagement = ({ branchData, onBack }: EmployeeManagementProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const positions = [
    { value: 'gerente', label: 'Gerente' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'caixa', label: 'Caixa' },
    { value: 'seguranca', label: 'Segurança' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'outros', label: 'Outros' }
  ];

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.cpf.includes(searchTerm) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchData.id)
        .order('name');

      if (error) throw error;

      setEmployees(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: selectedEmployee.name,
          cpf: selectedEmployee.cpf,
          rg: selectedEmployee.rg,
          birth_date: selectedEmployee.birth_date,
          contact: selectedEmployee.contact,
          position: selectedEmployee.position,
          custom_position: selectedEmployee.custom_position,
          street: selectedEmployee.street,
          number: selectedEmployee.number,
          neighborhood: selectedEmployee.neighborhood,
          city: selectedEmployee.city,
          state: selectedEmployee.state,
          zip_code: selectedEmployee.zip_code,
          work_start_time: selectedEmployee.work_start_time || null,
          work_end_time: selectedEmployee.work_end_time || null,
          break_start_time: selectedEmployee.break_start_time || null,
          break_end_time: selectedEmployee.break_end_time || null,
          is_active: selectedEmployee.is_active
        })
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Funcionário atualizado com sucesso",
      });

      setEditDialogOpen(false);
      loadEmployees();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: !employee.is_active })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Funcionário ${employee.is_active ? 'desativado' : 'ativado'} com sucesso`,
      });

      loadEmployees();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do funcionário",
        variant: "destructive",
      });
    }
  };

  const updateSelectedEmployee = (field: string, value: any) => {
    if (selectedEmployee) {
      setSelectedEmployee({
        ...selectedEmployee,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando funcionários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Funcionários</h1>
          <p className="text-gray-600">{branchData.name}</p>
        </div>

        {/* Busca */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Funcionários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nome, CPF ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Lista de Funcionários */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Funcionários ({filteredEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {employees.length === 0 ? 'Nenhum funcionário cadastrado' : 'Nenhum funcionário encontrado'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center gap-4">
                      {employee.reference_photo_url && (
                        <img 
                          src={employee.reference_photo_url} 
                          alt={employee.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">
                          {employee.position === 'outros' ? employee.custom_position : 
                            positions.find(p => p.value === employee.position)?.label}
                        </p>
                        <p className="text-xs text-gray-500">CPF: {employee.cpf}</p>
                        {!employee.is_active && (
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={employee.is_active ? "destructive" : "default"}
                        onClick={() => handleDeactivate(employee)}
                      >
                        {employee.is_active ? (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Edição */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Funcionário</DialogTitle>
            </DialogHeader>
            
            {selectedEmployee && (
              <div className="space-y-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={selectedEmployee.name}
                        onChange={(e) => updateSelectedEmployee('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={selectedEmployee.cpf}
                        onChange={(e) => updateSelectedEmployee('cpf', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={selectedEmployee.rg}
                        onChange={(e) => updateSelectedEmployee('rg', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={selectedEmployee.birth_date}
                        onChange={(e) => updateSelectedEmployee('birth_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact">Contato</Label>
                      <Input
                        id="contact"
                        value={selectedEmployee.contact}
                        onChange={(e) => updateSelectedEmployee('contact', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={selectedEmployee.street}
                        onChange={(e) => updateSelectedEmployee('street', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={selectedEmployee.number}
                        onChange={(e) => updateSelectedEmployee('number', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={selectedEmployee.neighborhood}
                        onChange={(e) => updateSelectedEmployee('neighborhood', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={selectedEmployee.city}
                        onChange={(e) => updateSelectedEmployee('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={selectedEmployee.state}
                        onChange={(e) => updateSelectedEmployee('state', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input
                        id="zip_code"
                        value={selectedEmployee.zip_code}
                        onChange={(e) => updateSelectedEmployee('zip_code', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Cargo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cargo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position">Cargo</Label>
                      <Select 
                        value={selectedEmployee.position} 
                        onValueChange={(value) => updateSelectedEmployee('position', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedEmployee.position === 'outros' && (
                      <div>
                        <Label htmlFor="custom_position">Cargo Personalizado</Label>
                        <Input
                          id="custom_position"
                          value={selectedEmployee.custom_position || ''}
                          onChange={(e) => updateSelectedEmployee('custom_position', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Horários de Trabalho */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Horários de Trabalho</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="work_start_time">Horário de Entrada</Label>
                      <Input
                        id="work_start_time"
                        type="time"
                        value={selectedEmployee.work_start_time || ''}
                        onChange={(e) => updateSelectedEmployee('work_start_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="work_end_time">Horário de Saída</Label>
                      <Input
                        id="work_end_time"
                        type="time"
                        value={selectedEmployee.work_end_time || ''}
                        onChange={(e) => updateSelectedEmployee('work_end_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="break_start_time">Início do Intervalo</Label>
                      <Input
                        id="break_start_time"
                        type="time"
                        value={selectedEmployee.break_start_time || ''}
                        onChange={(e) => updateSelectedEmployee('break_start_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="break_end_time">Fim do Intervalo</Label>
                      <Input
                        id="break_end_time"
                        type="time"
                        value={selectedEmployee.break_end_time || ''}
                        onChange={(e) => updateSelectedEmployee('break_end_time', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditDialogOpen(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EmployeeManagement;