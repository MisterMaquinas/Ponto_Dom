
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface EditCompanyDialogProps {
  company: any;
  isOpen: boolean;
  onClose: () => void;
  onCompanyUpdated: () => void;
}

const EditCompanyDialog = ({ company, isOpen, onClose, onCompanyUpdated }: EditCompanyDialogProps) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    adminName: company?.admin_name || '',
    adminUsername: company?.admin_username || '',
    adminPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Atualizar nome da empresa
      const { error: companyError } = await supabase
        .from('companies')
        .update({ name: formData.name })
        .eq('id', company.id);

      if (companyError) throw companyError;

      // Atualizar dados do administrador
      const updateData: any = {
        name: formData.adminName,
        username: formData.adminUsername
      };

      // Só atualizar senha se foi fornecida
      if (formData.adminPassword.trim()) {
        updateData.password = formData.adminPassword;
      }

      const { error: adminError } = await supabase
        .from('users')
        .update(updateData)
        .eq('company_id', company.id)
        .eq('role', 'admin');

      if (adminError) throw adminError;

      onCompanyUpdated();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      alert('Erro ao atualizar empresa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Empresa - {company?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da empresa"
            />
          </div>
          
          <div>
            <Label htmlFor="adminName">Nome do Administrador</Label>
            <Input
              id="adminName"
              value={formData.adminName}
              onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
              placeholder="Nome completo"
            />
          </div>
          
          <div>
            <Label htmlFor="adminUsername">Login do Administrador</Label>
            <Input
              id="adminUsername"
              value={formData.adminUsername}
              onChange={(e) => setFormData(prev => ({ ...prev, adminUsername: e.target.value }))}
              placeholder="Nome de usuário"
            />
          </div>
          
          <div>
            <Label htmlFor="adminPassword">Nova Senha (opcional)</Label>
            <Input
              id="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
              placeholder="Deixe em branco para manter a atual"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;
