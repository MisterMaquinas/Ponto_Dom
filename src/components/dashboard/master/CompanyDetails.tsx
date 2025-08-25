
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Users, UserPlus, MapPin, Plus, Edit } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import EditCompanyDialog from './EditCompanyDialog';

interface CompanyDetailsProps {
  company: any;
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const CompanyDetails = ({ company, onBack, onLogout, userData }: CompanyDetailsProps) => {
  const [companyStats, setCompanyStats] = useState({
    totalUsers: 0,
    admins: 0,
    managers: 0,
    supervisors: 0,
    employees: 0,
    branches: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    loadCompanyDetails();
  }, [company.id]);

  const loadCompanyDetails = async () => {
    try {
      // Carregar usuários da empresa (removendo role que não existe)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('company_id', company.id);

      if (usersError) throw usersError;

      // Contar por função (usando is_admin por enquanto, pois não temos campo role)
      const stats = {
        totalUsers: users?.length || 0,
        admins: users?.filter(u => u.is_admin).length || 0,
        managers: 0, // TODO: Implementar sistema de roles adequado
        supervisors: 0, // TODO: Implementar sistema de roles adequado  
        employees: users?.filter(u => !u.is_admin).length || 0,
        branches: 1 // Por enquanto assumindo 1 filial, pode ser expandido
      };

      setCompanyStats(stats);
    } catch (error) {
      console.error('Erro ao carregar detalhes da empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total de Usuários', value: companyStats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Administradores', value: companyStats.admins, icon: Users, color: 'from-purple-500 to-purple-600' },
    { title: 'Gerentes', value: companyStats.managers, icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Supervisores', value: companyStats.supervisors, icon: Users, color: 'from-orange-500 to-orange-600' },
    { title: 'Funcionários', value: companyStats.employees, icon: Users, color: 'from-gray-500 to-gray-600' },
    { title: 'Filiais', value: companyStats.branches, icon: MapPin, color: 'from-red-500 to-red-600' },
  ];

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
                  <Building className="w-6 h-6 text-purple-600" />
                  {company.name}
                </h1>
                <p className="text-gray-600">Detalhes da empresa e gerenciamento</p>
                <p className="text-sm text-gray-500">
                  Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                Ativa
              </Badge>
              <Button onClick={onLogout} variant="outline">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando detalhes...</div>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Informações da Empresa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome da Empresa</label>
                    <p className="text-gray-900 font-medium">{company.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Administrador Principal</label>
                    <p className="text-gray-900">{company.admin_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Usuário do Administrador</label>
                    <p className="text-gray-900">@{company.admin_username}</p>
                  </div>
                  <Button 
                    onClick={() => setIsEditDialogOpen(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Empresa
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Ações de Gerenciamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                    <MapPin className="w-5 h-5 mr-3" />
                    Cadastrar Filial
                  </Button>
                  <Button className="w-full justify-start h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <UserPlus className="w-5 h-5 mr-3" />
                    Cadastrar Supervisor
                  </Button>
                  <Button className="w-full justify-start h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                    <Users className="w-5 h-5 mr-3" />
                    Cadastrar Usuário
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <EditCompanyDialog
        company={company}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onCompanyUpdated={loadCompanyDetails}
      />
    </div>
  );
};

export default CompanyDetails;
