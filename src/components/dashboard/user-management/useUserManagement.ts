
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  created_by: string;
  company_id: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  face_data?: string;
}

interface UserFormData {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  username: string;
  password: string;
  role: string;
  face_data?: string;
}

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
    loadUsers();
  }, [userData.companyId]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', userData.companyId);

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateRole(formData.role)) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para criar este tipo de usuário",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            company_id: userData.companyId,
            name: formData.name,
            cpf: formData.cpf,
            rg: formData.rg,
            birth_date: formData.birth_date,
            street: formData.street,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            contact: formData.contact,
            username: formData.username,
            password: formData.password,
            role: formData.role,
            face_data: formData.face_data,
            created_by: userType
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        toast({
          title: "Erro",
          description: "Erro ao cadastrar usuário: " + error.message,
          variant: "destructive",
        });
        return;
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
        role: 'user',
        face_data: undefined
      });
      setShowForm(false);
      
      toast({
        title: "Usuário criado com sucesso!",
        description: `${formData.name} foi adicionado à ${userData.companyName}`,
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao cadastrar usuário",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar usuário:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover usuário",
          variant: "destructive",
        });
        return;
      }

      await loadUsers();
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido da empresa",
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
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
