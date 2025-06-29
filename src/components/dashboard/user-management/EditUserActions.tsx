
import React from 'react';
import { Button } from "@/components/ui/button";

interface EditUserActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditUserActions = ({ onSave, onCancel, isLoading }: EditUserActionsProps) => {
  return (
    <div className="flex gap-4 pt-4">
      <Button 
        type="button"
        onClick={onSave}
        className="bg-green-500 hover:bg-green-600"
        disabled={isLoading}
      >
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
      <Button 
        type="button" 
        onClick={onCancel} 
        variant="outline"
        disabled={isLoading}
      >
        Cancelar
      </Button>
    </div>
  );
};

export default EditUserActions;
