import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Construction } from 'lucide-react';

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
    setIsLoading(true);
    try {
      // Placeholder implementation
      alert('Esta funcionalidade está sendo desenvolvida');
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
          <DialogTitle className="flex items-center gap-2">
            <Construction className="w-5 h-5" />
            Editar Empresa - {company?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-8">
          <Construction className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Em Desenvolvimento</h3>
          <p className="text-gray-500 mb-4">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </p>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;