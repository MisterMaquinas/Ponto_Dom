
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onLogin: (userType: string, userData: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
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
      const { data: masterUser, error: masterError } = await supabase
        .from('master_users')
        .select('*')
        .eq('username', formData.username)
        .eq('password', formData.password)
        .single();

      if (masterUser && !masterError) {
        onLogin('master', masterUser);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${masterUser.name}`,
        });
        return;
      }

      // Se não for master, verificar usuários normais
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .eq('username', formData.username)
        .eq('password', formData.password)
        .single();

      if (user && !userError) {
        const userData = {
          ...user,
          companyName: user.companies?.name,
          companyId: user.company_id
        };
        
        onLogin(user.role, userData);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${user.name}`,
        });
        return;
      }

      // Se chegou aqui, credenciais inválidas
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            BioPonto System
          </CardTitle>
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
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
