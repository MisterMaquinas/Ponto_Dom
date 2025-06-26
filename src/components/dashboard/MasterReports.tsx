
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, BarChart3, Building, Users, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface MasterReportsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface ReportData {
  totalCompanies: number;
  totalUsers: number;
  companiesThisMonth: number;
  usersThisMonth: number;
  companyGrowth: number;
  userGrowth: number;
}

const MasterReports = ({ onBack, onLogout, userData }: MasterReportsProps) => {
  const [reportData, setReportData] = useState<ReportData>({
    totalCompanies: 0,
    totalUsers: 0,
    companiesThisMonth: 0,
    usersThisMonth: 0,
    companyGrowth: 0,
    userGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Data atual e início do mês
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Buscar total de empresas
      const { data: allCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id, created_at');

      // Buscar total de usuários
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, created_at');

      if (companiesError || usersError) {
        console.error('Erro ao carregar dados:', companiesError || usersError);
        return;
      }

      // Calcular estatísticas
      const totalCompanies = (allCompanies || []).length;
      const totalUsers = (allUsers || []).length;

      // Empresas criadas este mês
      const companiesThisMonth = (allCompanies || []).filter(
        company => new Date(company.created_at) >= startOfMonth
      ).length;

      // Usuários criados este mês
      const usersThisMonth = (allUsers || []).filter(
        user => new Date(user.created_at) >= startOfMonth
      ).length;

      // Crescimento do mês passado
      const companiesLastMonth = (allCompanies || []).filter(
        company => {
          const date = new Date(company.created_at);
          return date >= startOfLastMonth && date <= endOfLastMonth;
        }
      ).length;

      const usersLastMonth = (allUsers || []).filter(
        user => {
          const date = new Date(user.created_at);
          return date >= startOfLastMonth && date <= endOfLastMonth;
        }
      ).length;

      const companyGrowth = companiesLastMonth > 0 
        ? ((companiesThisMonth - companiesLastMonth) / companiesLastMonth) * 100 
        : companiesThisMonth > 0 ? 100 : 0;

      const userGrowth = usersLastMonth > 0 
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 
        : usersThisMonth > 0 ? 100 : 0;

      setReportData({
        totalCompanies,
        totalUsers,
        companiesThisMonth,
        usersThisMonth,
        companyGrowth,
        userGrowth
      });
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
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
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  Relatórios Gerais
                </h1>
                <p className="text-gray-600">Visão geral do sistema</p>
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando relatórios...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalCompanies}</p>
                      <p className="text-xs text-green-600">{reportData.companiesThisMonth} este mês</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalUsers}</p>
                      <p className="text-xs text-green-600">{reportData.usersThisMonth} este mês</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Crescimento Empresas</p>
                      <p className="text-2xl font-bold text-gray-900">{formatGrowth(reportData.companyGrowth)}</p>
                      <p className="text-xs text-gray-500">vs mês anterior</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Crescimento Usuários</p>
                      <p className="text-2xl font-bold text-gray-900">{formatGrowth(reportData.userGrowth)}</p>
                      <p className="text-xs text-gray-500">vs mês anterior</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Resumo Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Empresas Cadastradas</p>
                        <p className="text-sm text-gray-600">Este mês</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{reportData.companiesThisMonth}</p>
                        <p className="text-sm text-purple-600">{formatGrowth(reportData.companyGrowth)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Usuários Cadastrados</p>
                        <p className="text-sm text-gray-600">Este mês</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{reportData.usersThisMonth}</p>
                        <p className="text-sm text-blue-600">{formatGrowth(reportData.userGrowth)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Estatísticas Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Empresas Ativas</span>
                        <span className="text-sm font-bold text-gray-900">{reportData.totalCompanies}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Usuários Ativos</span>
                        <span className="text-sm font-bold text-gray-900">{reportData.totalUsers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 text-center">
                        Relatório atualizado em {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MasterReports;
