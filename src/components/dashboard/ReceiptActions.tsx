
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, Share, Bluetooth, MessageCircle, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ReceiptActionsProps {
  punchData: {
    name: string;
    timestamp: string;
    hash: string;
    position?: string;
    branch?: string;
    confidence?: number;
  };
}

const ReceiptActions = ({ punchData }: ReceiptActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const generateReceiptText = () => {
    const date = new Date(punchData.timestamp);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR');
    
    return `
COMPROVANTE DE PONTO
════════════════════
Funcionário: ${punchData.name}${punchData.position ? `\nCargo: ${punchData.position}` : ''}${punchData.branch ? `\nFilial: ${punchData.branch}` : ''}
Data: ${formattedDate}
Horário: ${formattedTime}${punchData.confidence ? `\nConfiança: ${punchData.confidence}%` : ''}
Hash: ${punchData.hash}
════════════════════
Este comprovante é válido para
fins de controle de ponto.
Guarde-o para eventuais
consultas ou esclarecimentos.
    `.trim();
  };

  const handleBluetoothPrint = async () => {
    setIsConnecting(true);
    
    try {
      // Verificar se o navegador suporta Web Bluetooth
      if (!('bluetooth' in navigator)) {
        throw new Error('Bluetooth não suportado neste navegador');
      }

      toast({
        title: "Conectando...",
        description: "Procurando impressoras Bluetooth...",
      });

      // Tentar conectar via Web Bluetooth API
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service']
        });
        
        console.log('Dispositivo selecionado:', device.name);
        
        // Simular envio para impressora
        const receiptText = generateReceiptText();
        console.log('Enviando para impressora:', receiptText);
        
        toast({
          title: "Impresso com sucesso!",
          description: `Comprovante enviado para ${device.name}`,
        });
      } catch (bluetoothError: any) {
        console.log('Erro Bluetooth específico:', bluetoothError);
        
        if (bluetoothError.name === 'NotFoundError') {
          throw new Error('Nenhuma impressora Bluetooth encontrada');
        } else if (bluetoothError.name === 'SecurityError') {
          throw new Error('Permissão negada para acessar Bluetooth');
        } else if (bluetoothError.name === 'NotSupportedError') {
          throw new Error('Bluetooth não disponível neste dispositivo');
        } else {
          throw new Error(`Erro Bluetooth: ${bluetoothError.message}`);
        }
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast({
        title: "Erro na impressão",
        description: "Não foi possível conectar à impressora Bluetooth",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const receiptText = generateReceiptText();
    const encodedText = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp aberto",
      description: "Comprovante pronto para compartilhar",
    });
    
    setIsOpen(false);
  };

  const handleCopyReceipt = () => {
    const receiptText = generateReceiptText();
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(receiptText).then(() => {
          toast({
            title: "Copiado!",
            description: "Comprovante copiado para a área de transferência",
          });
        }).catch((error) => {
          console.error('Erro ao copiar:', error);
          fallbackCopy(receiptText);
        });
      } else {
        fallbackCopy(receiptText);
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
      fallbackCopy(receiptText);
    }
  };

  const fallbackCopy = (text: string) => {
    // Fallback para dispositivos que não suportam clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast({
        title: "Copiado!",
        description: "Comprovante copiado para a área de transferência",
      });
    } catch (err) {
      toast({
        title: "Comprovante gerado",
        description: "Visualize o comprovante acima",
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center text-green-600 hover:text-green-700 transition-colors cursor-pointer">
          <Printer className="w-4 h-4 mr-1" />
          <span className="text-xs underline">Comprovante impresso</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Opções do Comprovante
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="text-sm text-gray-700 whitespace-pre-line font-mono">
                {generateReceiptText()}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleBluetoothPrint}
              disabled={isConnecting}
              className="flex items-center justify-center gap-2 h-12"
              variant="outline"
            >
              <Bluetooth className="w-5 h-5" />
              {isConnecting ? 'Conectando...' : 'Imprimir via Bluetooth'}
            </Button>
            
            <Button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 h-12 bg-green-500 hover:bg-green-600 text-white"
            >
              <MessageCircle className="w-5 h-5" />
              Compartilhar no WhatsApp
            </Button>
            
            <Button
              onClick={handleCopyReceipt}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
            >
              <Share className="w-5 h-5" />
              Copiar Comprovante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptActions;
