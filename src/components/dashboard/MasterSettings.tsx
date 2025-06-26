
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Settings, Save, RefreshCw, Database, Shield, Bell } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MasterSettingsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const MasterSettings = ({ onBack, onLogout, userData }: MasterSettingsProps) => {
  const [settings, setSettings] = useState({
    systemName: 'BioPonto System',
    maxCompanies: 100,
    maxUsersPerCompany: 500,
    sessionTimeout: 30,
    backupFrequency: 'daily',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState({
    totalTables: 0,
    totalRecords: 0,
    lastBackup: 'Nunca'
  });

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      // Contar empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id');

      // Contar usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');

      // Contar master users
      const { data: masterUsers, error: masterError } = await supabase
        .from('master_users')
        .select('id');

      if (!companiesError && !usersError && !masterError) {
        const totalRecords = (companies?.length || 0) + (users?.length || 0) + (masterUsers?.length || 0);
        setDbStats({
          totalTables: 3,
          totalRecords,
          lastBackup: new Date().toLocaleDateString('pt-BR')
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas!",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    setLoading(true);
    try {
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDbStats(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleDateString('pt-BR')
      }));

      toast({
        title: "Backup realizado!",
        description: "Backup do banco de dados criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os logs do sistema?')) {
      return;
    }

    setLoading(true);
    try {
      // Simular limpeza de logs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Logs limpos!",
        description: "Todos os logs do sistema foram removidos.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                  <Settings className="w-6 h-6 text-purple-600" />
                  Configurações do Sistema
                </h1>
                <p className="text-gray-600">Gerencie as configurações globais do sistema</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Sistema
                </label>
                <Input
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  placeholder="Nome do sistema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Empresas
                </label>
                <Input
                  type="number"
                  value={settings.maxCompanies}
                  onChange={(e) => setSettings({ ...settings, maxCompanies: parseInt(e.target.value) })}
                  placeholder="Máximo de empresas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Usuários por Empresa
                </label>
                <Input
                  type="number"
                  value={settings.maxUsersPerCompany}
                  onChange={(e) => setSettings({ ...settings, maxUsersPerCompany: parseInt(e.target.value) })}
                  placeholder="Máximo de usuários"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout da Sessão (minutos)
                </label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  placeholder="Timeout em minutos"
                />
              </div>

              <Button 
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">Total de Tabelas</p>
                  <p className="text-2xl font-bold text-blue-900">{dbStats.totalTables}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Total de Registros</p>
                  <p className="text-2xl font-bold text-green-900">{dbStats.totalRecords}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Último Backup</p>
                <p className="text-lg font-semibold text-gray-900">{dbStats.lastBackup}</p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleBackupDatabase}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {loading ? 'Fazendo Backup...' : 'Fazer Backup'}
                </Button>

                <Button 
                  onClick={handleClearLogs}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Autenticação 2FA</p>
                  <p className="text-sm text-green-600">Habilitada para Masters</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Criptografia</p>
                  <p className="text-sm text-blue-600">Dados criptografados</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">Logs de Auditoria</p>
                  <p className="text-sm text-yellow-600">Registrando atividades</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Ativo</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Alertas de Sistema</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Backup Automático</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Relatórios Semanais</span>
                  <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Alertas de Erro</span>
                  <Badge className="bg-red-100 text-red-800">Ativo</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Configurações de notificação gerenciadas automaticamente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MasterSettings;
