import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Check, X, Settings, RotateCcw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LiveFaceRecognitionProps {
  branchData: any;
  onBack: () => void;
}

interface RecognitionResult {
  employee: any;
  confidence: number;
  status: 'success' | 'failed' | 'processing';
}

const LiveFaceRecognition = ({ branchData, onBack }: LiveFaceRecognitionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    loadEmployees();
    return () => {
      stopRecognition();
    };
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchData.id)
        .eq('is_active', true);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar funcionários da filial",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const simulateRecognition = async (imageData: string): Promise<RecognitionResult> => {
    // Simular processo de reconhecimento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (employees.length === 0) {
      return {
        employee: null,
        confidence: 0,
        status: 'failed'
      };
    }
    
    // Simular reconhecimento com confiança aleatória
    const confidence = Math.random() * 0.4 + 0.6; // 60% a 100%
    
    if (confidence > 0.75) {
      // Sucesso - escolher funcionário aleatório
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      return {
        employee: randomEmployee,
        confidence,
        status: 'success'
      };
    } else {
      return {
        employee: null,
        confidence,
        status: 'failed'
      };
    }
  };

  const processRecognition = async () => {
    if (processing) return;
    
    const imageData = captureFrame();
    if (!imageData) return;
    
    setProcessing(true);
    setResult({ employee: null, confidence: 0, status: 'processing' });
    
    try {
      const recognition = await simulateRecognition(imageData);
      setResult(recognition);
      
      if (recognition.status === 'success' && recognition.employee) {
        // Registrar ponto
        await registerPunch(recognition.employee, recognition.confidence, imageData);
        
        // Mostrar resultado por 3 segundos
        setTimeout(() => {
          setResult(null);
        }, 3000);
      } else {
        // Mostrar falha por 2 segundos
        setTimeout(() => {
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no reconhecimento:', error);
      setResult({ employee: null, confidence: 0, status: 'failed' });
      setTimeout(() => setResult(null), 2000);
    }
    
    setProcessing(false);
  };

  const registerPunch = async (employee: any, confidence: number, imageData: string) => {
    try {
      // Determinar tipo de ponto
      const { data: lastRecord } = await supabase
        .from('employee_punch_records')
        .select('punch_type')
        .eq('employee_id', employee.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      const punchType = (!lastRecord || lastRecord.punch_type === 'exit') ? 'entry' : 'exit';

      const { error } = await supabase
        .from('employee_punch_records')
        .insert([
          {
            employee_id: employee.id,
            branch_id: branchData.id,
            punch_type: punchType,
            face_confidence: confidence,
            photo_url: imageData,
            confirmed_by_employee: true,
            device_info: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          }
        ]);

      if (error) throw error;

      toast({
        title: "Ponto registrado!",
        description: `${punchType === 'entry' ? 'Entrada' : 'Saída'} de ${employee.name}`,
      });
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar ponto",
        variant: "destructive",
      });
    }
  };

  const startRecognition = async () => {
    await startCamera();
    setIsActive(true);
    
    // Processar reconhecimento a cada 3 segundos
    intervalRef.current = setInterval(() => {
      if (!processing) {
        processRecognition();
      }
    }, 3000);
  };

  const stopRecognition = () => {
    setIsActive(false);
    stopCamera();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setResult(null);
    setProcessing(false);
  };

  const resetBranchCode = () => {
    localStorage.removeItem('branch_code');
    toast({
      title: "Código resetado",
      description: "O código da filial foi removido do dispositivo",
    });
    onBack();
  };

  const getStatusColor = () => {
    if (!result) return 'bg-gray-500';
    switch (result.status) {
      case 'success': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case 'success': return <Check className="w-8 h-8 text-white" />;
      case 'failed': return <X className="w-8 h-8 text-white" />;
      case 'processing': return <Camera className="w-8 h-8 text-white animate-pulse" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold">Sistema de Ponto - Reconhecimento Facial</h1>
              <p className="text-white/70">{branchData.name}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetBranchCode} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar Código
              </Button>
              <Button onClick={onBack} variant="outline">
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera View */}
          <Card className="border-0 shadow-2xl bg-black/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover rounded-lg bg-gray-900"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Status Indicator */}
                <div className={`absolute top-4 right-4 w-16 h-16 rounded-full ${getStatusColor()} flex items-center justify-center transition-all duration-300`}>
                  {getStatusIcon()}
                </div>
                
                {/* Processing Overlay */}
                {result?.status === 'processing' && (
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <div className="text-white text-lg font-semibold animate-pulse">
                      Analisando...
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {!isActive ? (
                  <Button
                    onClick={startRecognition}
                    className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Iniciar Reconhecimento
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecognition}
                    className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium text-lg"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Parar Reconhecimento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <Card className="border-0 shadow-2xl bg-black/50 backdrop-blur-sm">
            <CardContent className="p-6 text-white">
              <h3 className="text-xl font-bold mb-6">Status do Sistema</h3>
              
              <div className="space-y-6">
                {/* Current Result */}
                {result && (
                  <div className="p-4 rounded-lg border border-white/20">
                    {result.status === 'success' && result.employee ? (
                      <div className="text-center space-y-3">
                        <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                          <Check className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-green-400">ACESSO LIBERADO</h4>
                          <p className="text-lg font-semibold">{result.employee.name}</p>
                          <p className="text-sm text-white/70">{result.employee.position}</p>
                          <Badge variant="outline" className="mt-2">
                            Confiança: {Math.round(result.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ) : result.status === 'failed' ? (
                      <div className="text-center space-y-3">
                        <div className="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center">
                          <X className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-red-400">ACESSO NEGADO</h4>
                          <p className="text-white/70">Funcionário não reconhecido</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto flex items-center justify-center">
                          <Camera className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-yellow-400">PROCESSANDO</h4>
                          <p className="text-white/70">Analisando biometria facial...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* System Info */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Funcionários cadastrados:</span>
                    <span className="font-semibold">{employees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Filial:</span>
                    <span className="font-semibold">{branchData.name}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <h4 className="font-semibold text-blue-300 mb-2">Como usar:</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Posicione seu rosto na frente da câmera</li>
                    <li>• Aguarde o sistema processar automaticamente</li>
                    <li>• Verde = Acesso liberado e ponto registrado</li>
                    <li>• Vermelho = Acesso negado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveFaceRecognition;