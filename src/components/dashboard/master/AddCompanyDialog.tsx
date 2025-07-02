import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Save, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface AddCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyAdded: () => void;
}

const AddCompanyDialog = ({ isOpen, onClose, onCompanyAdded }: AddCompanyDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    adminName: '',
    adminUsername: '',
    adminPassword: '',
    contact: '',
    cpf: '',
    rg: '',
    birthDate: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{ name: formData.name }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Criar usuário admin
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          company_id: company.id,
          name: formData.adminName,
          username: formData.adminUsername,
          password: formData.adminPassword,
          role: 'admin',
          contact: formData.contact,
          cpf: formData.cpf,
          rg: formData.rg,
          birth_date: formData.birthDate,
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          created_by: 'master'
        }]);

      if (userError) throw userError;

      // Criar limites padrão para a empresa
      const { error: limitsError } = await supabase
        .from('company_limits')
        .insert([{
          company_id: company.id,
          max_admins: 1,
          max_managers: 5,
          max_supervisors: 10,
          max_users: 50
        }]);

      if (limitsError) throw limitsError;

      toast({
        title: "Empresa criada com sucesso!",
        description: `A empresa ${formData.name} foi cadastrada.`,
      });

      onCompanyAdded();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao criar empresa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Cadastrar Nova Empresa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados da Empresa</h3>
            <div>
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados do Administrador</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminName">Nome Completo</Label>
                <Input
                  id="adminName"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange('adminName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="adminUsername">Usuário</Label>
                <Input
                  id="adminUsername"
                  value={formData.adminUsername}
                  onChange={(e) => handleInputChange('adminUsername', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminPassword">Senha</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contato</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  required
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Empresa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyDialog;