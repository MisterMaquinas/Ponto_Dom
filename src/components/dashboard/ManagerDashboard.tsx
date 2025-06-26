import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, FileText, UserPlus } from 'lucide-react';
import UserManagement from './UserManagement';
import Reports from './Reports';

interface ManagerDashboardProps {
  userData: any;
  onLogout: () => void;
}

const ManagerDashboard = ({ userData, onLogout }: ManagerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Minha Base', value: '28', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Presentes Hoje', value: '25', icon: Clock, color: 'from-green-500 to-green-600' },
    { title: 'Ausentes', value: '3', icon: UserPlus, color: 'from-red-500 to-red-600' },
  ];

  if (activeTab === 'users') {
    return <UserManagement onBack={() => setActiveTab('overview')} userType="manager" onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'reports') {
    return <Reports onBack={() => setActiveTab('overview')} userType="manager" onLogout={onLogout} userData={userData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Gerencial</h1>
              <p className="text-gray-600">Bem-vindo, {userData.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Gerente
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                Gerenciar Funcionários
              </Button>
              <Button
                onClick={() => setActiveTab('reports')}
                variant="outline"
                className="w-full justify-start h-12"
              >
                <FileText className="w-5 h-5 mr-3" />
                Relatórios da Base
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Minha Base de Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Carlos Silva', 'Ana Costa', 'Pedro Lima', 'Julia Santos'].map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{name}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Presente
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
