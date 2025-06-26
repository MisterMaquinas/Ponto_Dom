
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building } from 'lucide-react';

interface UserManagementHeaderProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const UserManagementHeader = ({ onBack, onLogout, userData }: UserManagementHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="text-gray-600">Cadastrar e gerenciar funcionários</p>
              <div className="flex items-center gap-2 mt-1">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">{userData.companyName}</span>
              </div>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline">
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;
