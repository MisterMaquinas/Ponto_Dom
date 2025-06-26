
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import UserManagementHeader from './user-management/UserManagementHeader';
import UserForm from './user-management/UserForm';
import UserList from './user-management/UserList';
import { useUserManagement } from './user-management/useUserManagement';

interface UserManagementProps {
  onBack: () => void;
  userType: 'admin' | 'manager' | 'supervisor';
  onLogout: () => void;
  userData: any;
}

const UserManagement = ({ onBack, userType, onLogout, userData }: UserManagementProps) => {
  const {
    users,
    showForm,
    setShowForm,
    formData,
    setFormData,
    handleSubmit,
    deleteUser,
    getAvailableRoles,
    getRoleLabel,
    getRoleBadgeVariant
  } = useUserManagement(userType, userData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UserManagementHeader onBack={onBack} onLogout={onLogout} userData={userData} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {showForm && (
          <UserForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            availableRoles={getAvailableRoles()}
            userData={userData}
          />
        )}

        <UserList
          users={users}
          userData={userData}
          onDeleteUser={deleteUser}
          getRoleLabel={getRoleLabel}
          getRoleBadgeVariant={getRoleBadgeVariant}
        />
      </div>
    </div>
  );
};

export default UserManagement;
