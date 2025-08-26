import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, LogOut, UserPlus, Camera, Building2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import FacialBiometricCapture from '../FacialBiometricCapture';

interface CompanyEmployeeRegistrationProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
  branches: any[];
}

const CompanyEmployeeRegistration = ({ onBack, onLogout, userData, branches }: CompanyEmployeeRegistrationProps) => {
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    contact: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    position: '',
    custom_position: '',
    work_start_time: '',
    work_end_time: '',
    break_start_time: '',
    break_end_time: '',
    reference_photo_url: '',
    face_encoding: '',
    branch_id: ''
  });

  const positions = [
    'Gerente',
    'Supervisor',
    'Vendedor',
    'Caixa',
    'Estoquista',
    'Segurança',
    'Limpeza',
    'Outro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBiometricCapture = async (imageData: string) => {
    try {
      setFormData(prev => ({
        ...prev,
        reference_photo_url: imageData,
        face_encoding: 'encoded_face_data' // Placeholder para dados biométricos
      }));
      setShowCamera(false);
      toast({
        title: "Sucesso",
        description: "Foto biométrica capturada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao capturar biometria:', error);
      toast({
        title: "Erro",
        description: "Erro ao capturar foto biométrica",
        variant: "destructive",
      });
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference_photo_url) {
      toast({
        title: "Erro",
        description: "É necessário capturar uma foto de referência",
        variant: "destructive",
      });
      return;
    }

    try {
      // Determinar branch_id: se não foi selecionado e não há branches, criar SEDE
      let selectedBranchId = formData.branch_id;
      
      if (!selectedBranchId) {
        if (branches.length === 0) {
          // Criar filial SEDE automaticamente
          const { data: sedeData, error: sedeError } = await supabase
            .from('branches')
            .insert({
              company_id: userData.companyId,
              name: 'SEDE',
              code: 'SEDE',
              address: 'Endereço da Sede',
              status: 'active',
              is_active: true
            })
            .select()
            .single();

          if (sedeError) throw sedeError;
          selectedBranchId = sedeData.id;
          
          toast({
            title: "Info",
            description: "Filial SEDE criada automaticamente",
          });
        } else {
          // Usar a primeira filial disponível
          selectedBranchId = branches[0].id;
        }
      }

      // Upload da foto
      let photoUrl = '';
      if (formData.reference_photo_url) {
        const photoBlob = dataURItoBlob(formData.reference_photo_url);
        const fileName = `employee_${Date.now()}_${userData.companyId}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('biometric-photos')
          .upload(fileName, photoBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('biometric-photos')
          .getPublicUrl(uploadData.path);
        
        photoUrl = urlData.publicUrl;
      }

      // Inserir funcionário
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          branch_id: selectedBranchId,
          name: formData.name,
          cpf: formData.cpf,
          rg: formData.rg,
          birth_date: formData.birth_date || null,
          contact: formData.contact,
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          position: formData.position === 'Outro' ? formData.custom_position : formData.position,
          work_start_time: formData.work_start_time,
          work_end_time: formData.work_end_time,
          break_start_time: formData.break_start_time,
          break_end_time: formData.break_end_time,
          reference_photo_url: photoUrl,
          face_encoding: formData.face_encoding,
          status: 'active',
          is_active: true
        });

      if (employeeError) throw employeeError;

      toast({
        title: "Sucesso",
        description: "Funcionário cadastrado com sucesso!",
      });

      // Reset form
      setFormData({
        name: '',
        cpf: '',
        rg: '',
        birth_date: '',
        contact: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        position: '',
        custom_position: '',
        work_start_time: '',
        work_end_time: '',
        break_start_time: '',
        break_end_time: '',
        reference_photo_url: '',
        face_encoding: '',
        branch_id: ''
      });

    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar funcionário",
        variant: "destructive",
      });
    }
  };

  if (showCamera) {
    return (
      <FacialBiometricCapture
        onCapture={handleBiometricCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-green-600" />
                  Cadastrar Funcionário
                </h1>
                <p className="text-gray-600">Registrar novo funcionário</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Funcionário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Filial */}
              <div className="space-y-2">
                <Label htmlFor="branch">Filial *</Label>
                {branches.length > 0 ? (
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) => handleInputChange('branch_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a filial ou deixe em branco para SEDE" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sede">SEDE (Criada automaticamente)</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">
                      Será cadastrado na SEDE (criada automaticamente)
                    </span>
                  </div>
                )}
              </div>

              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => handleInputChange('rg', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contato</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleInputChange('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.position === 'Outro' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom_position">Cargo Personalizado</Label>
                    <Input
                      id="custom_position"
                      value={formData.custom_position}
                      onChange={(e) => handleInputChange('custom_position', e.target.value)}
                      placeholder="Digite o cargo"
                    />
                  </div>
                )}
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  />
                </div>
              </div>

              {/* Horários de Trabalho */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="work_start_time">Início do Trabalho</Label>
                  <Input
                    id="work_start_time"
                    type="time"
                    value={formData.work_start_time}
                    onChange={(e) => handleInputChange('work_start_time', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_end_time">Fim do Trabalho</Label>
                  <Input
                    id="work_end_time"
                    type="time"
                    value={formData.work_end_time}
                    onChange={(e) => handleInputChange('work_end_time', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="break_start_time">Início do Intervalo</Label>
                  <Input
                    id="break_start_time"
                    type="time"
                    value={formData.break_start_time}
                    onChange={(e) => handleInputChange('break_start_time', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="break_end_time">Fim do Intervalo</Label>
                  <Input
                    id="break_end_time"
                    type="time"
                    value={formData.break_end_time}
                    onChange={(e) => handleInputChange('break_end_time', e.target.value)}
                  />
                </div>
              </div>

              {/* Biometria Facial */}
              <div className="space-y-4">
                <Label>Biometria Facial *</Label>
                {formData.reference_photo_url ? (
                  <div className="space-y-4">
                    <div className="w-48 h-48 mx-auto">
                      <img
                        src={formData.reference_photo_url}
                        alt="Foto de referência"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Recapturar Foto
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar Foto Biométrica
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Cadastrar Funcionário
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
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

export default CompanyEmployeeRegistration;