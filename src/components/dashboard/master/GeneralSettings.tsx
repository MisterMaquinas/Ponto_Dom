import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Globe, Bell, Palette } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface GeneralSettingsProps {
  onBack: () => void;
  userData: any;
  onLogout: () => void;
}

const GeneralSettings = ({ onBack, userData, onLogout }: GeneralSettingsProps) => {
  const [settings, setSettings] = useState({
    systemName: 'Sistema Empresarial',
    companyName: 'Empresa Master',
    supportEmail: 'suporte@empresa.com',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    theme: 'light',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    systemAnnouncement: '',
    maxFileSize: 10,
    sessionDuration: 480
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Salvando configurações gerais:', settings);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Configurações gerais salvas!",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
      
      console.log('Configurações gerais salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações gerais.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-purple-600" />
                  Configurações Gerais
                </h1>
                <p className="text-gray-600">Configurações básicas do sistema e preferências</p>
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
                <Globe className="w-5 h-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Sistema
                </label>
                <Input
                  value={settings.systemName}
                  onChange={(e) => setSettings({
                    ...settings,
                    systemName: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyName: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Suporte
                </label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({
                    ...settings,
                    supportEmail: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    timezone: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    language: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Preferências de Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => setSettings({
                    ...settings,
                    theme: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho Máximo de Arquivo (MB)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxFileSize: parseInt(e.target.value) || 10
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração da Sessão (minutos)
                </label>
                <Input
                  type="number"
                  min="30"
                  max="1440"
                  value={settings.sessionDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    sessionDuration: parseInt(e.target.value) || 480
                  })}
                />
              </div>

              <div className="space-y-4">
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

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Permitir Registros</span>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      allowRegistration: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Notificações por Email</span>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      emailNotifications: checked
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Anúncios do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem de Anúncio
                </label>
                <Textarea
                  placeholder="Digite uma mensagem que será exibida para todos os usuários do sistema"
                  value={settings.systemAnnouncement}
                  onChange={(e) => setSettings({
                    ...settings,
                    systemAnnouncement: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-purple-500 hover:bg-purple-600">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvar Configurações Gerais'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
