
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, BarChart3, Crown, Eye, Settings, UserPlus, CreditCard } from 'lucide-react';
import MasterReports from './MasterReports';
import CompanyManagement from './master/CompanyManagement';
import CompanyDetails from './master/CompanyDetails';
import SystemSettings from './master/SystemSettings';
import SubscriptionManager from './master/SubscriptionManager';
import { useMasterData } from './master/useMasterData';

interface MasterDashboardProps {
  userData: any;
  onLogout: () => void;
}

const MasterDashboard = ({ userData, onLogout }: MasterDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const { stats, companies, loading } = useMasterData();

  if (activeTab === 'reports') {
    return <MasterReports onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'company-management') {
    return <CompanyManagement onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'company-details' && selectedCompany) {
    return <CompanyDetails company={selectedCompany} onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'system-settings') {
    return <SystemSettings onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'subscriptions') {
    return <SubscriptionManager onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  const mainStats = [
    { title: 'Total de Empresas', value: stats.totalCompanies.toString(), icon: Building, color: 'from-purple-500 to-purple-600' },
    { title: 'Total de Filiais', value: stats.totalBranches?.toString() || '0', icon: Building, color: 'from-blue-500 to-blue-600' },
  ];

  const handleCompanyClick = (company: any) => {
    console.log('Company clicked:', company);
    setSelectedCompany(company);
    setActiveTab('company-details');
  };

  const handleButtonClick = (tabName: string) => {
    console.log('Button clicked for tab:', tabName);
    setActiveTab(tabName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                PontoDom - Master Dashboard
              </h1>
              <p className="text-gray-600">Painel de controle do sistema</p>
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
                    <Building className="w-5 h-5" />
                    Empresas Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {companies.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma empresa cadastrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {companies.slice(0, 5).map((company) => (
                        <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleCompanyClick(company)}>
                          <div>
                            <h4 className="font-medium text-gray-900">{company.name}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(company.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {companies.length > 5 && (
                        <p className="text-sm text-gray-500 text-center pt-2">
                          +{companies.length - 5} empresas...
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
                    onClick={() => handleButtonClick('reports')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Relatórios Gerais do Sistema
                  </Button>
                  <Button
                    onClick={() => handleButtonClick('company-management')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Building className="w-5 h-5 mr-3" />
                    Gerenciar Empresas
                  </Button>
                  <Button
                    onClick={() => handleButtonClick('subscriptions')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    Controle de Pagamentos
                  </Button>
                  <Button
                    onClick={() => handleButtonClick('system-settings')}
                    className="w-full justify-start h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Administrar Sistema
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
