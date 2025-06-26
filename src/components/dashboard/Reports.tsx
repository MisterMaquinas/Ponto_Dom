
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, Clock, Filter, Building } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ReportsProps {
  onBack: () => void;
  userType: 'admin' | 'manager' | 'supervisor';
  onLogout: () => void;
  userData: any;
}

const Reports = ({ onBack, userType, onLogout, userData }: ReportsProps) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const mockData = [
    { id: 1, name: 'João Silva', date: '2024-01-15', entry: '08:15', exit: '17:45', status: 'complete' },
    { id: 2, name: 'Maria Santos', date: '2024-01-15', entry: '08:00', exit: '18:00', status: 'complete' },
    { id: 3, name: 'Pedro Costa', date: '2024-01-15', entry: '08:30', exit: '17:30', status: 'late' },
    { id: 4, name: 'Ana Oliveira', date: '2024-01-15', entry: '08:10', exit: '--:--', status: 'incomplete' },
    { id: 5, name: 'Carlos Silva', date: '2024-01-14', entry: '08:05', exit: '17:50', status: 'complete' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Completo</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Atraso</Badge>;
      case 'incomplete':
        return <Badge className="bg-red-100 text-red-800">Incompleto</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const exportReport = () => {
    toast({
      title: "Relatório exportado!",
      description: "O arquivo foi baixado com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios de Ponto</h1>
                <p className="text-gray-600">Visualizar e exportar registros</p>
                {userData?.companyName && (
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">{userData.companyName}</span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funcionário
                </label>
                <Input
                  type="text"
                  placeholder="Digite o nome"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Pesquisar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Registros de Ponto
              </CardTitle>
              <Button onClick={exportReport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Funcionário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Entrada</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Saída</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {record.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{record.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-mono">{record.entry}</td>
                      <td className="py-3 px-4 text-gray-900 font-mono">{record.exit}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-sm text-gray-600">Taxa de Presença</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">7.2h</div>
              <div className="text-sm text-gray-600">Média de Horas/Dia</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">12</div>
              <div className="text-sm text-gray-600">Atrasos no Mês</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
