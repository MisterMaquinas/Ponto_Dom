import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Save, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface SecuritySettingsProps {
  onBack: () => void;
  userData: any;
  onLogout: () => void;
}

const SecuritySettings = ({ onBack, userData, onLogout }: SecuritySettingsProps) => {
  const [settings, setSettings] = useState({
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    auditLogEnabled: true,
    encryptionLevel: 'AES256'
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Salvando configurações de segurança:', settings);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Configurações de segurança salvas!",
        description: "As políticas de segurança foram atualizadas com sucesso.",
      });
      
      console.log('Configurações de segurança salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações de segurança:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de segurança.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateNewApiKey = () => {
    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Nova chave API gerada:', newKey);
    toast({
      title: "Nova chave API gerada!",
      description: "Uma nova chave de API foi gerada. Salve-a em local seguro.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  Configurações de Segurança
                </h1>
                <p className="text-gray-600">Gerenciar políticas de segurança e autenticação</p>
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
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Políticas de Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprimento Mínimo
                </label>
                <Input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordMinLength: parseInt(e.target.value) || 8
                  })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Requer Maiúsculas</span>
                  <Switch
                    checked={settings.requireUppercase}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      requireUppercase: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Requer Números</span>
                  <Switch
                    checked={settings.requireNumbers}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      requireNumbers: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Requer Caracteres Especiais</span>
                  <Switch
                    checked={settings.requireSpecialChars}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      requireSpecialChars: checked
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Configurações de Sessão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout de Sessão (minutos)
                </label>
                <Input
                  type="number"
                  min="15"
                  max="480"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    sessionTimeout: parseInt(e.target.value) || 60
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Tentativas de Login
                </label>
                <Input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxLoginAttempts: parseInt(e.target.value) || 5
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Criptografia
                </label>
                <Select 
                  value={settings.encryptionLevel} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    encryptionLevel: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES128">AES-128</SelectItem>
                    <SelectItem value="AES256">AES-256</SelectItem>
                    <SelectItem value="RSA2048">RSA-2048</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Autenticação de Dois Fatores</span>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      twoFactorEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Log de Auditoria</span>
                  <Switch
                    checked={settings.auditLogEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      auditLogEnabled: checked
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys Management */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Gerenciamento de Chaves API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Chave API Master</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value="sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                    readOnly
                    className="flex-1 bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" onClick={generateNewApiKey} variant="destructive">
                    Gerar Nova
                  </Button>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-red-500 hover:bg-red-600">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Configurações de Segurança'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
