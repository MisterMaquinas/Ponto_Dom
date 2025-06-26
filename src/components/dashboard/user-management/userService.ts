
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User, UserFormData } from './types';

export const loadUsers = async (companyId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Erro ao carregar usuários:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return [];
  }
};

export const createUser = async (
  formData: UserFormData, 
  companyId: string, 
  createdBy: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          company_id: companyId,
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
          created_by: createdBy
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
      return false;
    }

    toast({
      title: "Usuário criado com sucesso!",
      description: `${formData.name} foi adicionado à empresa`,
    });
    return true;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    toast({
      title: "Erro",
      description: "Erro inesperado ao cadastrar usuário",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
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
      return false;
    }

    toast({
      title: "Usuário removido",
      description: "O usuário foi removido da empresa",
    });
    return true;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return false;
  }
};
