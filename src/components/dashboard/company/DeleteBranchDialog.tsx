import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteBranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  branch: any;
  onBranchDeleted: () => void;
}

const DeleteBranchDialog = ({ isOpen, onClose, branch, onBranchDeleted }: DeleteBranchDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!branch) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branch.id);

      if (error) throw error;

      toast({
        title: "Filial excluída com sucesso!",
        description: `A filial ${branch.name} foi excluída permanentemente.`,
      });

      onBranchDeleted();
    } catch (error: any) {
      console.error('Erro ao excluir filial:', error);
      toast({
        title: "Erro ao excluir filial",
        description: error.message || "Ocorreu um erro ao excluir a filial",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a filial "{branch?.name}"? 
            Esta ação não pode ser desfeita e todos os funcionários e dados relacionados serão perdidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Excluindo...' : 'Excluir Filial'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBranchDialog;