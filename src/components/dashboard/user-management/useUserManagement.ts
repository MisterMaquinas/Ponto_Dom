
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import type { User, UserFormData } from './types';
import { canCreateRole, getAvailableRoles, getRoleLabel, getRoleBadgeVariant } from './roleUtils';
import { loadUsers, createUser, deleteUser } from './userService';

export const useUserManagement = (userType: 'admin' | 'manager' | 'supervisor', userData: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    contact: '',
    username: '',
    password: '',
    role: 'user',
    face_data: undefined
  });

  useEffect(() => {
    loadUsersData();
  }, [userData.companyId]);

  const loadUsersData = async () => {
    const loadedUsers = await loadUsers(userData.companyId);
    setUsers(loadedUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateRole(userType, formData.role)) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para criar este tipo de usuário",
        variant: "destructive",
      });
      return;
    }

    const success = await createUser(formData, userData.companyId, userType);
    
    if (success) {
      await loadUsersData();
      setFormData({
        name: '',
        cpf: '',
        rg: '',
        birth_date: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        contact: '',
        username: '',
        password: '',
        role: 'user',
        face_data: undefined
      });
      setShowForm(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const success = await deleteUser(id);
    if (success) {
      await loadUsersData();
    }
  };

  return {
    users,
    showForm,
    setShowForm,
    formData,
    setFormData,
    handleSubmit,
    deleteUser: handleDeleteUser,
    getAvailableRoles: () => getAvailableRoles(userType),
    getRoleLabel,
    getRoleBadgeVariant
  };
};
