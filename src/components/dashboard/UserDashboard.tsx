
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, User, CheckCircle, Scan } from 'lucide-react';
import FaceRecognition from './FaceRecognition';
import FacialBiometricDemo from './FacialBiometricDemo';
import ReceiptActions from './ReceiptActions';
import { toast } from "@/hooks/use-toast";

interface UserDashboardProps {
  userData: any;
  onLogout: () => void;
}

const UserDashboard = ({ userData, onLogout }: UserDashboardProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showBiometricDemo, setShowBiometricDemo] = useState(false);
  const [lastPunchTime, setLastPunchTime] = useState<Date | null>(null);
  const [lastPunchData, setLastPunchData] = useState<any>(null);

  const handlePunchSuccess = (faceData: any) => {
    const now = new Date();
    setLastPunchTime(now);
    setLastPunchData({
      name: userData.name,
      timestamp: now.toISOString(),
      hash: faceData.hash
    });
    setShowCamera(false);
    
    // Simulate printing receipt
    setTimeout(() => {
      toast({
        title: "Comprovante Impresso!",
        description: `Ponto registrado às ${now.toLocaleTimeString()}`,
      });
    }, 1500);
  };

  if (showCamera) {
    return (
      <FaceRecognition
        onSuccess={handlePunchSuccess}
        onCancel={() => setShowCamera(false)}
        userData={userData}
      />
    );
  }

  if (showBiometricDemo) {
    return (
      <FacialBiometricDemo
        userData={userData}
        onBack={() => setShowBiometricDemo(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registro de Ponto</h1>
              <p className="text-gray-600">Bem-vindo, {userData.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <User className="w-4 h-4 mr-1" />
                Funcionário
              </Badge>
              <Button onClick={onLogout} variant="outline">
                Sair
              </Button>
            </div>
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
                  Reconhecimento Facial
                </h3>
                <p className="text-gray-600 text-sm">
                  Clique no botão abaixo para registrar seu ponto
                </p>
              </div>

              <Button
                onClick={() => setShowCamera(true)}
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Camera className="w-6 h-6 mr-3" />
                Registrar Ponto
              </Button>

              <Button
                onClick={() => setShowBiometricDemo(true)}
                variant="outline"
                className="w-full mt-3 h-12 border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Scan className="w-5 h-5 mr-2" />
                Testar Biometria Facial
              </Button>

              {lastPunchTime && lastPunchData && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Último registro</span>
                  </div>
                  <p className="text-green-700 text-sm mb-2">
                    {lastPunchTime.toLocaleString('pt-BR')}
                  </p>
                  <div className="flex items-center justify-center">
                    <ReceiptActions punchData={lastPunchData} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2">Como funciona?</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Clique em "Registrar Ponto"</p>
              <p>2. Posicione seu rosto na câmera</p>
              <p>3. Aguarde o reconhecimento</p>
              <p>4. Receba seu comprovante impresso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
