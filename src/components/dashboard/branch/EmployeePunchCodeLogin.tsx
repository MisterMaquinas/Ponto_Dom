import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployeePunchCodeLoginProps {
  onSuccess: (branch: any) => void;
  onBack: () => void;
}

const EmployeePunchCodeLogin = ({ onSuccess, onBack }: EmployeePunchCodeLoginProps) => {
  const [branchCode, setBranchCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!branchCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite o código da filial",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: branch, error } = await supabase
        .from('branches')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .eq('id', branchCode.trim())
        .eq('is_active', true)
        .single();

      if (error || !branch) {
        toast({
          title: "Código inválido",
          description: "Código da filial não encontrado ou filial inativa",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Acesso autorizado",
        description: `Bem-vindo à ${branch.name}`,
      });

      onSuccess(branch);
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar código da filial",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Sistema de Ponto</CardTitle>
          <p className="text-gray-600">Digite o código da sua filial</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branchCode">Código da Filial</Label>
              <Input
                id="branchCode"
                type="text"
                placeholder="Digite o código da filial"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                disabled={loading}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Acessar Sistema'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBack}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              <strong>Funcionários:</strong> Este é o sistema de ponto por reconhecimento facial. 
              Solicite o código da filial ao seu supervisor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeePunchCodeLogin;