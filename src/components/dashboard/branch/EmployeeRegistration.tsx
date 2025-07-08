import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Camera, Save, ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FacialBiometricCapture from '../FacialBiometricCapture';

interface EmployeeRegistrationProps {
  branchData: any;
  onBack: () => void;
}

const EmployeeRegistration = ({ branchData, onBack }: EmployeeRegistrationProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    contact: '',
    position: '',
    custom_position: '',
    reference_photo_url: '',
    face_encoding: ''
  });

  const positions = [
    { value: 'gerente', label: 'Gerente' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'caixa', label: 'Caixa' },
    { value: 'seguranca', label: 'Segurança' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'outros', label: 'Outros' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBiometricCapture = async (imageData: string) => {
    // Simular processamento de biometria
    const faceEncoding = `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setFormData(prev => ({
      ...prev,
      reference_photo_url: imageData,
      face_encoding: faceEncoding
    }));
    
    setShowCamera(false);
    
    toast({
      title: "Biometria capturada!",
      description: "Dados biométricos registrados com sucesso",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference_photo_url) {
      toast({
        title: "Biometria obrigatória",
        description: "É necessário capturar a biometria facial do funcionário",
        variant: "destructive",
      });
      return;
    }

    try {
      // Converter base64 para blob
      const response = await fetch(formData.reference_photo_url);
      const blob = await response.blob();
      
      // Upload da imagem para o Supabase Storage
      const fileName = `employee_${branchData.id}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('biometric-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('biometric-photos')
        .getPublicUrl(fileName);

      // Inserir funcionário no banco
      const { error: insertError } = await supabase
        .from('employees')
        .insert([
          {
            name: formData.name,
            cpf: formData.cpf,
            rg: formData.rg,
            birth_date: formData.birth_date,
            street: formData.street,
            number: formData.number,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            contact: formData.contact,
            position: formData.position,
            custom_position: formData.custom_position,
            branch_id: branchData.id,
            reference_photo_url: publicUrlData.publicUrl,
            face_encoding: formData.face_encoding,
            created_by: branchData.manager_username || 'branch_manager'
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Funcionário cadastrado!",
        description: `${formData.name} foi registrado com sucesso`,
      });

      // Reset form
      setFormData({
        name: '',
        cpf: '',
        rg: '',
        birth_date: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        contact: '',
        position: '',
        custom_position: '',
        reference_photo_url: '',
        face_encoding: ''
      });

    } catch (error: any) {
      console.error('Erro ao cadastrar funcionário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar funcionário",
        variant: "destructive",
      });
    }
  };

  // Converter data URI para Blob
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  if (showCamera) {
    return (
      <FacialBiometricCapture
        onCapture={handleBiometricCapture}
        onCancel={() => setShowCamera(false)}
        title="Registro de Biometria do Funcionário"
        mode="register"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Funcionário</h1>
          <p className="text-gray-600">{branchData.name}</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Dados do Funcionário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rg">RG *</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleInputChange('rg', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Data de Nascimento *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contato *</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">CEP *</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cargo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cargo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Cargo *</Label>
                    <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.position === 'outros' && (
                    <div>
                      <Label htmlFor="custom_position">Cargo Personalizado *</Label>
                      <Input
                        id="custom_position"
                        value={formData.custom_position}
                        onChange={(e) => handleInputChange('custom_position', e.target.value)}
                        placeholder="Digite o cargo"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Biometria */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Biometria Facial *</h3>
                <div className="flex flex-col items-center space-y-4">
                  {formData.reference_photo_url ? (
                    <div className="text-center space-y-2">
                      <img 
                        src={formData.reference_photo_url} 
                        alt="Biometria registrada" 
                        className="w-32 h-32 object-cover rounded-lg border mx-auto"
                      />
                      <p className="text-green-600 font-medium">Biometria registrada!</p>
                      <Button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        variant="outline"
                        size="sm"
                      >
                        Recapturar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Registre a biometria facial do funcionário</p>
                      <Button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capturar Biometria
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="bg-green-500 hover:bg-green-600"
                  disabled={!formData.reference_photo_url}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Cadastrar Funcionário
                </Button>
                <Button type="button" onClick={onBack} variant="outline">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeRegistration;