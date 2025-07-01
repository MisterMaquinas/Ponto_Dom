
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
    // Log da criação do usuário
    await supabase.rpc('log_system_action', {
      p_action: 'create',
      p_entity_type: 'user',
      p_user_id: null,
      p_master_user_id: null,
      p_entity_id: null,
      p_details: {
        user_name: formData.name,
        user_role: formData.role,
        company_id: companyId,
        created_by: createdBy
      }
    });

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

    // Log adicional após criação bem-sucedida
    if (data && data[0]) {
      await supabase.rpc('log_system_action', {
        p_action: 'user_created_success',
        p_entity_type: 'user',
        p_user_id: null,
        p_master_user_id: null,
        p_entity_id: data[0].id,
        p_details: {
          user_id: data[0].id,
          user_name: formData.name,
          user_role: formData.role
        }
      });
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
    // Buscar dados do usuário antes de deletar para o log
    const { data: userData } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', id)
      .single();

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

    // Log da exclusão
    await supabase.rpc('log_system_action', {
      p_action: 'delete',
      p_entity_type: 'user',
      p_user_id: null,
      p_master_user_id: null,
      p_entity_id: id,
      p_details: {
        deleted_user_name: userData?.name || 'Unknown',
        deleted_user_role: userData?.role || 'Unknown'
      }
    });

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
