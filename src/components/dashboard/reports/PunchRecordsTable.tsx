
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Download } from 'lucide-react';

interface PunchRecord {
  id: string;
  user_id: string;
  name: string;
  date: string;
  entry_time: string;
  exit_time?: string;
  status: 'complete' | 'incomplete' | 'late';
  confidence_score?: number;
}

interface PunchRecordsTableProps {
  punchRecords: PunchRecord[];
  loading: boolean;
  onExport: () => void;
}

const PunchRecordsTable = ({ punchRecords, loading, onExport }: PunchRecordsTableProps) => {
  const getStatusBadge = (status: string, confidence?: number) => {
    switch (status) {
      case 'complete':
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Completo</Badge>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        );
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Atraso</Badge>;
      case 'incomplete':
        return <Badge className="bg-red-100 text-red-800">Incompleto</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registros de Ponto
          </CardTitle>
          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando registros...</p>
          </div>
        ) : punchRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum registro de ponto encontrado.</p>
            <p className="text-sm text-gray-400 mt-2">
              Os registros aparecerão aqui quando os funcionários começarem a bater ponto.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Funcionário</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Entrada</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Saída</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {punchRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {record.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{record.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(record.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-mono">{record.entry_time}</td>
                    <td className="py-3 px-4 text-gray-900 font-mono">{record.exit_time || '--:--'}</td>
                    <td className="py-3 px-4">{getStatusBadge(record.status, record.confidence_score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PunchRecordsTable;
