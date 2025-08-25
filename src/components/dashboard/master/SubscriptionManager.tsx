import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SubscriptionManagerProps {
  onBack: () => void;
  userData: any;
  onLogout: () => void;
}

const SubscriptionManager = ({ onBack, userData, onLogout }: SubscriptionManagerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                  Gerenciar Assinaturas
                </h1>
                <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sistema de Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2 text-lg">Funcionalidade em Desenvolvimento</p>
              <p className="text-gray-400">
                O sistema de assinaturas será implementado em uma versão futura.
              </p>
              <Badge variant="outline" className="mt-4">
                Em breve
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManager;