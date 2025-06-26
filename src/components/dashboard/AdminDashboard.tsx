
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, FileText, BarChart3, Clock, MapPin, Building } from 'lucide-react';
import UserManagement from './UserManagement';
import Reports from './Reports';

interface AdminDashboardProps {
  userData: any;
  onLogout: () => void;
}

const AdminDashboard = ({ userData, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Stats específicos da empresa do administrador
  const stats = [
    { title: 'Funcionários da Empresa', value: '45', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Presenças Hoje', value: '42', icon: Clock, color: 'from-green-500 to-green-600' },
    { title: 'Faltas Hoje', value: '3', icon: UserPlus, color: 'from-red-500 to-red-600' },
    { title: 'Bases da Empresa', value: '3', color: 'from-purple-500 to-purple-600', icon: MapPin },
  ];

  // Atividade recente filtrada por empresa
  const recentActivity = [
    { name: 'João Silva', action: 'Entrada', time: '08:15', status: 'success', company: userData.companyName },
    { name: 'Maria Santos', action: 'Saída', time: '17:45', status: 'success', company: userData.companyName },
    { name: 'Pedro Costa', action: 'Entrada', time: '08:30', status: 'warning', company: userData.companyName },
    { name: 'Ana Oliveira', action: 'Entrada', time: '08:00', status: 'success', company: userData.companyName },
  ];

  if (activeTab === 'users') {
    return <UserManagement onBack={() => setActiveTab('overview')} userType="admin" onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'reports') {
    return <Reports onBack={() => setActiveTab('overview')} userType="admin" onLogout={onLogout} userData={userData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Bem-vindo, {userData.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">{userData.companyName}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Administrador
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
                <Clock className="w-5 h-5" />
                Atividade Recente - {userData.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.name}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{activity.time}</p>
                      <Badge 
                        variant={activity.status === 'success' ? 'default' : 'secondary'}
                        className={activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {activity.status === 'success' ? 'No horário' : 'Atrasado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setActiveTab('users')}
                className="w-full justify-start h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <UserPlus className="w-5 h-5 mr-3" />
                Gerenciar Usuários da Empresa
              </Button>
              <Button
                onClick={() => setActiveTab('reports')}
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5 mr-3" />
                Relatórios da Empresa
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Análises da {userData.companyName}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
