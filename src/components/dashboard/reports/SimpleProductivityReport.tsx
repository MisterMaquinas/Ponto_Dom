import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from 'lucide-react';

interface SimpleProductivityReportProps {
  branchId?: string;
  companyId?: string;
}

const SimpleProductivityReport = ({ branchId, companyId }: SimpleProductivityReportProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="w-5 h-5" />
          Relatório de Produtividade Simples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Construction className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Em Desenvolvimento</h3>
          <p className="text-gray-500">
            Este relatório está sendo desenvolvido e estará disponível em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleProductivityReport;