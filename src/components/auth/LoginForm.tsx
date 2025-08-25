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

const LoginForm = ({ onLogin, onBack }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Primeiro, verificar se é usuário admin
      const {
        data: adminUser,
        error: adminError
      } = await supabase
        .from('admins')
        .select('*')
        .eq('username', formData.username)
        .eq('password', formData.password)
        .maybeSingle();

      if (adminUser && !adminError) {
        const isMaster = adminUser.username?.toLowerCase() === 'master';
        const userType = isMaster ? 'master' : 'admin';
        const userData = { ...adminUser, name: adminUser.username };
        onLogin(userType, userData);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${adminUser.username}`
        });
        return;
      }

      // Se não for admin, verificar usuários normais
      const {
        data: user,
        error: userError
      } = await supabase.from('users').select('*').eq('username', formData.username).eq('password', formData.password).maybeSingle();
      
      if (user && !userError) {
        const userType = user.is_admin ? 'admin' : 'user';
        onLogin(userType, user);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${user.username}`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">PONTO VERIFICADO ✅</CardTitle>
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
              <Input
                type="text"
                value={formData.username}
                onChange={e => setFormData({
                  ...formData,
                  username: e.target.value
                })}
                placeholder="Digite seu usuário"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={e => setFormData({
                  ...formData,
                  password: e.target.value
                })}
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={isLoading}
            >
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
    </div>
  );
};

export default LoginForm;