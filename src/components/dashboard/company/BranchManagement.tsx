import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Eye, Edit, Plus, Users, Trash2 } from 'lucide-react';
import { useCompanyData } from './useCompanyData';
import AddBranchDialog from './AddBranchDialog';
import EditBranchDialog from './EditBranchDialog';
import DeleteBranchDialog from './DeleteBranchDialog';

interface BranchManagementProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const BranchManagement = ({ onBack, onLogout, userData }: BranchManagementProps) => {
  const { branches, loading, loadData } = useCompanyData(userData.companyId);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<any>(null);

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
  };

  const handleAddBranch = () => {
    setShowAddDialog(true);
  };

  const handleBranchAdded = () => {
    setShowAddDialog(false);
    loadData();
  };

  const handleDeleteBranch = (branch: any) => {
    setDeletingBranch(branch);
  };

  const handleBranchDeleted = () => {
    setDeletingBranch(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Filiais</h1>
                <p className="text-gray-600">Administre todas as filiais da {userData.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleAddBranch} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Nova Filial
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
            <div className="text-gray-500">Carregando filiais...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <Card key={branch.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{branch.name}</CardTitle>
                        <p className="text-sm text-gray-500">{branch.city}, {branch.state}</p>
                      </div>
                    </div>
                    <Badge className={branch.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {branch.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>Endereço:</strong> {branch.address}</p>
                    <p className="text-sm"><strong>Contato:</strong> {branch.contact}</p>
                    <p className="text-sm"><strong>Funcionários:</strong> {branch.employee_count || 0}</p>
                    {branch.manager_username && (
                      <p className="text-sm"><strong>Login:</strong> @{branch.manager_username}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditBranch(branch)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteBranch(branch)}
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

      {editingBranch && (
        <EditBranchDialog
          branch={editingBranch}
          isOpen={!!editingBranch}
          onClose={() => setEditingBranch(null)}
          onBranchUpdated={() => {
            setEditingBranch(null);
            loadData();
          }}
        />
      )}

      <AddBranchDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onBranchAdded={handleBranchAdded}
        companyId={userData.companyId}
      />

      <DeleteBranchDialog
        isOpen={!!deletingBranch}
        onClose={() => setDeletingBranch(null)}
        branch={deletingBranch}
        onBranchDeleted={handleBranchDeleted}
      />
    </div>
  );
};

export default BranchManagement;