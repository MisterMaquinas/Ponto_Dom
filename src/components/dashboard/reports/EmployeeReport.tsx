import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Users, Clock, CheckCircle, Building, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface EmployeeReportProps {
  onBack: () => void;
}

const EmployeeReport = ({ onBack }: EmployeeReportProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [punchRecords, setPunchRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesResult, punchRecordsResult] = await Promise.all([
        supabase
          .from('employees')
          .select(`
            *,
            branches(name, companies(name))
          `),
        supabase
          .from('employee_punch_records')
          .select('*')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // últimos 30 dias
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (punchRecordsResult.error) throw punchRecordsResult.error;

      setEmployees(employeesResult.data || []);
      setPunchRecords(punchRecordsResult.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeePunchCount = (employeeId: string) => {
    return punchRecords.filter(record => record.employee_id === employeeId).length;
  };

  const getLastPunch = (employeeId: string) => {
    const employeePunches = punchRecords
      .filter(record => record.employee_id === employeeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return employeePunches[0]?.timestamp || null;
  };

  const handleDeleteEmployee = async () => {
    if (!deleteEmployee) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', deleteEmployee.id);

      if (error) throw error;

      toast({
        title: "Funcionário excluído!",
        description: `${deleteEmployee.name} foi removido do sistema.`,
      });

      setDeleteEmployee(null);
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o funcionário",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (employee: any) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: !employee.is_active })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: employee.is_active ? "Funcionário desativado!" : "Funcionário ativado!",
        description: `${employee.name} foi ${employee.is_active ? 'desativado' : 'ativado'} no sistema.`,
      });

      fetchData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do funcionário",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Voltar aos Relatórios
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatório de Funcionários</h1>
          <p className="text-gray-600">Dados consolidados de todos os funcionários</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Funcionários</p>
                  <p className="text-2xl font-bold text-green-600">{employees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Funcionários Ativos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {employees.filter(emp => emp.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Registros (30 dias)</p>
                  <p className="text-2xl font-bold text-purple-600">{punchRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Com Biometria</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {employees.filter(emp => emp.face_encoding).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Filial</TableHead>
                    <TableHead>Pontos (30d)</TableHead>
                    <TableHead>Último Ponto</TableHead>
                    <TableHead>Biometria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const punchCount = getEmployeePunchCount(employee.id);
                    const lastPunch = getLastPunch(employee.id);
                    
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.custom_position || employee.position}</TableCell>
                        <TableCell>
                          {employee.branches?.name}
                          <br />
                          <span className="text-xs text-gray-500">
                            {employee.branches?.companies?.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {punchCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          {lastPunch ? (
                            <div>
                              <div>{new Date(lastPunch).toLocaleDateString('pt-BR')}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(lastPunch).toLocaleTimeString('pt-BR')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            employee.face_encoding 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.face_encoding ? 'Configurada' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            employee.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {employee.reference_photo_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPhoto(employee.reference_photo_url)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEmployee(employee)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(employee)}
                              className={employee.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                            >
                              {employee.is_active ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteEmployee(employee)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para visualizar foto */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Foto do Funcionário</DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <div className="space-y-4">
                <img 
                  src={selectedPhoto} 
                  alt="Foto do funcionário" 
                  className="w-full rounded-lg border"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para editar funcionário */}
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Funcionário</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Funcionalidade de edição será implementada em breve.
                </p>
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {selectedEmployee.name}</p>
                  <p><strong>Cargo:</strong> {selectedEmployee.position}</p>
                  <p><strong>CPF:</strong> {selectedEmployee.cpf}</p>
                  <p><strong>Contato:</strong> {selectedEmployee.contact}</p>
                  <p><strong>Status:</strong> {selectedEmployee.is_active ? 'Ativo' : 'Inativo'}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AlertDialog para confirmar exclusão */}
        <AlertDialog open={!!deleteEmployee} onOpenChange={() => setDeleteEmployee(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o funcionário <strong>{deleteEmployee?.name}</strong>?
                Esta ação não pode ser desfeita e removerá todos os registros relacionados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteEmployee(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteEmployee}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EmployeeReport;