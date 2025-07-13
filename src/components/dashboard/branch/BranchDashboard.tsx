import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, UserPlus, BarChart3, LogOut } from 'lucide-react';
import EmployeePunchSystem from './EmployeePunchSystem';
import EmployeeRegistration from './EmployeeRegistration';
import Reports from '../Reports';

interface BranchDashboardProps {
  branchData: any;
  onLogout: () => void;
}

const BranchDashboard = ({ branchData, onLogout }: BranchDashboardProps) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'punch' | 'register' | 'reports'>('dashboard');

  if (currentView === 'punch') {
    return (
      <EmployeePunchSystem 
        branchData={branchData} 
        onLogout={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <EmployeeRegistration 
        branchData={branchData} 
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'reports') {
    return (
      <Reports 
        companyId={branchData.company_id} 
        onBack={() => setCurrentView('dashboard')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard da Filial</h1>
              <p className="text-gray-600">{branchData.name} - {branchData.companies?.name}</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card Sistema de Ponto */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentView('punch')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                <Clock className="w-6 h-6" />
                Sistema de Ponto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Registre a entrada e saída dos funcionários por biometria facial
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Acessar Sistema de Ponto
              </Button>
            </CardContent>
          </Card>

          {/* Card Cadastro de Funcionários */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentView('register')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 group-hover:text-green-700">
                <UserPlus className="w-6 h-6" />
                Cadastro de Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Registre novos funcionários com biometria facial
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Cadastrar Funcionário
              </Button>
            </CardContent>
          </Card>

          {/* Card Relatórios */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentView('reports')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600 group-hover:text-purple-700">
                <BarChart3 className="w-6 h-6" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Visualize relatórios de ponto e frequência
              </p>
              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                Acessar Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Filial */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Informações da Filial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="font-semibold block text-gray-700">Nome:</span>
                <span className="text-gray-600">{branchData.name}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-700">Empresa:</span>
                <span className="text-gray-600">{branchData.companies?.name}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-700">Código da Filial:</span>
                <span className="text-blue-600 font-mono text-lg font-bold bg-blue-50 px-2 py-1 rounded">
                  {branchData.id}
                </span>
              </div>
              <div>
                <span className="font-semibold block text-gray-700">Endereço:</span>
                <span className="text-gray-600">{branchData.address}, {branchData.city}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-700">Estado:</span>
                <span className="text-gray-600">{branchData.state}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-700">CEP:</span>
                <span className="text-gray-600">{branchData.zip_code}</span>
              </div>
              <div>
                <span className="font-semibold block text-gray-700">Contato:</span>
                <span className="text-gray-600">{branchData.contact}</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">📱 Código para Sistema de Ponto</h4>
              <p className="text-sm text-orange-700 mb-2">
                Compartilhe este código com os funcionários para acessarem o sistema de ponto:
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-orange-100 px-3 py-2 rounded font-mono text-lg font-bold text-orange-800">
                  {branchData.id}
                </code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(branchData.id)}
                  className="text-orange-600 border-orange-300 hover:bg-orange-100"
                >
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BranchDashboard;