import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, Coffee, LogIn, LogOut } from 'lucide-react';

interface PunchTypeSelectorProps {
  onSelect: (punchType: string) => void;
  onCancel: () => void;
}

const PunchTypeSelector = ({ onSelect, onCancel }: PunchTypeSelectorProps) => {
  const currentHour = new Date().getHours();
  
  // Sugerir tipo baseado no horário
  const getSuggestedType = () => {
    if (currentHour >= 6 && currentHour < 10) return 'entrada';
    if (currentHour >= 11 && currentHour < 13) return 'intervalo_inicio';
    if (currentHour >= 13 && currentHour < 15) return 'intervalo_fim';
    if (currentHour >= 17 && currentHour < 22) return 'saida';
    return 'entrada';
  };

  const suggestedType = getSuggestedType();

  const punchTypes = [
    {
      type: 'entrada',
      label: 'Entrada',
      description: 'Início do expediente',
      icon: LogIn,
      color: 'bg-green-500 hover:bg-green-600',
      suggested: suggestedType === 'entrada'
    },
    {
      type: 'intervalo_inicio',
      label: 'Saída (Intervalo)',
      description: 'Ida para o intervalo/almoço',
      icon: Coffee,
      color: 'bg-orange-500 hover:bg-orange-600',
      suggested: suggestedType === 'intervalo_inicio'
    },
    {
      type: 'intervalo_fim',
      label: 'Volta (Intervalo)',
      description: 'Retorno do intervalo/almoço',
      icon: ArrowRight,
      color: 'bg-blue-500 hover:bg-blue-600',
      suggested: suggestedType === 'intervalo_fim'
    },
    {
      type: 'saida',
      label: 'Saída',
      description: 'Fim do expediente',
      icon: LogOut,
      color: 'bg-red-500 hover:bg-red-600',
      suggested: suggestedType === 'saida'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Tipo de Registro
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Selecione o tipo de registro de ponto que deseja fazer
          </p>
          <p className="text-sm text-muted-foreground">
            Horário atual: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {punchTypes.map((punchType) => {
            const IconComponent = punchType.icon;
            return (
              <Button
                key={punchType.type}
                onClick={() => onSelect(punchType.type)}
                className={`w-full h-auto p-4 ${punchType.color} text-white relative overflow-hidden group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
                variant="default"
              >
                <div className="flex items-center w-full">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mr-4">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-lg">{punchType.label}</div>
                    <div className="text-sm opacity-90">{punchType.description}</div>
                  </div>
                  {punchType.suggested && (
                    <div className="bg-white/30 px-2 py-1 rounded text-xs font-medium">
                      Sugerido
                    </div>
                  )}
                </div>
                
                {/* Subtle animation effect */}
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Button>
            );
          })}
          
          <div className="pt-4 border-t">
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PunchTypeSelector;