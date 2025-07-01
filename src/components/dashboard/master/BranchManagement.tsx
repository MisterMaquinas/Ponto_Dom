
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Building2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BranchManagementProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface Branch {
  id: string;
  company_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  manager_id: string | null;
  is_active: boolean;
  created_at: string;
  companies?: { name: string };
  users?: { name: string };
}

const BranchManagement = ({ onBack, onLogout, userData }: BranchManagementProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    contact: '',
    manager_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar empresas
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      setCompanies(companiesData || []);

      // Carregar gerentes
      const { data: managersData } = await supabase
        .from('users')
        .select('id, name, company_id')
        .in('role', ['admin', 'manager'])
        .order('name');
      
      setManagers(managersData || []);

      // Carregar filiais
      const { data: branchesData } = await supabase
        .from('company_branches')
        .select(`
          *,
          companies (name),
          users (name)
        `)
        .order('created_at', { ascending: false });

      setBranches(branchesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das filiais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBranch) {
        const { error } = await supabase
          .from('company_branches')
          .update({
            company_id: formData.company_id,
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            contact: formData.contact,
            manager_id: formData.manager_id || null
          })
          .eq('id', editingBranch.id);

        if (error) throw error;
        toast({ title: "Filial atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('company_branches')
          .insert([{
            company_id: formData.company_id,
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            contact: formData.contact,
            manager_id: formData.manager_id || null
          }]);

        if (error) throw error;
        toast({ title: "Filial cadastrada com sucesso!" });
      }

      await loadData();
      setShowForm(false);
      setEditingBranch(null);
      setFormData({
        company_id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        contact: '',
        manager_id: ''
      });
    } catch (error) {
      console.error('Erro ao salvar filial:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar filial",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      company_id: branch.company_id,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zip_code: branch.zip_code,
      contact: branch.contact,
      manager_id: branch.manager_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm('Tem certeza que deseja remover esta filial?')) return;

    try {
      const { error } = await supabase
        .from('company_branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;
      
      await loadData();
      toast({ title: "Filial removida com sucesso!" });
    } catch (error) {
      console.error('Erro ao deletar filial:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover filial",
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
                  <Building2 className="w-6 h-6 text-purple-600" />
                  Gerenciar Filiais
                </h1>
                <p className="text-gray-600">Cadastre e gerencie filiais das empresas</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Filial
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Filiais Cadastradas ({branches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Carregando filiais...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {branches.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2 text-lg">Nenhuma filial cadastrada</p>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-purple-500 to-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeira Filial
                    </Button>
                  </div>
                ) : (
                  branches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{branch.name}</p>
                          <p className="text-sm text-gray-600">Empresa: {branch.companies?.name}</p>
                          <p className="text-sm text-gray-600">{branch.city}, {branch.state}</p>
                          <p className="text-sm text-gray-600">Gerente: {branch.users?.name || 'Não definido'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={branch.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {branch.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDelete(branch.id)}
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Editar Filial' : 'Nova Filial'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Empresa *</label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione uma empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Filial *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Endereço *</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cidade *</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado *</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">CEP *</label>
              <Input
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Contato *</label>
              <Input
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Gerente</label>
              <select
                value={formData.manager_id}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione um gerente</option>
                {managers
                  .filter(manager => manager.company_id === formData.company_id)
                  .map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.name}</option>
                  ))}
              </select>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 flex-1">
                {editingBranch ? 'Atualizar' : 'Cadastrar'}
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingBranch(null);
                  setFormData({
                    company_id: '',
                    name: '',
                    address: '',
                    city: '',
                    state: '',
                    zip_code: '',
                    contact: '',
                    manager_id: ''
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchManagement;
