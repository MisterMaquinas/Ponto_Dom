
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Database, Save, TestTube } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DatabaseSettingsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const DatabaseSettings = ({ onBack, onLogout, userData }: DatabaseSettingsProps) => {
  const [settings, setSettings] = useState({
    host: 'localhost',
    port: '5432',
    database: 'pontodom',
    username: 'postgres',
    maxConnections: '100',
    backupFrequency: '24',
    retentionDays: '30'
  });

  const handleSave = () => {
    toast({
      title: "Configurações Salvas",
      description: "As configurações do banco de dados foram atualizadas com sucesso.",
    });
  };

  const handleTestConnection = () => {
    toast({
      title: "Testando Conexão",
      description: "Conexão com o banco de dados testada com sucesso!",
    });
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
                  <Database className="w-6 h-6 text-blue-600" />
                  Configurações do Banco
                </h1>
                <p className="text-gray-600">Gerencie as configurações do banco de dados</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Configurações de Conexão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host do Banco
                </label>
                <Input
                  value={settings.host}
                  onChange={(e) => setSettings({...settings, host: e.target.value})}
                  placeholder="localhost"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porta
                </label>
                <Input
                  value={settings.port}
                  onChange={(e) => setSettings({...settings, port: e.target.value})}
                  placeholder="5432"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Banco
                </label>
                <Input
                  value={settings.database}
                  onChange={(e) => setSettings({...settings, database: e.target.value})}
                  placeholder="pontodom"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário
                </label>
                <Input
                  value={settings.username}
                  onChange={(e) => setSettings({...settings, username: e.target.value})}
                  placeholder="postgres"
                />
              </div>
              
              <Button onClick={handleTestConnection} className="w-full" variant="outline">
                <TestTube className="w-4 h-4 mr-2" />
                Testar Conexão
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Conexões
                </label>
                <Input
                  type="number"
                  value={settings.maxConnections}
                  onChange={(e) => setSettings({...settings, maxConnections: e.target.value})}
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência de Backup (horas)
                </label>
                <Input
                  type="number"
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                  placeholder="24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retenção de Backups (dias)
                </label>
                <Input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({...settings, retentionDays: e.target.value})}
                  placeholder="30"
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSave} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-gray-600">Status do Banco</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">45</div>
                <div className="text-sm text-gray-600">Conexões Ativas</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2.1GB</div>
                <div className="text-sm text-gray-600">Tamanho do Banco</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">12h</div>
                <div className="text-sm text-gray-600">Último Backup</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseSettings;
