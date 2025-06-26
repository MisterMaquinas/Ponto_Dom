
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AccessDataFormProps {
  formData: {
    username: string;
    password: string;
    role: string;
  };
  setFormData: (data: any) => void;
  availableRoles: { value: string; label: string }[];
  canCreateUser: (role: string) => boolean;
  getLimitMessage: (role: string) => string;
  limitsLoading: boolean;
}

const AccessDataForm = ({ 
  formData, 
  setFormData, 
  availableRoles, 
  canCreateUser, 
  getLimitMessage, 
  limitsLoading 
}: AccessDataFormProps) => {
  const availableRolesWithLimits = availableRoles.filter(role => 
    canCreateUser(role.value) || limitsLoading
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Dados de Acesso</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome de Usuário *
          </label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Digite o usuário"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha *
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Digite a senha"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cargo *
          </label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              {availableRolesWithLimits.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{role.label}</span>
                    {!limitsLoading && (
                      <Badge 
                        variant={canCreateUser(role.value) ? "default" : "destructive"}
                        className="ml-2 text-xs"
                      >
                        {getLimitMessage(role.value).split('(')[1]?.replace(')', '') || ''}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.role && !canCreateUser(formData.role) && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ Limite atingido para este cargo
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDataForm;
