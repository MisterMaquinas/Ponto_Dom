import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Search, MapPin, Calendar, Badge as BadgeIcon, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeReportProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface Employee {
  id: string;
  name: string;
  cpf: string;
  contact: string;
  position: string;
  custom_position: string | null;
  birth_date: string;
  is_active: boolean;
  created_at: string;
  branch: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

const EmployeeReport = ({ onBack, onLogout, userData }: EmployeeReportProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byBranch: {} as Record<string, number>
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [userData.companyId]);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, selectedBranch, selectedStatus, employees]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar filiais
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name, address, phone')
        .eq('company_id', userData.companyId)
        .order('name');

      if (branchesError) throw branchesError;
      setBranches(branchesData || []);

      // Carregar funcionários
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          branch:branches!employees_branch_id_fkey(
            id,
            name,
            address,
            phone
          )
        `)
        .eq('branch.company_id', userData.companyId)
        .order('name');

      if (employeesError) throw employeesError;

      setEmployees(employeesData || []);

      // Calcular estatísticas
      const total = employeesData?.length || 0;
      const active = employeesData?.filter(e => e.is_active).length || 0;
      const inactive = total - active;
      
      const byBranch: Record<string, number> = {};
      employeesData?.forEach(employee => {
        const branchName = employee.branch?.name || 'Sem filial';
        byBranch[branchName] = (byBranch[branchName] || 0) + 1;
      });

      setStats({ total, active, inactive, byBranch });

    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos funcionários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.cpf.includes(searchTerm) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.custom_position && employee.custom_position.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por filial
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(employee => employee.branch?.id === selectedBranch);
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(employee => employee.is_active === isActive);
    }

    setFilteredEmployees(filtered);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatório de Funcionários</h1>
                <p className="text-gray-600">Dados consolidados de todos os funcionários da empresa</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Funcionários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BadgeIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funcionários Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BadgeIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funcionários Inativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, CPF ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as filiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as filiais</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Apenas ativos</SelectItem>
                  <SelectItem value="inactive">Apenas inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Funcionários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredEmployees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || selectedBranch !== 'all' || selectedStatus !== 'all' 
                  ? 'Nenhum funcionário encontrado com os filtros aplicados' 
                  : 'Nenhum funcionário cadastrado'
                }
              </p>
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <Card key={employee.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {employee.name}
                    </CardTitle>
                    <Badge variant={employee.is_active ? "default" : "secondary"}>
                      {employee.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BadgeIcon className="w-4 h-4" />
                    <span>CPF: {formatCPF(employee.cpf)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{employee.custom_position || employee.position}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{employee.branch?.name} - {employee.branch?.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{employee.contact}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Nascimento: {format(new Date(employee.birth_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Cadastrado em {format(new Date(employee.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;