import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

export const useBluetoothPrinter = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleBluetoothPrint = async (receiptText: string) => {
    setIsConnecting(true);
    
    try {
      // Verificar se o navegador suporta Web Bluetooth
      if (!('bluetooth' in navigator)) {
        toast({
          title: "Bluetooth não disponível",
          description: "Seu dispositivo ou navegador não suporta impressão Bluetooth. Use 'Compartilhar no WhatsApp' ou 'Copiar Comprovante'.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Conectando...",
        description: "Procurando impressoras Bluetooth...",
      });

      // Tentar conectar via Web Bluetooth API
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb', // Serial Port Service
            '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
            '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // HM-10 Service
          ]
        });
        
        console.log('Dispositivo selecionado:', device.name);
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

  return { handleBluetoothPrint, isConnecting };
};