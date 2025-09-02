import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Key, Plus, Eye, EyeOff, Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface CompanyAccessKeysProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const CompanyAccessKeys = ({ onBack, onLogout, userData }: CompanyAccessKeysProps) => {
  const { toast } = useToast();
  const [accessKey, setAccessKey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadAccessKey();
  }, []);

  const loadAccessKey = async () => {
    const companyId = userData?.companyId || userData?.company_id;
    
    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_keys')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      setAccessKey(data);
    } catch (error) {
      console.error('Erro ao carregar chave de acesso:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar chave de acesso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKeyStatus = async () => {
    if (!accessKey) return;
    
    try {
      const { error } = await supabase
        .from('access_keys')
        .update({ is_active: !accessKey.is_active })
        .eq('id', accessKey.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Chave ${!accessKey.is_active ? 'ativada' : 'desativada'} com sucesso!`,
      });

      loadAccessKey();
    } catch (error) {
      console.error('Erro ao alterar status da chave:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da chave",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Sucesso",
        description: "Chave copiada para a área de transferência!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar chave",
        variant: "destructive",
      });
    }
  };

  const toggleShowKey = () => {
    setShowKey(prev => !prev);
  };

  const formatKey = (key: string) => {
    return key.replace(/(.{4})/g, '$1-').slice(0, -1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Key className="w-6 h-6 text-orange-600" />
                  Chaves de Acesso
                </h1>
                <p className="text-gray-600">Gerenciar chaves de acesso da empresa</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando chave...</div>
          </div>
        ) : accessKey ? (
          <Card>
            <CardHeader>
              <CardTitle>Chave de Acesso da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xl">
                    {showKey ? formatKey(accessKey.key_value) : '••••-••••-••••'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleShowKey}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(accessKey.key_value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-500">
                  <div className="mb-1">
                    <strong>Descrição:</strong> {accessKey.description}
                  </div>
                  Criada em: {new Date(accessKey.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    accessKey.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {accessKey.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleToggleKeyStatus}
                    className={accessKey.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {accessKey.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Chave de acesso não encontrada</p>
              <p className="text-sm text-gray-400 mt-2">A chave é gerada automaticamente ao cadastrar a empresa</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Como usar a chave de acesso:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• A chave é única por empresa e gerada automaticamente</li>
              <li>• Use essa chave no sistema de ponto para acessar</li>
              <li>• Compartilhe a chave com os responsáveis das filiais</li>
              <li>• Você pode ativar/desativar a chave a qualquer momento</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyAccessKeys;