
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useUserLimits } from "@/hooks/useUserLimits";
import PersonalDataForm from './PersonalDataForm';
import AddressForm from './AddressForm';
import AccessDataForm from './AccessDataForm';
import BiometricCapture from './BiometricCapture';
import CompanyLimitsInfo from './CompanyLimitsInfo';

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

interface UserFormProps {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  availableRoles: { value: string; label: string }[];
  userData: any;
}

const UserForm = ({ formData, setFormData, onSubmit, onCancel, availableRoles, userData }: UserFormProps) => {
  const { 
    canCreateUser, 
    getLimitMessage, 
    loading: limitsLoading 
  } = useUserLimits(userData.companyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateUser(formData.role)) {
      toast({
        title: "Limite atingido",
        description: `Não é possível cadastrar mais usuários do tipo ${formData.role}. Limite da empresa atingido.`,
        variant: "destructive",
      });
      return;
    }

    onSubmit(e);
  };

  return (
    <Card className="mb-8 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Cadastrar Novo Usuário - {userData.companyName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CompanyLimitsInfo 
          availableRoles={availableRoles}
          canCreateUser={canCreateUser}
          getLimitMessage={getLimitMessage}
          limitsLoading={limitsLoading}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalDataForm 
            formData={formData}
            setFormData={setFormData}
          />

          <AddressForm 
            formData={formData}
            setFormData={setFormData}
          />

          <AccessDataForm 
            formData={formData}
            setFormData={setFormData}
            availableRoles={availableRoles}
            canCreateUser={canCreateUser}
            getLimitMessage={getLimitMessage}
            limitsLoading={limitsLoading}
          />

          <BiometricCapture 
            formData={formData}
            setFormData={setFormData}
          />

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="bg-green-500 hover:bg-green-600"
              disabled={formData.role && !canCreateUser(formData.role)}
            >
              Cadastrar Usuário
            </Button>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
