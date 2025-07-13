import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

export const useBluetoothPrinter = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleBluetoothPrint = async (receiptText: string) => {
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
          filters: [
            { services: ['00001800-0000-1000-8000-00805f9b34fb'] }, // Generic Access
            { services: ['00001801-0000-1000-8000-00805f9b34fb'] }, // Generic Attribute  
            { namePrefix: 'Print' },
            { namePrefix: 'Thermal' },
            { namePrefix: 'Bluetooth' }
          ],
          optionalServices: [
            '00001800-0000-1000-8000-00805f9b34fb',
            '00001801-0000-1000-8000-00805f9b34fb',
            '0000180a-0000-1000-8000-00805f9b34fb'
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