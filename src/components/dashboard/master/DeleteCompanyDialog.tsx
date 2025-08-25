import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Save, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface DeleteCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: any;
  onCompanyDeleted: () => void;
}

const DeleteCompanyDialog = ({ isOpen, onClose, company, onCompanyDeleted }: DeleteCompanyDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== company?.name) {
      toast({
        title: "Erro",
        description: "Digite o nome da empresa para confirmar a exclusão.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Deletar usuários da empresa
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .eq('company_id', company.id);

      if (usersError) throw usersError;

      // TODO: Implementar exclusão de limites quando tabela existir
      // if (limitsError) throw limitsError;

      // Deletar empresa
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

      if (companyError) throw companyError;

      toast({
        title: "Empresa excluída",
        description: `A empresa ${company.name} foi excluída com sucesso.`,
      });

      onCompanyDeleted();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir empresa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Excluir Empresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Atenção!</strong> Esta ação não pode ser desfeita. 
              Todos os dados da empresa, incluindo usuários e relatórios, serão permanentemente excluídos.
            </p>
          </div>

          <div>
            <Label htmlFor="confirmText">
              Digite <strong>{company?.name}</strong> para confirmar:
            </Label>
            <Input
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={company?.name}
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={loading || confirmText !== company?.name}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {loading ? 'Excluindo...' : 'Excluir Empresa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCompanyDialog;