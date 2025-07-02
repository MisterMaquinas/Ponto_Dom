import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Download, FileText, Users, Building } from 'lucide-react';
import { useMasterData } from './useMasterData';

interface SystemReportsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const SystemReports = ({ onBack, onLogout, userData }: SystemReportsProps) => {
  const { stats, companies, loading } = useMasterData();

  const handleExportCompanies = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome da Empresa,Data de Criação,Administrador,Usuário,Funcionários\n"
      + companies.map(company => 
          `"${company.name}","${new Date(company.created_at).toLocaleDateString('pt-BR')}","${company.admin_name}","${company.admin_username}","${company.employee_count}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio-empresas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStats = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Métrica,Valor\n"
      + `"Total de Empresas","${stats.totalCompanies}"\n`
      + `"Total de Administradores","${stats.totalAdmins}"\n`
      + `"Total de Funcionários","${stats.totalEmployees}"\n`
      + `"Total de Usuários","${stats.totalUsers}"\n`
      + `"Empresas Ativas","${stats.activeCompanies}"`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "estatisticas-sistema.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Relatórios do Sistema
                </h1>
                <p className="text-gray-600">Visualize e exporte dados do sistema</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando relatórios...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Estatísticas Gerais */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Estatísticas Gerais do Sistema</CardTitle>
                  <Button onClick={handleExportStats} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Building className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-purple-900">{stats.totalCompanies}</div>
                    <div className="text-sm text-purple-700">Empresas Cadastradas</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-blue-900">{stats.totalAdmins}</div>
                    <div className="text-sm text-blue-700">Administradores</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-900">{stats.totalEmployees}</div>
                    <div className="text-sm text-green-700">Funcionários</div>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-orange-900">{stats.totalUsers}</div>
                    <div className="text-sm text-orange-700">Total de Usuários</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Relatório de Empresas */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Relatório de Empresas</CardTitle>
                  <Button onClick={handleExportCompanies} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium">Empresa</th>
                        <th className="text-left p-3 font-medium">Data de Criação</th>
                        <th className="text-left p-3 font-medium">Administrador</th>
                        <th className="text-left p-3 font-medium">Usuário</th>
                        <th className="text-center p-3 font-medium">Funcionários</th>
                        <th className="text-center p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company) => (
                        <tr key={company.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{company.name}</td>
                          <td className="p-3">{new Date(company.created_at).toLocaleDateString('pt-BR')}</td>
                          <td className="p-3">{company.admin_name}</td>
                          <td className="p-3">@{company.admin_username}</td>
                          <td className="p-3 text-center">{company.employee_count}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {company.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Ações de Relatório */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Ações de Relatório</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-16 flex flex-col gap-2">
                  <FileText className="w-6 h-6" />
                  <span>Relatório Completo</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>Análise de Dados</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-2">
                  <Download className="w-6 h-6" />
                  <span>Backup dos Dados</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemReports;