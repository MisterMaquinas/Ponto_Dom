
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, UserFormData } from './types';

interface UseEditUserProps {
  user: User | null;
  onUserUpdated: () => void;
  onClose: () => void;
}

export const useEditUser = ({ user, onUserUpdated, onClose }: UseEditUserProps) => {
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
    role: '',
    face_data: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        cpf: user.cpf || '',
        rg: user.rg || '',
        birth_date: user.birth_date || '',
        street: user.street || '',
        number: user.number || '',
        neighborhood: user.neighborhood || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
        contact: user.contact || '',
        username: user.username || '',
        password: '',
        role: user.role || '',
        face_data: user.face_data || ''
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Atualizar dados do usuário
      const updateData: any = {
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
        role: formData.role,
        face_data: formData.face_data,
        updated_at: new Date().toISOString()
      };

      // Incluir senha apenas se foi alterada
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Se há dados biométricos, atualizar ou criar registro de biometria
      if (formData.face_data) {
        // Primeiro, desativar registros biométricos antigos
        await supabase
          .from('user_biometric_photos')
          .update({ is_active: false })
          .eq('user_id', user.id);

        // Criar novo registro biométrico
        const { error: bioError } = await supabase
          .from('user_biometric_photos')
          .insert({
            user_id: user.id,
            reference_photo_url: formData.face_data,
            is_active: true
          });

        if (bioError) {
          console.warn('Erro ao salvar biometria:', bioError);
        }
      }

      toast({
        title: "Usuário atualizado!",
        description: "Dados do usuário foram atualizados com sucesso",
      });

      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    handleSubmit
  };
};
