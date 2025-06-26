
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAvailableRoles, getRoleLabel, getRoleBadgeVariant } from './roleUtils';
import { filterUsersByHierarchy, UserRole } from './hierarchyUtils';
import type { User, FormData } from './types';

export const useUserManagement = (userType: 'admin' | 'manager' | 'supervisor', userData: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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
    role: ''
  });

  useEffect(() => {
    loadUsers();
  }, [userData.companyId]);

  useEffect(() => {
    // Aplicar filtro de hierarquia sempre que os usuários mudarem
    const filtered = filterUsersByHierarchy(users, userType as UserRole);
    setFilteredUsers(filtered);
  }, [users, userType]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', userData.companyId)
        .order('name');

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            ...formData,
            company_id: userData.companyId,
            created_by: userData.username
          }
        ]);

      if (error) {
        throw error;
      }

      await loadUsers();
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
        role: ''
      });
      setShowForm(false);
      
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: `${formData.name} foi adicionado ao sistema`,
      });
    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error);
      toast({
        title: "Erro ao cadastrar usuário",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      await loadUsers();
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido do sistema",
      });
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover usuário",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    filteredUsers,
    showForm,
    setShowForm,
    formData,
    setFormData,
    handleSubmit,
    deleteUser,
    getAvailableRoles: () => getAvailableRoles(userType as UserRole),
    getRoleLabel,
    getRoleBadgeVariant
  };
};
