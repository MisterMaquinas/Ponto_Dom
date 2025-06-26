
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Building } from 'lucide-react';

interface MasterHeaderProps {
  userData: any;
  onLogout: () => void;
}

const MasterHeader = ({ userData, onLogout }: MasterHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              Painel Master
            </h1>
            <p className="text-gray-600">Bem-vindo, {userData.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Sistema de Gerenciamento</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Crown className="w-3 h-3 mr-1" />
              Master
            </Badge>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterHeader;
