
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Settings, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemSettingsManagerProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const SystemSettingsManager = ({ onBack, onLogout, userData }: SystemSettingsManagerProps) => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState<{[key: string]: any}>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      
      setSettings(data || []);
      
      // Inicializar valores de edição
      const initialEditingValues: {[key: string]: any} = {};
      (data || []).forEach(setting => {
        initialEditingValues[setting.setting_key] = setting.setting_value;
      });
      setEditingSettings(initialEditingValues);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (settingKey: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: editingSettings[settingKey],
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey);

      if (error) throw error;
      
      await loadSettings();
      toast({
        title: "Configuração salva!",
        description: `A configuração "${settingKey}" foi atualizada`,
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (settingKey: string, value: any) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const value = editingSettings[setting.setting_key];
    
    switch (setting.setting_key) {
      case 'maintenance_mode':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="true">Ativado</option>
            <option value="false">Desativado</option>
          </select>
        );
      
      case 'default_company_limits':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange(setting.setting_key, parsed);
              } catch {
                handleInputChange(setting.setting_key, e.target.value);
              }
            }}
            className="w-full p-2 border rounded-md h-24 font-mono text-sm"
            placeholder="JSON válido"
          />
        );
      
      case 'max_login_attempts':
      case 'session_timeout':
      case 'backup_frequency':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, parseInt(e.target.value))}
            className="w-full"
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  const getSettingDisplayName = (key: string) => {
    const names: {[key: string]: string} = {
      'max_login_attempts': 'Máximo de Tentativas de Login',
      'session_timeout': 'Timeout da Sessão (segundos)',
      'backup_frequency': 'Frequência de Backup (horas)',
      'maintenance_mode': 'Modo de Manutenção',
      'default_company_limits': 'Limites Padrão por Empresa'
    };
    return names[key] || key;
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
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Configurações Globais</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Carregando configurações...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getSettingDisplayName(setting.setting_key)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {setting.description}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSaveSetting(setting.setting_key)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Salvar
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Atual
                      </label>
                      {renderSettingInput(setting)}
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Última atualização: {new Date(setting.updated_at).toLocaleString('pt-BR')}</p>
                      <p>Chave: <code className="bg-gray-200 px-1 rounded">{setting.setting_key}</code></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="font-medium text-yellow-800 mb-1">⚠️ Atenção</p>
                <p>Alterações nas configurações do sistema podem afetar o funcionamento global da aplicação. Teste sempre em ambiente de desenvolvimento antes de aplicar em produção.</p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="font-medium text-blue-800 mb-1">ℹ️ Configurações</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Modo de Manutenção:</strong> Quando ativado, bloqueia o acesso de usuários regulares</li>
                  <li><strong>Timeout da Sessão:</strong> Tempo em segundos antes do usuário ser desconectado automaticamente</li>
                  <li><strong>Limites Padrão:</strong> Configuração JSON com limites padrão para novas empresas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingsManager;
