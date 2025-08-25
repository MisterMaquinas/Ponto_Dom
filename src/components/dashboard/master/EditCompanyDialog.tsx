import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditCompanyDialogProps {
  company: any;
  isOpen: boolean;
  onClose: () => void;
  onCompanyUpdated: () => void;
}

const EditCompanyDialog = ({ company, isOpen, onClose, onCompanyUpdated }: EditCompanyDialogProps) => {
  const [formData, setFormData] = useState({
    // Dados da empresa
    name: '',
    fantasyName: '',
    cnpj: '',
    stateRegistration: '',
    email: '',
    phone: '',
    // Dados do administrador
    adminName: '',
    adminUsername: '',
    adminPassword: '',
    // Endereço
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (company && isOpen) {
      loadCompanyData();
    }
  }, [company, isOpen]);

  const loadCompanyData = async () => {
    if (!company?.id) return;
    
    setIsLoading(true);
    try {
      // Buscar dados completos da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company.id)
        .single();

      if (companyError) throw companyError;

      // Buscar dados do administrador da empresa
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_admin', true)
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Erro ao buscar admin:', adminError);
      }

      setAdminUser(adminData);
      setFormData({
        name: companyData.name || '',
        fantasyName: companyData.fantasy_name || '',
        cnpj: companyData.cnpj || '',
        stateRegistration: companyData.state_registration || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        adminName: adminData?.name || '',
        adminUsername: adminData?.username || '',
        adminPassword: '', // Sempre vazio por segurança
        street: companyData.street || '',
        number: companyData.number || '',
        neighborhood: companyData.neighborhood || '',
        city: companyData.city || '',
        state: companyData.state || '',
        zipCode: companyData.zip_code || ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da empresa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!company?.id) return;
    
    setIsLoading(true);
    try {
      // Atualizar dados da empresa
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          fantasy_name: formData.fantasyName,
          cnpj: formData.cnpj,
          state_registration: formData.stateRegistration,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      if (companyError) throw companyError;

      // Atualizar dados do administrador se existir
      if (adminUser?.id) {
        const adminUpdateData: any = {
          name: formData.adminName,
          username: formData.adminUsername,
          updated_at: new Date().toISOString()
        };

        // Só atualizar senha se foi fornecida uma nova
        if (formData.adminPassword.trim()) {
          adminUpdateData.password = formData.adminPassword;
        }

        const { error: adminError } = await supabase
          .from('users')
          .update(adminUpdateData)
          .eq('id', adminUser.id);

        if (adminError) throw adminError;
      }

      toast({
        title: "Empresa atualizada com sucesso!",
        description: `A empresa ${formData.name} foi atualizada.`,
      });

      onCompanyUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: "Erro ao atualizar empresa",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Empresa - {company?.name}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Carregando dados...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dados da Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados da Empresa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Razão Social *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Razão social da empresa"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="fantasyName">Nome Fantasia</Label>
                  <Input
                    id="fantasyName"
                    value={formData.fantasyName}
                    onChange={(e) => handleInputChange('fantasyName', e.target.value)}
                    placeholder="Nome fantasia"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                  <Input
                    id="stateRegistration"
                    value={formData.stateRegistration}
                    onChange={(e) => handleInputChange('stateRegistration', e.target.value)}
                    placeholder="Inscrição estadual"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Dados do Administrador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Administrador</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminName">Nome Completo</Label>
                  <Input
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => handleInputChange('adminName', e.target.value)}
                    placeholder="Nome do administrador"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="adminUsername">Usuário</Label>
                  <Input
                    id="adminUsername"
                    value={formData.adminUsername}
                    onChange={(e) => handleInputChange('adminUsername', e.target.value)}
                    placeholder="Nome de usuário"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="adminPassword">Nova Senha (deixe vazio para manter a atual)</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                  placeholder="Digite uma nova senha ou deixe vazio"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Nome da rua"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="Número"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    placeholder="Bairro"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Cidade"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Estado"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="00000-000"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;