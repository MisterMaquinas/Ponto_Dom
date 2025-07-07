import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddBranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBranchAdded: () => void;
  companyId: string;
}

const AddBranchDialog = ({ isOpen, onClose, onBranchAdded, companyId }: AddBranchDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    contact: '',
    manager_username: '',
    manager_password: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('branches')
        .insert([{
          ...formData,
          company_id: companyId
        }]);

      if (error) throw error;

      toast({
        title: "Filial criada com sucesso!",
        description: `A filial ${formData.name} foi criada com sucesso.`,
      });

      onBranchAdded();
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        contact: '',
        manager_username: '',
        manager_password: '',
        is_active: true
      });
    } catch (error: any) {
      console.error('Erro ao criar filial:', error);
      toast({
        title: "Erro ao criar filial",
        description: error.message || "Ocorreu um erro ao criar a filial",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Filial</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Filial</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Filial Centro"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                placeholder="Ex: (11) 99999-9999"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Ex: Rua das Flores, 123"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Ex: São Paulo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="Ex: SP"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                placeholder="Ex: 01234-567"
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Credenciais de Acesso da Filial</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager_username">Usuário de Login</Label>
                <Input
                  id="manager_username"
                  value={formData.manager_username}
                  onChange={(e) => setFormData({...formData, manager_username: e.target.value})}
                  placeholder="Ex: filial.centro"
                />
              </div>
              
              <div>
                <Label htmlFor="manager_password">Senha</Label>
                <Input
                  id="manager_password"
                  type="password"
                  value={formData.manager_password}
                  onChange={(e) => setFormData({...formData, manager_password: e.target.value})}
                  placeholder="Digite uma senha"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label htmlFor="is_active">Filial ativa</Label>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Criando...' : 'Criar Filial'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBranchDialog;