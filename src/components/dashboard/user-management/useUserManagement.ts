
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  createdBy: string;
  companyId: number;
}

interface UserFormData {
  name: string;
  username: string;
  password: string;
  role: string;
}

export const useUserManagement = (userType: 'admin' | 'manager' | 'supervisor', userData: any) => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'João Silva', username: 'joao.silva', role: 'user', createdBy: 'admin', companyId: userData.companyId },
    { id: 2, name: 'Maria Santos', username: 'maria.santos', role: 'supervisor', createdBy: 'admin', companyId: userData.companyId },
    { id: 3, name: 'Pedro Costa', username: 'pedro.costa', role: 'manager', createdBy: 'admin', companyId: userData.companyId },
    { id: 4, name: 'Ana Oliveira', username: 'ana.oliveira', role: 'user', createdBy: 'supervisor', companyId: userData.companyId },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: '',
    password: '',
    role: 'user'
  });

  const canCreateRole = (role: string) => {
    if (userType === 'admin') return true;
    if (userType === 'manager') return ['supervisor', 'user'].includes(role);
    if (userType === 'supervisor') return role === 'user';
    return false;
  };

  const getAvailableRoles = () => {
    if (userType === 'admin') return [
      { value: 'manager', label: 'Gerente' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'user', label: 'Funcionário' }
    ];
    if (userType === 'manager') return [
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'user', label: 'Funcionário' }
    ];
    return [{ value: 'user', label: 'Funcionário' }];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateRole(formData.role)) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para criar este tipo de usuário",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: users.length + 1,
      ...formData,
      createdBy: userType,
      companyId: userData.companyId
    };

    setUsers([...users, newUser]);
    setFormData({ name: '', username: '', password: '', role: 'user' });
    setShowForm(false);
    
    toast({
      title: "Usuário criado com sucesso!",
      description: `${formData.name} foi adicionado à ${userData.companyName}`,
    });
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido da empresa",
    });
  };

  const getRoleLabel = (role: string) => {
    const roleMap = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'supervisor': 'Supervisor',
      'user': 'Funcionário'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variantMap = {
      'admin': 'bg-purple-100 text-purple-800',
      'manager': 'bg-blue-100 text-blue-800',
      'supervisor': 'bg-orange-100 text-orange-800',
      'user': 'bg-green-100 text-green-800'
    };
    return variantMap[role as keyof typeof variantMap] || 'bg-gray-100 text-gray-800';
  };

  return {
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
  };
};
