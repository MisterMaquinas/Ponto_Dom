
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, RotateCcw } from 'lucide-react';

interface PunchRecordsFiltersProps {
  dateFrom: string;
  dateTo: string;
  selectedEmployee: string;
  selectedPunchType: string;
  selectedTimeRange: string;
  loading: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onPunchTypeChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const PunchRecordsFilters = ({
  dateFrom,
  dateTo,
  selectedEmployee,
  selectedPunchType,
  selectedTimeRange,
  loading,
  onDateFromChange,
  onDateToChange,
  onEmployeeChange,
  onPunchTypeChange,
  onTimeRangeChange,
  onSearch,
  onClear
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
        <div className="space-y-4">
          {/* Filtros rápidos de tempo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Período Rápido
            </label>
            <Select value={selectedTimeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="personalizado">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Data Inicial
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                disabled={selectedTimeRange !== 'personalizado'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Data Final
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                disabled={selectedTimeRange !== 'personalizado'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Funcionário
              </label>
              <Input
                type="text"
                placeholder="Digite o nome do funcionário"
                value={selectedEmployee}
                onChange={(e) => onEmployeeChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Registro
              </label>
              <Select value={selectedPunchType} onValueChange={onPunchTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="intervalo_inicio">Início Intervalo</SelectItem>
                  <SelectItem value="intervalo_fim">Fim Intervalo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={onSearch}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              <Search className="w-4 h-4" />
              {loading ? 'Pesquisando...' : 'Pesquisar'}
            </Button>
            <Button 
              onClick={onClear}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PunchRecordsFilters;
