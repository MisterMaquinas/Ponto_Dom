import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building2, Search, MapPin, Users, Calendar, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BranchReportProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  is_active: boolean;
  created_at: string;
  employee_count: number;
}

const BranchReport = ({ onBack, onLogout, userData }: BranchReportProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalEmployees: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBranches();
  }, [userData.companyId]);

  useEffect(() => {
    filterBranches();
  }, [searchTerm, branches]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          employees!employees_branch_id_fkey(id)
        `)
        .eq('company_id', userData.companyId)
        .order('name');

      if (error) throw error;

      const branchesWithCount = data?.map(branch => ({
        ...branch,
        employee_count: branch.employees?.length || 0
      })) || [];

      setBranches(branchesWithCount);

      // Calcular estatísticas
      const total = branchesWithCount.length;
      const active = branchesWithCount.filter(b => b.is_active).length;
      const inactive = total - active;
      const totalEmployees = branchesWithCount.reduce((sum, branch) => sum + branch.employee_count, 0);

      setStats({ total, active, inactive, totalEmployees });

    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das filiais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBranches = () => {
    if (!searchTerm) {
      setFilteredBranches(branches);
      return;
    }

    const filtered = branches.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredBranches(filtered);
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
                <h1 className="text-2xl font-bold text-gray-900">Relatório de Filiais</h1>
                <p className="text-gray-600">Informações detalhadas sobre todas as filiais</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Filiais</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filiais Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filiais Inativas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Funcionários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, cidade ou estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Filiais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
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
          ) : filteredBranches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhuma filial encontrada para o termo buscado' : 'Nenhuma filial cadastrada'}
              </p>
            </div>
          ) : (
            filteredBranches.map((branch) => (
              <Card key={branch.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {branch.name}
                    </CardTitle>
                    <Badge variant={branch.is_active ? "default" : "secondary"}>
                      {branch.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{branch.address}, {branch.city} - {branch.state}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{branch.employee_count} funcionário{branch.employee_count !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Criada em {format(new Date(branch.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Contato:</strong> {branch.contact}
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

export default BranchReport;