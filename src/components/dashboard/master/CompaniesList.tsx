
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Plus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  created_at: string;
  admin_name: string;
  admin_username: string;
  employee_count: number;
  status: 'Ativa' | 'Inativa';
}

interface CompaniesListProps {
  companies: Company[];
  onAddCompany: () => void;
}

const CompaniesList = ({ companies, onAddCompany }: CompaniesListProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Empresas Cadastradas ({companies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2 text-lg">Nenhuma empresa cadastrada ainda</p>
              <p className="text-sm text-gray-400 mb-4">Comece cadastrando sua primeira empresa</p>
              <Button
                onClick={onAddCompany}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeira Empresa
              </Button>
            </div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-600">Admin: {company.admin_name} (@{company.admin_username})</p>
                    <p className="text-xs text-gray-500">
                      {company.employee_count} funcionários • Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {company.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompaniesList;
