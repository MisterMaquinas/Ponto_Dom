
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface VerificationLog {
  id: string;
  user_id: string;
  attempt_photo_url: string;
  reference_photo_url: string;
  similarity_score: number;
  verification_result: 'success' | 'failed' | 'error';
  error_message?: string;
  created_at: string;
  users: {
    name: string;
  };
}

interface BiometricVerificationTableProps {
  companyId: string;
}

const BiometricVerificationTable = ({ companyId }: BiometricVerificationTableProps) => {
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<VerificationLog | null>(null);

  useEffect(() => {
    loadVerificationLogs();
  }, [companyId]);

  const loadVerificationLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('biometric_verification_logs')
        .select(`
          *,
          users!inner(name, company_id)
        `)
        .eq('users.company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setVerificationLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (result: string, score?: number) => {
    switch (result) {
      case 'success':
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sucesso
            </Badge>
            {score && (
              <Badge variant="outline" className="text-xs">
                {Math.round(score * 100)}%
              </Badge>
            )}
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Falhou
            </Badge>
            {score && (
              <Badge variant="outline" className="text-xs">
                {Math.round(score * 100)}%
              </Badge>
            )}
          </div>
        );
      case 'error':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Verificações Biométricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando verificações...</p>
            </div>
          ) : verificationLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma verificação encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Usuário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fotos</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{log.users.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <div>
                            <div className="font-mono text-sm">
                              {new Date(log.created_at).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="font-mono text-xs text-gray-500">
                              {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(log.verification_result, log.similarity_score)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Fotos
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para visualizar fotos */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Verificação Biométrica - {selectedLog?.users.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Foto de Referência</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedLog.reference_photo_url}
                      alt="Foto de referência"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <Badge variant="outline" className="w-fit">Cadastrada</Badge>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Tentativa de Verificação</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedLog.attempt_photo_url}
                      alt="Tentativa de verificação"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  {getStatusBadge(selectedLog.verification_result, selectedLog.similarity_score)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Detalhes da Verificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data/Hora:</span>
                    <p className="font-medium">
                      {new Date(selectedLog.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Similaridade:</span>
                    <p className="font-medium">
                      {selectedLog.similarity_score 
                        ? `${Math.round(selectedLog.similarity_score * 100)}%`
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Resultado:</span>
                    <p className="font-medium capitalize">{selectedLog.verification_result}</p>
                  </div>
                </div>
                
                {selectedLog.error_message && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <span className="text-red-600 text-sm font-medium">Erro:</span>
                    <p className="text-red-700 text-sm">{selectedLog.error_message}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BiometricVerificationTable;
