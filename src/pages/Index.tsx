
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Building2, Crown } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import SupervisorDashboard from '@/components/dashboard/SupervisorDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';
import MasterDashboard from '@/components/dashboard/MasterDashboard';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';
import BranchLogin from '@/components/dashboard/branch/BranchLogin';
import BranchDashboard from '@/components/dashboard/branch/BranchDashboard';
import EmployeePunchSystem from '@/components/dashboard/branch/EmployeePunchSystem';
import EmployeePunchCodeLogin from '@/components/dashboard/branch/EmployeePunchCodeLogin';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'home' | 'master' | 'company' | 'branch' | 'branch-dashboard' | 'employee-punch' | 'employee-punch-code'>('home');
  const [branchData, setBranchData] = useState<any>(null);

  const handleLogin = (userType: string, userData: any) => {
    setCurrentUser({ type: userType, ...userData });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleBranchLoginSuccess = (branch: any) => {
    setBranchData(branch);
    setCurrentView('branch-dashboard');
  };

  const handleEmployeePunchLoginSuccess = (branch: any) => {
    setBranchData(branch);
    setCurrentView('employee-punch');
  };

  // Sistema de hierarquia Master -> Empresa -> Filial
  if (currentUser) {
    switch (currentUser.type) {
      case 'master':
        return <MasterDashboard userData={currentUser} onLogout={handleLogout} />;
      case 'admin':
      case 'manager':
      case 'supervisor':  
      case 'user':
        // Todos os tipos de usuário da empresa vão para o dashboard da empresa
        return <CompanyDashboard userData={currentUser} onLogout={handleLogout} />;
    }
  }

  // Sistema de ponto para funcionários
  if (currentView === 'employee-punch' && branchData) {
    return (
      <EmployeePunchSystem 
        branchData={branchData} 
        onLogout={() => {
          setBranchData(null);
          setCurrentView('home');
        }}
      />
    );
  }

  // Novo sistema de filiais
  if (currentView === 'branch-dashboard' && branchData) {
    return (
      <BranchDashboard 
        branchData={branchData} 
        onLogout={() => {
          setBranchData(null);
          setCurrentView('home');
        }}
      />
    );
  }

  if (currentView === 'employee-punch-code') {
    return (
      <EmployeePunchCodeLogin 
        onSuccess={handleEmployeePunchLoginSuccess}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'branch') {
    return (
      <BranchLogin 
        onSuccess={handleBranchLoginSuccess}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'master' || currentView === 'company') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          {/* Logo PontoDom - clicável para Master */}
          <div 
            className="flex justify-center mb-6 cursor-pointer pulse-gold"
            onClick={() => setCurrentView('master')}
            title="Acesso Master"
          >
            <img 
              src="/lovable-uploads/742e8fa5-50c1-4bab-b53b-c82b18f8eebd.png" 
              alt="PontoDom Biometria Facial" 
              className="w-48 h-48 object-contain filter drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Ponto Eletrônico</h1>
          <p className="text-lg text-gray-600">Escolha seu tipo de acesso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Acesso Empresa */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentView('company')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-blue-600">Acesso Empresa</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Gerenciamento da empresa, criação de filiais e administração geral
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Entrar como Empresa
              </Button>
            </CardContent>
          </Card>

          {/* Acesso Filial */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentView('branch')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-green-600">Acesso Filial</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Sistema de ponto por biometria facial, cadastro e gerenciamento de funcionários
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Entrar como Filial
              </Button>
            </CardContent>
          </Card>

          {/* Acesso Sistema de Ponto */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setCurrentView('employee-punch-code')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-orange-600">Sistema de Ponto</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Acesso direto ao sistema de ponto por reconhecimento facial para funcionários
              </p>
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Acessar Sistema de Ponto
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2">Como funciona?</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Master:</strong> Cria e gerencia empresas</p>
              <p><strong>Empresa:</strong> Cria e gerencia filiais</p>
              <p><strong>Filial:</strong> Registra funcionários e controla ponto por biometria</p>
              <p><strong>Funcionários:</strong> Fazem ponto apenas com reconhecimento facial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
