
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, UserPlus, FileText, Building } from 'lucide-react';
import UserManagement from './UserManagement';
import Reports from './Reports';

interface SupervisorDashboardProps {
  userData: any;
  onLogout: () => void;
}

const SupervisorDashboard = ({ userData, onLogout }: SupervisorDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Stats específicos da empresa do supervisor
  const stats = [
    { title: 'Funcionários', value: '12', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Presentes', value: '10', icon: Clock, color: 'from-green-500 to-green-600' },
    { title: 'Ausentes', value: '2', icon: UserPlus, color: 'from-red-500 to-red-600' },
  ];

  if (activeTab === 'users') {
    return <UserManagement onBack={() => setActiveTab('overview')} userType="supervisor" onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'reports') {
    return <Reports onBack={() => setActiveTab('overview')} userType="supervisor" onLogout={onLogout} userData={userData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel de Supervisão</h1>
              <p className="text-gray-600">Bem-vindo, {userData.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Building className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium">{userData.companyName}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Supervisor
              </Badge>
              <Button onClick={onLogout} variant="outline">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Ações Disponíveis - {userData.companyName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setActiveTab('users')}
              className="w-full justify-start h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Cadastrar Funcionário
            </Button>
            <Button
              onClick={() => setActiveTab('reports')}
              variant="outline"
              className="w-full justify-start h-12"
            >
              <FileText className="w-5 h-5 mr-3" />
              Relatórios dos Funcionários
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
