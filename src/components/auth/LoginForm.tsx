import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface LoginFormProps {
  onLogin: (userType: string, userData: any) => void;
  onBack?: () => void;
}
const LoginForm = ({
  onLogin,
  onBack
}: LoginFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Primeiro, verificar se é usuário master
      const {
        data: masterUser,
        error: masterError
      } = await supabase.from('master_users').select('*').eq('username', formData.username).eq('password', formData.password).single();
      if (masterUser && !masterError) {
        onLogin('master', masterUser);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${masterUser.name}`
        });
        return;
      }

      // Se não for master, verificar usuários normais
      const {
        data: user,
        error: userError
      } = await supabase.from('users').select(`
          *,
          companies (
            id,
            name
          )
        `).eq('username', formData.username).eq('password', formData.password).single();
      
      if (user && !userError) {
        // Verificar status da assinatura da empresa
        const { data: subscription } = await supabase
          .from('company_subscriptions')
          .select('*')
          .eq('company_id', user.company_id)
          .single();

        if (subscription) {
          // Verificar se a assinatura está ativa
          const now = new Date();
          const expiresAt = new Date(subscription.expires_at);
          const gracePeriodEnd = new Date(expiresAt.getTime() + subscription.grace_period_days * 24 * 60 * 60 * 1000);

          if (subscription.status === 'suspended') {
            toast({
              title: "Acesso Bloqueado",
              description: "A assinatura da sua empresa foi suspensa. Entre em contato com o suporte.",
              variant: "destructive"
            });
            return;
          }

          if (subscription.status === 'cancelled') {
            toast({
              title: "Acesso Bloqueado",
              description: "A assinatura da sua empresa foi cancelada. Entre em contato com o suporte.",
              variant: "destructive"
            });
            return;
          }

          if (now > gracePeriodEnd && subscription.auto_suspend) {
            // Auto-suspender se passou do período de graça
            await supabase
              .from('company_subscriptions')
              .update({ status: 'suspended' })
              .eq('id', subscription.id);

            toast({
              title: "Acesso Bloqueado",
              description: "A assinatura da sua empresa expirou e foi suspensa automaticamente.",
              variant: "destructive"
            });
            return;
          }

          if (now > expiresAt && now <= gracePeriodEnd) {
            // Período de graça - mostrar aviso mas permitir login
            toast({
              title: "Assinatura Vencida",
              description: `Sua assinatura venceu. Período de graça até ${gracePeriodEnd.toLocaleDateString('pt-BR')}`,
              variant: "destructive"
            });
          }
        } else {
          // Sem assinatura - bloquear acesso
          toast({
            title: "Acesso Bloqueado",
            description: "Sua empresa não possui uma assinatura ativa. Entre em contato com o suporte.",
            variant: "destructive"
          });
          return;
        }

        const userData = {
          ...user,
          companyName: user.companies?.name,
          companyId: user.company_id,
          subscription: subscription
        };
        onLogin(user.role, userData);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${user.name}`
        });
        return;
      }

      // Se chegou aqui, credenciais inválidas
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">PontoDom ✅ </CardTitle>
          <p className="text-gray-600">
            Sistema de Controle de Ponto com Biometria
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <Input type="text" value={formData.username} onChange={e => setFormData({
              ...formData,
              username: e.target.value
            })} placeholder="Digite seu usuário" required disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <Input type="password" value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} placeholder="Digite sua senha" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            {onBack && (
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="w-full mt-2"
              >
                Voltar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default LoginForm;