import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, BarChart3, Building, Eye, Settings, Plus, UserPlus, Key } from 'lucide-react';
import BranchManagement from './company/BranchManagement';
import CompanyReports from './company/CompanyReports';
import CompanySettings from './company/CompanySettings';
import CompanyEmployeeRegistration from './company/CompanyEmployeeRegistration';
import CompanyAccessKeys from './company/CompanyAccessKeys';
import { useCompanyData } from './company/useCompanyData';

interface CompanyDashboardProps {
  userData: any;
  onLogout: () => void;
}

const CompanyDashboard = ({ userData, onLogout }: CompanyDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  console.log('CompanyDashboard - userData:', userData);
  console.log('CompanyDashboard - companyId:', userData.companyId);
  
  const { stats, branches, loading } = useCompanyData(userData.companyId);
  
  console.log('CompanyDashboard - loading:', loading);
  console.log('CompanyDashboard - stats:', stats);
  console.log('CompanyDashboard - branches:', branches);

  if (activeTab === 'branch-management') {
    return <BranchManagement onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'reports') {
    return <CompanyReports onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'settings') {
    return <CompanySettings onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'employee-registration') {
    return <CompanyEmployeeRegistration onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} branches={branches} />;
  }

  if (activeTab === 'access-keys') {
    return <CompanyAccessKeys onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  const mainStats = [
    { title: 'Total de Filiais', value: stats.totalBranches.toString(), icon: Building2, color: 'from-blue-500 to-blue-600' },
    { title: 'Total de Funcionários', value: stats.totalEmployees.toString(), icon: Users, color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600" />
                {userData.companyName} - Dashboard
              </h1>
              <p className="text-gray-600">Painel de controle da empresa</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Building className="w-3 h-3 mr-1" />
                Empresa
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {mainStats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg">
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
                    <Building2 className="w-5 h-5" />
                    Filiais da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {branches.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma filial cadastrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {branches.slice(0, 5).map((branch) => (
                        <div key={branch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <h4 className="font-medium text-gray-900">{branch.name}</h4>
                            <p className="text-sm text-gray-500">{branch.city}, {branch.state}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Ativa
                          </Badge>
                        </div>
                      ))}
                      {branches.length > 5 && (
                        <p className="text-sm text-gray-500 text-center pt-2">
                          +{branches.length - 5} filiais...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Ações Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setActiveTab('branch-management')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Building2 className="w-5 h-5 mr-3" />
                    Gerenciar Filiais
                  </Button>
                  <Button
                    onClick={() => setActiveTab('reports')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Relatórios da Empresa
                  </Button>
                  <Button
                    onClick={() => setActiveTab('employee-registration')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Cadastrar Funcionário
                  </Button>
                  <Button
                    onClick={() => setActiveTab('access-keys')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <Key className="w-5 h-5 mr-3" />
                    Chave de Acesso
                  </Button>
                  <Button
                    onClick={() => setActiveTab('settings')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Configurações
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

export default CompanyDashboard;