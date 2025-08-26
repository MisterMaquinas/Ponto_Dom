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
  const [accessKeys, setAccessKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadAccessKeys();
  }, []);

  const loadAccessKeys = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccessKeys(data || []);
    } catch (error) {
      console.error('Erro ao carregar chaves de acesso:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar chaves de acesso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAccessKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const newKey = generateAccessKey();
      
      const { data, error } = await supabase
        .from('access_keys')
        .insert({
          key_value: newKey,
          company_id: companyId,
          description: newKeyDescription || 'Chave de acesso da empresa',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Chave de acesso criada com sucesso!",
      });

      setNewKeyDescription('');
      setShowNewKeyForm(false);
      loadAccessKeys();
    } catch (error) {
      console.error('Erro ao criar chave de acesso:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar chave de acesso",
        variant: "destructive",
      });
    }
  };

  const handleToggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('access_keys')
        .update({ is_active: !currentStatus })
        .eq('id', keyId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Chave ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`,
      });

      loadAccessKeys();
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

  const toggleShowKey = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
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
        <div className="mb-6">
          <Button
            onClick={() => setShowNewKeyForm(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Gerar Nova Chave
          </Button>
        </div>

        {showNewKeyForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Gerar Nova Chave de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Input
                    id="description"
                    value={newKeyDescription}
                    onChange={(e) => setNewKeyDescription(e.target.value)}
                    placeholder="Ex: Chave para filial centro"
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit">
                    Gerar Chave
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewKeyForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando chaves...</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {accessKeys.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Key className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhuma chave de acesso cadastrada</p>
                  <Button
                    onClick={() => setShowNewKeyForm(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    Gerar Primeira Chave
                  </Button>
                </CardContent>
              </Card>
            ) : (
              accessKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-lg">
                                {showKeys[key.id] 
                                  ? formatKey(key.key_value)
                                  : '••••-••••-••••'
                                }
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleShowKey(key.id)}
                              >
                                {showKeys[key.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.key_value)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-gray-500">
                              {key.description && (
                                <div className="mb-1">
                                  <strong>Descrição:</strong> {key.description}
                                </div>
                              )}
                              Criada em: {new Date(key.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              key.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {key.is_active ? 'Ativa' : 'Inativa'}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleKeyStatus(key.id, key.is_active)}
                              className={key.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {key.is_active ? 'Desativar' : 'Ativar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Como usar as chaves de acesso:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• As chaves permitem que filiais acessem o sistema de ponto</li>
              <li>• Compartilhe a chave com os responsáveis das filiais</li>
              <li>• Você pode ativar/desativar chaves a qualquer momento</li>
              <li>• Cada chave é única e rastreável</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyAccessKeys;