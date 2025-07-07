import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, FileText, Users, Building2 } from 'lucide-react';

interface CompanyReportsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const CompanyReports = ({ onBack, onLogout, userData }: CompanyReportsProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios da Empresa</h1>
                <p className="text-gray-600">Relatórios e estatísticas da {userData.companyName}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Building2 className="w-5 h-5" />
                Relatório de Filiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Visualize informações detalhadas sobre todas as filiais
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600" disabled>
                Em Breve
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Users className="w-5 h-5" />
                Relatório de Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Dados consolidados de todos os funcionários da empresa
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
                Em Breve
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <BarChart3 className="w-5 h-5" />
                Relatório de Produtividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Análise de produtividade por filial e funcionário
              </p>
              <Button className="w-full bg-purple-500 hover:bg-purple-600" disabled>
                Em Breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyReports;