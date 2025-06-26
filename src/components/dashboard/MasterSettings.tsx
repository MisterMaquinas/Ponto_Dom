import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Users, Database, Shield, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import CompanyLimitsManager from './master/CompanyLimitsManager';
import DatabaseSettings from './master/DatabaseSettings';
import SecuritySettings from './master/SecuritySettings';
import GeneralSettings from './master/GeneralSettings';

interface MasterSettingsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const MasterSettings = ({ onBack, onLogout, userData }: MasterSettingsProps) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (activeSection === 'company-limits') {
    return (
      <CompanyLimitsManager 
        onBack={() => setActiveSection('overview')} 
        userData={userData}
        onLogout={onLogout}
      />
    );
  }

  if (activeSection === 'database') {
    return (
      <DatabaseSettings 
        onBack={() => setActiveSection('overview')} 
        userData={userData}
        onLogout={onLogout}
      />
    );
  }

  if (activeSection === 'security') {
    return (
      <SecuritySettings 
        onBack={() => setActiveSection('overview')} 
        userData={userData}
        onLogout={onLogout}
      />
    );
  }

  if (activeSection === 'general') {
    return (
      <GeneralSettings 
        onBack={() => setActiveSection('overview')} 
        userData={userData}
        onLogout={onLogout}
      />
    );
  }

  const settingsSections = [
    {
      id: 'company-limits',
      title: 'Limites por Empresa',
      description: 'Configure o número máximo de usuários que cada empresa pode cadastrar',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      action: () => setActiveSection('company-limits')
    },
    {
      id: 'database',
      title: 'Configurações do Banco',
      description: 'Gerenciar configurações de banco de dados e performance',
      icon: Database,
      color: 'from-green-500 to-green-600',
      action: () => setActiveSection('database')
    },
    {
      id: 'security',
      title: 'Segurança do Sistema',
      description: 'Configurar políticas de segurança e autenticação',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      action: () => setActiveSection('security')
    },
    {
      id: 'general',
      title: 'Configurações Gerais',
      description: 'Ajustes gerais do sistema e preferências',
      icon: SettingsIcon,
      color: 'from-purple-500 to-purple-600',
      action: () => setActiveSection('general')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                  Configurações do Sistema
                </h1>
                <p className="text-gray-600">Configurações avançadas do sistema</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section) => (
            <Card key={section.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={section.action}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600 font-normal">{section.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={section.action}
                  className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90`}
                >
                  Configurar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">v1.0.0</div>
                <div className="text-sm text-gray-600">Versão do Sistema</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Active</div>
                <div className="text-sm text-gray-600">Status do Sistema</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-gray-600">Banco de Dados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterSettings;
