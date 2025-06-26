
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (userType: string, userData: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const users = {
    'Adm1': { password: 'Adm1', type: 'admin', name: 'Administrador' },
    'Gerente1': { password: 'Gerente1', type: 'manager', name: 'Gerente' },
    'Supervisor1': { password: 'Supervisor1', type: 'supervisor', name: 'Supervisor' },
    'Usuario1': { password: 'Usuario1', type: 'user', name: 'Funcionário' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login delay
    setTimeout(() => {
      const user = users[username as keyof typeof users];
      
      if (user && user.password === password) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${user.name}`,
        });
        onLogin(user.type, { username, name: user.name, type: user.type });
      } else {
        toast({
          title: "Erro no login",
          description: "Usuário ou senha incorretos",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6">
            <img 
              src="/lovable-uploads/a30e2daf-b16c-4217-b819-2a70f12af50d.png" 
              alt="BioPonto Logo" 
              className="w-32 h-32 mx-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            BioPonto
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">Sistema de Ponto Digital</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Usuário</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="h-12 border-gray-200 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="h-12 border-gray-200 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Usuários de teste:</p>
            <div className="text-xs space-y-1 text-gray-500">
              <div>Admin: Adm1 / Adm1</div>
              <div>Gerente: Gerente1 / Gerente1</div>
              <div>Supervisor: Supervisor1 / Supervisor1</div>
              <div>Funcionário: Usuario1 / Usuario1</div>
            </div>
          </div>
          
          {/* Créditos e Contato */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-600 font-medium">
                Desenvolvido por
              </p>
              <p className="text-sm font-bold text-gray-800">
                DOM LIMA TECNOLOGIA
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>📧 contato@domlima.tech</p>
                <p>📱 (11) 99999-9999</p>
                <p>🌐 www.domlima.tech</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
