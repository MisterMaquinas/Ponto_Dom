
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Crown, Plus, Settings, BarChart3 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AdminManagement from './AdminManagement';
import MasterReports from './MasterReports';
import MasterSettings from './MasterSettings';

interface MasterDashboardProps {
  userData: any;
  onLogout: () => void;
}

interface CompanyStats {
  totalCompanies: number;
  totalAdmins: number;
  totalEmployees: number;
  activeCompanies: number;
}

interface Company {
  id: string;
  name: string;
  created_at: string;
  admin_name: string;
  admin_username: string;
  employee_count: number;
  status: 'Ativa' | 'Inativa';
}

const MasterDashboard = ({ userData, onLogout }: MasterDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<CompanyStats>({
    totalCompanies: 0,
    totalAdmins: 0,
    totalEmployees: 0,
    activeCompanies: 0
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar empresas com seus administradores
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          created_at,
          users!inner (
            id,
            name,
            username,
            role
          )
        `)
        .eq('users.role', 'admin');

      if (companiesError) {
        console.error('Erro ao carregar empresas:', companiesError);
        setCompanies([]);
        setStats({
          totalCompanies: 0,
          totalAdmins: 0,
          totalEmployees: 0,
          activeCompanies: 0
        });
        return;
      }

      // Carregar contagem total de funcionários por empresa
      const { data: employeeData, error: employeeError } = await supabase
        .from('users')
        .select('company_id, role')
        .neq('role', 'admin');

      if (employeeError) {
        console.error('Erro ao carregar funcionários:', employeeError);
      }

      // Processar dados das empresas
      const processedCompanies: Company[] = (companiesData || []).map(company => {
        const admin = company.users[0];
        const employeeCount = (employeeData || []).filter(emp => emp.company_id === company.id).length;
        
        return {
          id: company.id,
          name: company.name,
          created_at: company.created_at,
          admin_name: admin?.name || 'N/A',
          admin_username: admin?.username || 'N/A',
          employee_count: employeeCount,
          status: 'Ativa' as const
        };
      });

      setCompanies(processedCompanies);

      // Calcular estatísticas
      const totalEmployees = (employeeData || []).length;
      const newStats: CompanyStats = {
        totalCompanies: processedCompanies.length,
        totalAdmins: processedCompanies.length,
        totalEmployees: totalEmployees,
        activeCompanies: processedCompanies.length
      };

      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setCompanies([]);
      setStats({
        totalCompanies: 0,
        totalAdmins: 0,
        totalEmployees: 0,
        activeCompanies: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (activeTab === 'admins') {
    return <AdminManagement onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'reports') {
    return <MasterReports onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'settings') {
    return <MasterSettings onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  const statsData = [
    { title: 'Total de Empresas', value: stats.totalCompanies.toString(), icon: Building, color: 'from-purple-500 to-purple-600' },
    { title: 'Administradores', value: stats.totalAdmins.toString(), icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Funcionários Totais', value: stats.totalEmployees.toString(), icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Empresas Ativas', value: stats.activeCompanies.toString(), icon: Settings, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                Painel Master
              </h1>
              <p className="text-gray-600">Bem-vindo, {userData.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Building className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Sistema de Gerenciamento</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Crown className="w-3 h-3 mr-1" />
                Master
              </Badge>
              <Button onClick={onLogout} variant="outline">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Empresas Cadastradas ({companies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companies.length === 0 ? (
                      <div className="text-center py-12">
                        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2 text-lg">Nenhuma empresa cadastrada ainda</p>
                        <p className="text-sm text-gray-400 mb-4">Comece cadastrando sua primeira empresa</p>
                        <Button
                          onClick={() => setActiveTab('admins')}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Cadastrar Primeira Empresa
                        </Button>
                      </div>
                    ) : (
                      companies.map((company) => (
                        <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <Building className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{company.name}</p>
                              <p className="text-sm text-gray-600">Admin: {company.admin_name} (@{company.admin_username})</p>
                              <p className="text-xs text-gray-500">
                                {company.employee_count} funcionários • Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {company.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Ações Master</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setActiveTab('admins')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Cadastrar Nova Empresa
                  </Button>
                  <Button
                    onClick={() => setActiveTab('reports')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Relatórios Gerais
                  </Button>
                  <Button
                    onClick={() => setActiveTab('settings')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Configurações do Sistema
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MasterDashboard;
