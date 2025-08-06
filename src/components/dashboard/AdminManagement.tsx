import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, User, Crown } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminManagementProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface Admin {
  id: string;
  username: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
}

const AdminManagement = ({ onBack, onLogout, userData }: AdminManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [editFormData, setEditFormData] = useState({
    username: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar administradores da tabela admins
      const { data: adminsData, error: adminsError } = await supabase
        .from('admins')
        .select('*')
        .order('username');

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

      // Carregar usuários regulares
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('username');

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
        toast({
          title: "Erro",
          description: "Erro ao carregar usuários",
          variant: "destructive",
        });
        setUsers([]);
      } else {
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
      setAdmins([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar novo administrador
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .insert([
          {
            username: formData.username,
            password: formData.password
          }
        ])
        .select();

      if (adminError) {
        console.error('Erro ao criar administrador:', adminError);
        toast({
          title: "Erro",
          description: "Erro ao criar administrador: " + adminError.message,
          variant: "destructive",
        });
        return;
      }

      await loadData();
      setFormData({ username: '', password: '' });
      setShowForm(false);
      
      toast({
        title: "Administrador cadastrado com sucesso!",
        description: `Usuário ${formData.username} foi criado`,
      });
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao cadastrar administrador",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (admin: Admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      username: admin.username
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAdmin || !editFormData.username) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      // Atualizar o administrador
      const { error: adminError } = await supabase
        .from('admins')
        .update({
          username: editFormData.username
        })
        .eq('id', editingAdmin.id);

      if (adminError) {
        console.error('Erro ao atualizar administrador:', adminError);
        toast({
          title: "Erro",
          description: "Erro ao atualizar administrador: " + adminError.message,
          variant: "destructive",
        });
        return;
      }

      await loadData();
      setShowEditModal(false);
      setEditingAdmin(null);
      
      toast({
        title: "Dados atualizados com sucesso!",
        description: `As informações do usuário ${editFormData.username} foram atualizadas`,
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar dados",
        variant: "destructive",
      });
    }
  };

  const deleteAdmin = async (adminId: string, username: string) => {
    if (!confirm(`Tem certeza que deseja remover o administrador ${username}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      // Deletar o administrador
      const { error: adminError } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (adminError) {
        console.error('Erro ao deletar administrador:', adminError);
        toast({
          title: "Erro",
          description: "Erro ao remover administrador",
          variant: "destructive",
        });
        return;
      }

      await loadData();
      toast({
        title: "Administrador removido",
        description: `O administrador ${username} foi removido do sistema`,
      });
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover administrador",
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
                  Gerenciar Administradores
                </h1>
                <p className="text-gray-600">Gerencie administradores do sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Crown className="w-3 h-3 mr-1" />
                Admin
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
            Novo Administrador
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Cadastrar Novo Administrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome de Usuário *
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Digite o nome de usuário"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha *
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Digite a senha"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    Cadastrar Administrador
                  </Button>
                  <Button type="button" onClick={() => setShowForm(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Administradores */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Administradores ({admins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando...</p>
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum administrador cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{admin.username}</h3>
                          <p className="text-sm text-gray-500">
                            Criado em: {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditClick(admin)}
                            size="sm"
                            variant="outline"
                            className="bg-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteAdmin(admin.id, admin.username)}
                            size="sm"
                            variant="outline"
                            className="bg-white text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usuários Regulares */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Usuários Regulares ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum usuário cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {user.username}
                            {user.is_admin && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome de Usuário *
              </label>
              <Input
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                placeholder="Digite o nome de usuário"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Salvar Alterações
              </Button>
              <Button type="button" onClick={() => setShowEditModal(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;