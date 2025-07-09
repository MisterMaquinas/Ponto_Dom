import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, User, CheckCircle, LogOut } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FacialBiometricCapture from '../FacialBiometricCapture';
import ReceiptActions from '../ReceiptActions';
import LiveFaceRecognition from './LiveFaceRecognition';

interface EmployeePunchSystemProps {
  branchData: any;
  onLogout: () => void;
}

const EmployeePunchSystem = ({ branchData, onLogout }: EmployeePunchSystemProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showLiveRecognition, setShowLiveRecognition] = useState(false);
  const [lastPunchRecord, setLastPunchRecord] = useState<any>(null);
  const [recognizedEmployee, setRecognizedEmployee] = useState<any>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Escutar eventos de registro de ponto do sistema ao vivo
  React.useEffect(() => {
    const handlePunchRegistered = (event: any) => {
      setLastPunchRecord(event.detail);
    };

    window.addEventListener('punchRegistered', handlePunchRegistered);
    return () => {
      window.removeEventListener('punchRegistered', handlePunchRegistered);
    };
  }, []);

  const simulateEmployeeRecognition = async (imageData: string) => {
    // Simular reconhecimento facial - buscar um funcionário aleatório da filial
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchData.id)
        .eq('is_active', true)
        .limit(1);

      if (error || !employees || employees.length === 0) {
        return null;
      }

      // Simular confiança de reconhecimento
      const confidence = Math.random() * 0.3 + 0.7; // Entre 70% e 100%
      
      return {
        employee: employees[0],
        confidence,
        imageData
      };
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return null;
    }
  };

  const handleFacialCapture = async (imageData: string) => {
    setShowCamera(false);
    
    // Simular processo de reconhecimento
    toast({
      title: "Processando...",
      description: "Analisando biometria facial...",
    });

    setTimeout(async () => {
      const recognition = await simulateEmployeeRecognition(imageData);
      
      if (!recognition) {
        toast({
          title: "Funcionário não reconhecido",
          description: "Não foi possível identificar o funcionário. Verifique se está cadastrado.",
          variant: "destructive",
        });
        return;
      }

      if (recognition.confidence < 0.75) {
        toast({
          title: "Confiança baixa",
          description: "Qualidade da biometria insuficiente. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setRecognizedEmployee(recognition);
      setAwaitingConfirmation(true);
    }, 2000);
  };

  const confirmPunch = async () => {
    if (!recognizedEmployee) return;

    try {
      // Registro simples de ponto
      const punchType = 'punch';

      // Registrar ponto
      const { data: punchRecord, error } = await supabase
        .from('employee_punch_records')
        .insert([
          {
            employee_id: recognizedEmployee.employee.id,
            branch_id: branchData.id,
            punch_type: punchType,
            face_confidence: recognizedEmployee.confidence,
            photo_url: recognizedEmployee.imageData,
            confirmed_by_employee: true,
            device_info: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const punchData = {
        name: recognizedEmployee.employee.name,
        position: recognizedEmployee.employee.position,
        timestamp: new Date().toISOString(),
        type: punchType,
        branch: branchData.name,
        confidence: Math.round(recognizedEmployee.confidence * 100),
        hash: `${recognizedEmployee.employee.id}-${Date.now()}`
      };

      setLastPunchRecord(punchData);
      setRecognizedEmployee(null);
      setAwaitingConfirmation(false);

      toast({
        title: "Ponto registrado!",
        description: "Ponto registrado com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao registrar ponto:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar ponto",
        variant: "destructive",
      });
    }
  };

  const cancelRecognition = () => {
    setRecognizedEmployee(null);
    setAwaitingConfirmation(false);
  };

  if (awaitingConfirmation && recognizedEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle>Funcionário Reconhecido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <img 
                src={recognizedEmployee.imageData} 
                alt="Foto capturada" 
                className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-green-500"
              />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">{recognizedEmployee.employee.name}</h3>
              <Badge variant="outline">{recognizedEmployee.employee.position}</Badge>
              <p className="text-sm text-gray-600">
                Confiança: {Math.round(recognizedEmployee.confidence * 100)}%
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-center text-gray-700">
                É você mesmo? Confirme para registrar o ponto.
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={confirmPunch}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sim, sou eu - Registrar Ponto
                </Button>
                
                <Button
                  onClick={cancelRecognition}
                  variant="outline"
                  className="w-full"
                >
                  Não sou eu - Tentar Novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showLiveRecognition) {
    return (
      <LiveFaceRecognition
        branchData={branchData}
        onBack={() => setShowLiveRecognition(false)}
      />
    );
  }

  if (showCamera) {
    return (
      <FacialBiometricCapture
        onCapture={handleFacialCapture}
        onCancel={() => setShowCamera(false)}
        title="Reconhecimento Facial"
        mode="verify"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Ponto</h1>
              <p className="text-gray-600">{branchData.name} - {branchData.companies?.name}</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {new Date().toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </h2>
          <p className="text-lg text-gray-600">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Registro de Ponto por Biometria
                </h3>
                <p className="text-gray-600 text-sm">
                  Posicione seu rosto na câmera para registrar o ponto
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => setShowLiveRecognition(true)}
                  className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  Sistema Ao Vivo
                </Button>
                
                <Button
                  onClick={() => setShowCamera(true)}
                  variant="outline"
                  className="w-full h-12 border-2"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Registro Manual
                </Button>
              </div>

              {lastPunchRecord && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Último registro</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-green-700">
                      <strong>{lastPunchRecord.name}</strong> - {lastPunchRecord.position}
                    </p>
                    <p className="text-green-700">
                      Ponto registrado em: {new Date(lastPunchRecord.timestamp).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-green-600">
                      Confiança: {lastPunchRecord.confidence}%
                    </p>
                  </div>
                  <div className="mt-3">
                    <ReceiptActions punchData={{
                      name: lastPunchRecord.name,
                      timestamp: lastPunchRecord.timestamp,
                      hash: lastPunchRecord.hash,
                      position: lastPunchRecord.position,
                      branch: lastPunchRecord.branch,
                      confidence: lastPunchRecord.confidence
                    }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeePunchSystem;