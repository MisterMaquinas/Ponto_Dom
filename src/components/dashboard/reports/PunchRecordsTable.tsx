
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Download, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface PunchRecord {
  id: string;
  user_id: string;
  punch_type: string;
  timestamp: string;
  confidence_score?: number;
  users: {
    name: string;
  };
}

interface PunchRecordsTableProps {
  companyId: string;
}

const PunchRecordsTable = ({ companyId }: PunchRecordsTableProps) => {
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPunchRecords();
  }, [companyId]);

  const loadPunchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('punch_records')
        .select(`
          *,
          users!inner(name, company_id)
        `)
        .eq('users.company_id', companyId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPunchRecords(data || []);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implementar funcionalidade de exportação
    console.log('Exportando registros...');
  };

  const getStatusBadge = (punchType: string, confidence?: number) => {
    const isEntry = punchType === 'entry';
    return (
      <div className="flex items-center gap-2">
        <Badge className={isEntry ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
          {isEntry ? 'Entrada' : 'Saída'}
        </Badge>
        {confidence && (
          <Badge variant="outline" className="text-xs">
            {Math.round(confidence * 100)}%
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registros de Ponto
          </CardTitle>
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Data/Hora</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Confiança</th>
                </tr>
              </thead>
              <tbody>
                {punchRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{record.users.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="font-mono text-sm">
                        {new Date(record.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(record.punch_type, record.confidence_score)}
                    </td>
                    <td className="py-3 px-4">
                      {record.confidence_score ? (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(record.confidence_score * 100)}%
                        </Badge>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
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
