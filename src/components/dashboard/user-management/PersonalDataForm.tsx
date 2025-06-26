
import React from 'react';
import { Input } from "@/components/ui/input";

interface PersonalDataFormProps {
  formData: {
    name: string;
    cpf: string;
    rg: string;
    birth_date: string;
  };
  setFormData: (data: any) => void;
}

const PersonalDataForm = ({ formData, setFormData }: PersonalDataFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Digite o nome completo"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <Input
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            placeholder="000.000.000-00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RG *
          </label>
          <Input
            value={formData.rg}
            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
            placeholder="Digite o RG"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento *
          </label>
          <Input
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalDataForm;
