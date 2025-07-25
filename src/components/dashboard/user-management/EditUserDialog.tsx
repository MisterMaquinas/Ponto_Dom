
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import BiometricCapture from './BiometricCapture';
import EditUserHeader from './EditUserHeader';
import EditUserPersonalForm from './EditUserPersonalForm';
import EditUserAddressForm from './EditUserAddressForm';
import EditUserAccessForm from './EditUserAccessForm';
import EditUserActions from './EditUserActions';
import { useEditUser } from './useEditUser';
import { User } from './types';

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

const EditUserDialog = ({ user, isOpen, onClose, onUserUpdated }: EditUserDialogProps) => {
  const { formData, setFormData, isLoading, handleSubmit } = useEditUser({
    user,
    onUserUpdated,
    onClose
  });

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <EditUserHeader userName={user.name} />

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          <EditUserPersonalForm formData={formData} setFormData={setFormData} />
          <EditUserAddressForm formData={formData} setFormData={setFormData} />
          <EditUserAccessForm formData={formData} setFormData={setFormData} />
          
          <div className="space-y-4">
            <BiometricCapture 
              formData={formData}
              setFormData={setFormData}
            />
          </div>

          <EditUserActions 
            onSave={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
