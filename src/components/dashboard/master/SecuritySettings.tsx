
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Shield, Save, Lock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface SecuritySettingsProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const SecuritySettings = ({ onBack, onLogout, userData }: SecuritySettingsProps) => {
  const [settings, setSettings] = useState({
    maxLoginAttempts: '5',
    sessionTimeout: '60',
    passwordMinLength: '8',
    requireTwoFactor: false,
    logFailedAttempts: true,
    blockAfterFailures: true,
    maintenanceMode: false,
    auditLogging: true
  });

  const handleSave = () => {
    toast({
      title: "Configurações de Segurança Salvas",
      description: "As configurações de segurança foram atualizadas com sucesso.",
    });
  };

  const handleToggle = (key: string, value: boolean) => {
    setSettings({...settings, [key]: value});
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
                  <Shield className="w-6 h-6 text-red-600" />
                  Configurações de Segurança
                </h1>
                <p className="text-gray-600">Gerencie as configurações de segurança do sistema</p>
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
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Políticas de Autenticação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Tentativas de Login
                </label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({...settings, maxLoginAttempts: e.target.value})}
                  placeholder="5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout da Sessão (minutos)
                </label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                  placeholder="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprimento Mínimo da Senha
                </label>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({...settings, passwordMinLength: e.target.value})}
                  placeholder="8"
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700">
                  Exigir Autenticação de Dois Fatores
                </label>
                <Switch
                  checked={settings.requireTwoFactor}
                  onCheckedChange={(checked) => handleToggle('requireTwoFactor', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Configurações de Monitoramento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700">
                  Registrar Tentativas de Login Falhadas
                </label>
                <Switch
                  checked={settings.logFailedAttempts}
                  onCheckedChange={(checked) => handleToggle('logFailedAttempts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700">
                  Bloquear Após Falhas Sucessivas
                </label>
                <Switch
                  checked={settings.blockAfterFailures}
                  onCheckedChange={(checked) => handleToggle('blockAfterFailures', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700">
                  Logs de Auditoria
                </label>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => handleToggle('auditLogging', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700">
                  Modo de Manutenção
                </label>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleToggle('maintenanceMode', checked)}
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
            <CardTitle>Status de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Ativo</div>
                <div className="text-sm text-gray-600">Firewall</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Tentativas Bloqueadas</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">256</div>
                <div className="text-sm text-gray-600">Sessões Ativas</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;
