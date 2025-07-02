
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Eye, Edit, Plus, BarChart3, Trash2 } from 'lucide-react';
import { useMasterData } from './useMasterData';
import CompanyDetails from './CompanyDetails';
import EditCompanyDialog from './EditCompanyDialog';
import AddCompanyDialog from './AddCompanyDialog';
import DeleteCompanyDialog from './DeleteCompanyDialog';
import SystemReports from './SystemReports';

interface CompanyManagementProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const CompanyManagement = ({ onBack, onLogout, userData }: CompanyManagementProps) => {
  const { companies, loading, loadData } = useMasterData();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<any>(null);
  const [showReports, setShowReports] = useState(false);

  if (showDetails && selectedCompany) {
    return (
      <CompanyDetails 
        company={selectedCompany} 
        onBack={() => setShowDetails(false)} 
        onLogout={onLogout} 
        userData={userData} 
      />
    );
  }

  if (showReports) {
    return (
      <SystemReports 
        onBack={() => setShowReports(false)} 
        onLogout={onLogout} 
        userData={userData} 
      />
    );
  }

  const handleViewDetails = (company: any) => {
    setSelectedCompany(company);
    setShowDetails(true);
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
  };

  const handleAddCompany = () => {
    setShowAddDialog(true);
  };

  const handleCompanyAdded = () => {
    setShowAddDialog(false);
    loadData(); // Recarregar dados em vez de reload da página
  };

  const handleDeleteCompany = (company: any) => {
    setDeletingCompany(company);
  };

  const handleCompanyDeleted = () => {
    setDeletingCompany(null);
    loadData(); // Recarregar dados em vez de reload da página
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
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h1>
                <p className="text-gray-600">Administre todas as empresas do sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowReports(true)} variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
              <Button onClick={handleAddCompany} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Nova Empresa
              </Button>
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
            <div className="text-gray-500">Carregando empresas...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {new Date(company.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Ativa
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>Admin:</strong> {company.admin_name}</p>
                    <p className="text-sm"><strong>Usuário:</strong> @{company.admin_username}</p>
                    <p className="text-sm"><strong>Funcionários:</strong> {company.employee_count}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewDetails(company)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                    <Button
                      onClick={() => handleEditCompany(company)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCompany(company)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          isOpen={!!editingCompany}
          onClose={() => setEditingCompany(null)}
          onCompanyUpdated={() => {
            setEditingCompany(null);
            loadData(); // Recarregar dados em vez de reload da página
          }}
        />
      )}

      <AddCompanyDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onCompanyAdded={handleCompanyAdded}
      />

      <DeleteCompanyDialog
        isOpen={!!deletingCompany}
        onClose={() => setDeletingCompany(null)}
        company={deletingCompany}
        onCompanyDeleted={handleCompanyDeleted}
      />
    </div>
  );
};

export default CompanyManagement;
