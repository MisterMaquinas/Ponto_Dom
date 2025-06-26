
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Building, Crown } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminManagementProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface Company {
  id: string;
  name: string;
  created_at: string;
}

interface Admin {
  id: string;
  company_id: string;
  name: string;
  username: string;
  companies?: Company;
}

const AdminManagement = ({ onBack, onLogout, userData }: AdminManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    adminName: '',
    adminUser: '',
    adminPassword: ''
  });

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

      if (companiesError) {
        console.error('Erro ao carregar empresas:', companiesError);
        toast({
          title: "Erro",
          description: "Erro ao carregar empresas",
          variant: "destructive",
        });
        setCompanies([]);
      } else {
        setCompanies(companiesData || []);
      }

      // Carregar administradores
      const { data: adminsData, error: adminsError } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            id,
            name,
            created_at
          )
        `)
        .eq('role', 'admin')
        .order('name');

      if (adminsError) {
        console.error('Erro ao carregar administradores:', adminsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar administradores",
          variant: "destructive",
        });
        setAdmins([]);
      } else {
        setAdmins(adminsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
      setCompanies([]);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.adminName || !formData.adminUser || !formData.adminPassword) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Primeiro, criar a empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          { name: formData.companyName }
        ])
        .select()
        .single();

      if (companyError) {
        console.error('Erro ao criar empresa:', companyError);
        toast({
          title: "Erro",
          description: "Erro ao criar empresa: " + companyError.message,
          variant: "destructive",
        });
        return;
      }

      // Depois, criar o administrador
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .insert([
          {
            company_id: companyData.id,
            name: formData.adminName,
            cpf: '000.000.000-00', // CPF temporário
            rg: '0000000',
            birth_date: '1990-01-01',
            street: 'Rua Principal',
            number: '123',
            neighborhood: 'Centro',
            city: 'Cidade',
            state: 'SP',
            zip_code: '00000-000',
            contact: 'admin@empresa.com',
            username: formData.adminUser,
            password: formData.adminPassword,
            role: 'admin',
            created_by: 'master'
          }
        ])
        .select();

      if (adminError) {
        console.error('Erro ao criar administrador:', adminError);
        // Se houve erro ao criar o admin, remover a empresa criada
        await supabase.from('companies').delete().eq('id', companyData.id);
        toast({
          title: "Erro",
          description: "Erro ao criar administrador: " + adminError.message,
          variant: "destructive",
        });
        return;
      }

      await loadData();
      setFormData({ companyName: '', adminName: '', adminUser: '', adminPassword: '' });
      setShowForm(false);
      
      toast({
        title: "Empresa cadastrada com sucesso!",
        description: `${formData.companyName} foi cadastrada com o administrador ${formData.adminUser}`,
      });
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao cadastrar empresa",
        variant: "destructive",
      });
    }
  };

  const deleteAdmin = async (adminId: string, companyId: string) => {
    if (!confirm('Tem certeza que deseja remover esta empresa? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Primeiro, deletar todos os usuários da empresa
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .eq('company_id', companyId);

      if (usersError) {
        console.error('Erro ao deletar usuários:', usersError);
        toast({
          title: "Erro",
          description: "Erro ao remover usuários da empresa",
          variant: "destructive",
        });
        return;
      }

      // Depois, deletar a empresa
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (companyError) {
        console.error('Erro ao deletar empresa:', companyError);
        toast({
          title: "Erro",
          description: "Erro ao remover empresa",
          variant: "destructive",
        });
        return;
      }

      await loadData();
      toast({
        title: "Empresa removida",
        description: "A empresa e todos os seus usuários foram removidos do sistema",
      });
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover empresa",
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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                  Cadastrar Empresas
                </h1>
                <p className="text-gray-600">Gerencie empresas e administradores</p>
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
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Cadastrar Nova Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Empresa *
                    </label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Ex: RaioX, TechCorp, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Administrador *
                    </label>
                    <Input
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      placeholder="Nome completo do administrador"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Login do Administrador *
                    </label>
                    <Input
                      value={formData.adminUser}
                      onChange={(e) => setFormData({ ...formData, adminUser: e.target.value })}
                      placeholder="Ex: admin_raiox, tech_admin, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha do Administrador *
                    </label>
                    <Input
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      placeholder="Digite a senha para o administrador"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    Cadastrar Empresa
                  </Button>
                  <Button type="button" onClick={() => setShowForm(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Empresas Cadastradas ({admins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Carregando empresas...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {admins.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2 text-lg">Nenhuma empresa cadastrada ainda</p>
                    <p className="text-sm text-gray-400 mb-4">Use o botão "Nova Empresa" para começar</p>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeira Empresa
                    </Button>
                  </div>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.companies?.name}</p>
                          <p className="text-sm text-gray-600">Admin: {admin.name}</p>
                          <p className="text-sm text-gray-600">Login: @{admin.username}</p>
                          <p className="text-xs text-gray-500">
                            Criada em {new Date(admin.companies?.created_at || '').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-100 text-green-800">
                          Ativa
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteAdmin(admin.id, admin.company_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
  );
};

export default AdminManagement;
