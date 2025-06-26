
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Database, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DatabaseSettingsProps {
  onBack: () => void;
  userData: any;
  onLogout: () => void;
}

const DatabaseSettings = ({ onBack, userData, onLogout }: DatabaseSettingsProps) => {
  const [settings, setSettings] = useState({
    maxConnections: 100,
    queryTimeout: 30,
    backupEnabled: true,
    maintenanceMode: false,
    logQueries: false,
    cacheEnabled: true
  });
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('connected');

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Configurações salvas!",
        description: "As configurações do banco de dados foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('connected');
      toast({
        title: "Conexão testada!",
        description: "Conexão com o banco de dados está funcionando corretamente.",
      });
    } catch (error) {
      setConnectionStatus('disconnected');
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao banco de dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <Database className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-6 h-6 text-green-600" />
                  Configurações do Banco de Dados
                </h1>
                <p className="text-gray-600">Gerenciar configurações de performance e conexão</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status da Conexão */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Status da Conexão
                <Badge 
                  variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                  className={connectionStatus === 'connected' ? 'bg-green-500' : ''}
                >
                  {connectionStatus === 'checking' ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Testando...
                    </>
                  ) : connectionStatus === 'connected' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Desconectado
                    </>
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 space-y-2">
                  <div>Host: localhost:5432</div>
                  <div>Database: sistema_empresarial</div>
                  <div>Conexões ativas: 15/100</div>
                </div>
              </div>
              <Button onClick={testConnection} className="w-full" disabled={connectionStatus === 'checking'}>
                <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                Testar Conexão
              </Button>
            </CardContent>
          </Card>

          {/* Configurações de Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Configurações de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Conexões
                </label>
                <Input
                  type="number"
                  value={settings.maxConnections}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxConnections: parseInt(e.target.value) || 100
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout de Query (segundos)
                </label>
                <Input
                  type="number"
                  value={settings.queryTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    queryTimeout: parseInt(e.target.value) || 30
                  })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cache Habilitado</span>
                  <Switch
                    checked={settings.cacheEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      cacheEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Log de Queries</span>
                  <Switch
                    checked={settings.logQueries}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      logQueries: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Backup Automático</span>
                  <Switch
                    checked={settings.backupEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      backupEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Modo Manutenção</span>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      maintenanceMode: checked
                    })}
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-green-500 hover:bg-green-600">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSettings;
