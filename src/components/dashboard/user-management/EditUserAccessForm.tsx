
import React from 'react';
import { Input } from "@/components/ui/input";
import { UserFormData } from './types';

interface EditUserAccessFormProps {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
}

const EditUserAccessForm = ({ formData, setFormData }: EditUserAccessFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Dados de Acesso</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome de Usuário *
          </label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nova Senha (deixe em branco para manter a atual)
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Digite nova senha ou deixe em branco"
          />
        </div>
      </div>
    </div>
  );
};

export default EditUserAccessForm;
