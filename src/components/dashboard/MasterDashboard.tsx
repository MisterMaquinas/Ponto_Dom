
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Crown, Plus, Settings, BarChart3 } from 'lucide-react';
import AdminManagement from './AdminManagement';

interface MasterDashboardProps {
  userData: any;
  onLogout: () => void;
}

const MasterDashboard = ({ userData, onLogout }: MasterDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Stats do sistema master
  const stats = [
    { title: 'Total de Empresas', value: '5', icon: Building, color: 'from-purple-500 to-purple-600' },
    { title: 'Administradores', value: '5', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Funcionários Totais', value: '150', icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Empresas Ativas', value: '5', icon: Settings, color: 'from-orange-500 to-orange-600' },
  ];

  // Lista de empresas/clientes
  const companies = [
    { id: 'company_1', name: 'Empresa Alpha', admin: 'Adm1', status: 'Ativa', employees: 45 },
    { id: 'company_2', name: 'Empresa Beta', admin: 'Adm2', status: 'Ativa', employees: 32 },
    { id: 'company_raiox', name: 'RaioX', admin: 'RaioXadm', status: 'Ativa', employees: 28 },
    { id: 'company_3', name: 'TechCorp', admin: 'TechAdm', status: 'Inativa', employees: 25 },
    { id: 'company_4', name: 'MediCenter', admin: 'MediAdm', status: 'Ativa', employees: 20 },
  ];

  if (activeTab === 'admins') {
    return <AdminManagement onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                Empresas Cadastradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-600">Admin: {company.admin}</p>
                      <p className="text-xs text-gray-500">{company.employees} funcionários</p>
                    </div>
                    <Badge 
                      variant={company.status === 'Ativa' ? 'default' : 'secondary'}
                      className={company.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {company.status}
                    </Badge>
                  </div>
                ))}
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
                Gerenciar Administradores
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Relatórios Gerais
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 mr-3" />
                Configurações do Sistema
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
