
import React from 'react';
import { Input } from "@/components/ui/input";
import { UserFormData } from './types';

interface EditUserAddressFormProps {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
}

const EditUserAddressForm = ({ formData, setFormData }: EditUserAddressFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rua *
          </label>
          <Input
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número *
          </label>
          <Input
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro *
          </label>
          <Input
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade *
          </label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <Input
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP *
          </label>
          <Input
            value={formData.zip_code}
            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default EditUserAddressForm;
