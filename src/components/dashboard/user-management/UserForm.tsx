
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Camera, Check, X, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useUserLimits } from "@/hooks/useUserLimits";

interface UserFormData {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  contact: string;
  username: string;
  password: string;
  role: string;
  face_data?: string;
}

interface UserFormProps {
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  availableRoles: { value: string; label: string }[];
  userData: any;
}

const UserForm = ({ formData, setFormData, onSubmit, onCancel, availableRoles, userData }: UserFormProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasFaceData, setHasFaceData] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { 
    canCreateUser, 
    getLimitMessage, 
    loading: limitsLoading 
  } = useUserLimits(userData.companyId);

  const startFaceCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
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
      setIsCapturing(false);
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = 160;
        canvas.height = 120;
        context.drawImage(video, 0, 0, 160, 120);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, face_data: imageData });
        setHasFaceData(true);
        
        // Parar stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
        
        toast({
          title: "Sucesso",
          description: "Biometria facial capturada com sucesso",
        });
      }
    }
  };

  const cancelCapture = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar limite antes de submeter
    if (!canCreateUser(formData.role)) {
      toast({
        title: "Limite atingido",
        description: `Não é possível cadastrar mais usuários do tipo ${formData.role}. Limite da empresa atingido.`,
        variant: "destructive",
      });
      return;
    }

    onSubmit(e);
  };

  // Filtrar roles disponíveis baseado nos limites
  const availableRolesWithLimits = availableRoles.filter(role => 
    canCreateUser(role.value) || limitsLoading
  );

  return (
    <Card className="mb-8 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Cadastrar Novo Usuário - {userData.companyName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mostrar informações de limite */}
        {!limitsLoading && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Limites da Empresa
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {availableRoles.map(role => (
                <div key={role.value} className="flex items-center justify-between">
                  <span className="text-blue-700">{role.label}:</span>
                  <Badge 
                    variant={canCreateUser(role.value) ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {getLimitMessage(role.value)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RG *
                </label>
                <Input
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  placeholder="Digite o RG"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rua *
                </label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número *
                </label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Nº"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro *
                </label>
                <Input
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="Bairro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cidade"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UF *
                </label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="UF"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <Input
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  placeholder="00000-000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contato *
                </label>
                <Input
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Telefone/Email"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dados de Login */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de Usuário *
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Digite o usuário"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Digite a senha"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRolesWithLimits.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{role.label}</span>
                          {!limitsLoading && (
                            <Badge 
                              variant={canCreateUser(role.value) ? "default" : "destructive"}
                              className="ml-2 text-xs"
                            >
                              {getLimitMessage(role.value).split('(')[1]?.replace(')', '') || ''}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role && !canCreateUser(formData.role) && (
                  <p className="text-red-600 text-sm mt-1">
                    ⚠️ Limite atingido para este cargo
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Biometria Facial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Biometria Facial</h3>
            <div className="flex flex-col items-center space-y-4">
              {!isCapturing && !hasFaceData && (
                <Button
                  type="button"
                  onClick={startFaceCapture}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar Biometria Facial
                </Button>
              )}

              {isCapturing && (
                <div className="text-center space-y-4">
                  <video
                    ref={videoRef}
                    className="w-80 h-60 border-2 border-gray-300 rounded-lg"
                    autoPlay
                    muted
                  />
                  <div className="flex gap-4 justify-center">
                    <Button
                      type="button"
                      onClick={captureFace}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Capturar
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelCapture}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {hasFaceData && (
                <div className="text-center space-y-2">
                  <Check className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="text-green-600 font-medium">Biometria facial capturada!</p>
                  <Button
                    type="button"
                    onClick={() => {
                      setHasFaceData(false);
                      setFormData({ ...formData, face_data: undefined });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Recapturar
                  </Button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="bg-green-500 hover:bg-green-600"
              disabled={formData.role && !canCreateUser(formData.role)}
            >
              Cadastrar Usuário
            </Button>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
