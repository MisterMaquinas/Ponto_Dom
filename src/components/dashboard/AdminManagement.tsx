
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Building, Crown } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface AdminManagementProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface Admin {
  id: string;
  companyName: string;
  adminUser: string;
  status: 'Ativa' | 'Inativa';
  employees: number;
  createdAt: string;
}

const AdminManagement = ({ onBack, onLogout, userData }: AdminManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    adminUser: '',
    adminPassword: ''
  });

  const [admins, setAdmins] = useState<Admin[]>([
    { id: 'company_1', companyName: 'Empresa Alpha', adminUser: 'Adm1', status: 'Ativa', employees: 45, createdAt: '2024-01-15' },
    { id: 'company_2', companyName: 'Empresa Beta', adminUser: 'Adm2', status: 'Ativa', employees: 32, createdAt: '2024-02-10' },
    { id: 'company_raiox', companyName: 'RaioX', adminUser: 'RaioXadm', status: 'Ativa', employees: 28, createdAt: '2024-03-05' },
    { id: 'company_3', companyName: 'TechCorp', adminUser: 'TechAdm', status: 'Inativa', employees: 25, createdAt: '2024-01-20' },
    { id: 'company_4', companyName: 'MediCenter', adminUser: 'MediAdm', status: 'Ativa', employees: 20, createdAt: '2024-02-28' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAdmin: Admin = {
      id: `company_${Date.now()}`,
      companyName: formData.companyName,
      adminUser: formData.adminUser,
      status: 'Ativa',
      employees: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAdmins([...admins, newAdmin]);
    setFormData({ companyName: '', adminUser: '', adminPassword: '' });
    setShowForm(false);
    
    toast({
      title: "Administrador criado com sucesso!",
      description: `Empresa ${formData.companyName} foi cadastrada com o admin ${formData.adminUser}`,
    });
  };

  const deleteAdmin = (id: string) => {
    setAdmins(admins.filter(admin => admin.id !== id));
    toast({
      title: "Administrador removido",
      description: "A empresa foi removida do sistema",
    });
  };

  const toggleStatus = (id: string) => {
    setAdmins(admins.map(admin => 
      admin.id === id 
        ? { ...admin, status: admin.status === 'Ativa' ? 'Inativa' : 'Ativa' }
        : admin
    ));
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
                <p className="text-gray-600">Cadastre novos clientes/empresas</p>
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
            Nova Empresa/Cliente
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
                      Nome da Empresa
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
                      Usuário Administrador
                    </label>
                    <Input
                      value={formData.adminUser}
                      onChange={(e) => setFormData({ ...formData, adminUser: e.target.value })}
                      placeholder="Ex: RaioXadm, TechAdm, etc."
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha do Administrador
                  </label>
                  <Input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    placeholder="Digite a senha para o administrador"
                    required
                  />
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
            <CardTitle>Empresas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{admin.companyName}</p>
                      <p className="text-sm text-gray-600">Admin: {admin.adminUser}</p>
                      <p className="text-xs text-gray-500">{admin.employees} funcionários • Criada em {admin.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={admin.status === 'Ativa' ? 'default' : 'secondary'}
                      className={admin.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {admin.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => toggleStatus(admin.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteAdmin(admin.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminManagement;
