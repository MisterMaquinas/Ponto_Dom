
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from 'lucide-react';

interface PunchRecordsFiltersProps {
  dateFrom: string;
  dateTo: string;
  selectedEmployee: string;
  loading: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onSearch: () => void;
}

const PunchRecordsFilters = ({
  dateFrom,
  dateTo,
  selectedEmployee,
  loading,
  onDateFromChange,
  onDateToChange,
  onEmployeeChange,
  onSearch
}: PunchRecordsFiltersProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros de Pesquisa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funcionário
            </label>
            <Input
              type="text"
              placeholder="Digite o nome"
              value={selectedEmployee}
              onChange={(e) => onEmployeeChange(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={onSearch}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Pesquisar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PunchRecordsFilters;
