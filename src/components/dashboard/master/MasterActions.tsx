
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Settings } from 'lucide-react';

interface MasterActionsProps {
  onAddCompany: () => void;
  onViewReports: () => void;
  onOpenSettings: () => void;
}

const MasterActions = ({ onAddCompany, onViewReports, onOpenSettings }: MasterActionsProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Ações Master</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onAddCompany}
          className="w-full justify-start h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 mr-3" />
          Cadastrar Nova Empresa
        </Button>
        <Button
          onClick={onViewReports}
          className="w-full justify-start h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          Relatórios Gerais
        </Button>
        <Button
          onClick={onOpenSettings}
          className="w-full justify-start h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
        >
          <Settings className="w-5 h-5 mr-3" />
          Configurações do Sistema
        </Button>
      </CardContent>
    </Card>
  );
};

export default MasterActions;
