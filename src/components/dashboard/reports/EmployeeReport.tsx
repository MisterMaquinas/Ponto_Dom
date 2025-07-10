import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Users, Clock, CheckCircle, Building } from 'lucide-react';

interface EmployeeReportProps {
  onBack: () => void;
}

const EmployeeReport = ({ onBack }: EmployeeReportProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [punchRecords, setPunchRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeReport;