
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Save, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
}

interface CompanyLimit {
  id: string;
  company_id: string;
  max_admins: number;
  max_managers: number;
  max_supervisors: number;
  max_users: number;
  companies?: Company;
}

interface CompanyLimitsManagerProps {
  onBack: () => void;
  userData: any;
  onLogout: () => void;
}

const CompanyLimitsManager = ({ onBack, userData, onLogout }: CompanyLimitsManagerProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyLimits, setCompanyLimits] = useState<CompanyLimit[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [currentLimits, setCurrentLimits] = useState({
    max_admins: 1,
    max_managers: 5,
    max_supervisors: 10,
    max_users: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar empresas
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);

      // Carregar limites existentes
      const { data: limitsData, error: limitsError } = await supabase
        .from('company_limits')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .order('companies(name)');

      if (limitsError) throw limitsError;
      setCompanyLimits(limitsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das empresas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    
    // Buscar limites existentes para a empresa selecionada
    const existingLimits = companyLimits.find(limit => limit.company_id === companyId);
    
    if (existingLimits) {
      setCurrentLimits({
        max_admins: existingLimits.max_admins,
        max_managers: existingLimits.max_managers,
        max_supervisors: existingLimits.max_supervisors,
        max_users: existingLimits.max_users
      });
    } else {
      // Valores padrão
      setCurrentLimits({
        max_admins: 1,
        max_managers: 5,
        max_supervisors: 10,
        max_users: 50
      });
    }
  };

  const handleSaveLimits = async () => {
    if (!selectedCompanyId) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('company_limits')
        .upsert([
          {
            company_id: selectedCompanyId,
            max_admins: currentLimits.max_admins,
            max_managers: currentLimits.max_managers,
            max_supervisors: currentLimits.max_supervisors,
            max_users: currentLimits.max_users,
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      await loadData();
      
      const companyName = companies.find(c => c.id === selectedCompanyId)?.name;
      
      toast({
        title: "Limites atualizados!",
        description: `Limites da empresa ${companyName} foram salvos com sucesso`,
      });

    } catch (error) {
      console.error('Erro ao salvar limites:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar limites da empresa",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

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
                  <Users className="w-6 h-6 text-purple-600" />
                  Configurar Limites por Empresa
                </h1>
                <p className="text-gray-600">Defina o número máximo de usuários por empresa</p>
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
          {/* Configuração de Limites */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurar Limites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Empresa
                </label>
                <Select value={selectedCompanyId} onValueChange={handleCompanySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCompany && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">
                    Limites para: {selectedCompany.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máx. Administradores
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={currentLimits.max_admins}
                        onChange={(e) => setCurrentLimits({
                          ...currentLimits,
                          max_admins: parseInt(e.target.value) || 1
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máx. Gerentes
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={currentLimits.max_managers}
                        onChange={(e) => setCurrentLimits({
                          ...currentLimits,
                          max_managers: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máx. Supervisores
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={currentLimits.max_supervisors}
                        onChange={(e) => setCurrentLimits({
                          ...currentLimits,
                          max_supervisors: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máx. Usuários
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={currentLimits.max_users}
                        onChange={(e) => setCurrentLimits({
                          ...currentLimits,
                          max_users: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveLimits} 
                    disabled={saving}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Limites'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Empresas e Limites */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Limites Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Carregando dados...
                </div>
              ) : (
                <div className="space-y-4">
                  {companyLimits.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum limite configurado ainda</p>
                    </div>
                  ) : (
                    companyLimits.map((limit) => (
                      <div key={limit.id} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {limit.companies?.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Admins:</span>
                            <Badge variant="outline">{limit.max_admins}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Gerentes:</span>
                            <Badge variant="outline">{limit.max_managers}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Supervisores:</span>
                            <Badge variant="outline">{limit.max_supervisors}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Usuários:</span>
                            <Badge variant="outline">{limit.max_users}</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyLimitsManager;
