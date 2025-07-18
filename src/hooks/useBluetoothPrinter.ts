import { useState } from 'react';
import { toast } from "@/hooks/use-toast";

// Comandos ESC/POS para impressoras térmicas
const ESC_POS = {
  INIT: '\x1B\x40',           // Inicializar impressora
  ALIGN_CENTER: '\x1B\x61\x01', // Centralizar
  ALIGN_LEFT: '\x1B\x61\x00',   // Alinhar à esquerda
  BOLD_ON: '\x1B\x45\x01',      // Negrito ligado
  BOLD_OFF: '\x1B\x45\x00',     // Negrito desligado
  FEED_LINE: '\x0A',            // Nova linha
  CUT_PAPER: '\x1D\x56\x00',    // Cortar papel
  DOUBLE_HEIGHT: '\x1B\x21\x10', // Altura dupla
  NORMAL_SIZE: '\x1B\x21\x00',   // Tamanho normal
};

export const useBluetoothPrinter = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Converter texto para comandos ESC/POS
  const formatReceiptForPrinter = (receiptText: string): Uint8Array => {
    let escPosData = '';
    
    // Inicializar impressora
    escPosData += ESC_POS.INIT;
    
    // Dividir texto em linhas e formatar
    const lines = receiptText.split('\n');
    
    lines.forEach((line, index) => {
      // Cabeçalho (primeiras linhas)
      if (index < 3) {
        escPosData += ESC_POS.ALIGN_CENTER;
        escPosData += ESC_POS.BOLD_ON;
        escPosData += line;
        escPosData += ESC_POS.BOLD_OFF;
      } 
      // Linhas com dados importantes (confiança, hash, etc)
      else if (line.includes('Confiança:') || line.includes('Hash:') || line.includes('Funcionário:')) {
        escPosData += ESC_POS.ALIGN_LEFT;
        escPosData += ESC_POS.BOLD_ON;
        escPosData += line;
        escPosData += ESC_POS.BOLD_OFF;
      }
      // Linhas normais
      else {
        escPosData += ESC_POS.ALIGN_LEFT;
        escPosData += line;
      }
      
      escPosData += ESC_POS.FEED_LINE;
    });
    
    // Adicionar espaços e cortar papel
    escPosData += ESC_POS.FEED_LINE + ESC_POS.FEED_LINE;
    escPosData += ESC_POS.CUT_PAPER;
    
    // Converter string para Uint8Array
    return new TextEncoder().encode(escPosData);
  };

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
        description: "Procurando impressoras Bluetooth ESC/POS...",
      });

      // Tentar conectar via Web Bluetooth API com filtros para impressoras ESC/POS
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Serial Port Service
            { namePrefix: 'POS' },
            { namePrefix: 'Printer' },
            { namePrefix: 'BT' },
          ],
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb', // Serial Port Service
            '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
            '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // HM-10 Service
          ]
        });
        
        console.log('Dispositivo selecionado:', device.name);
        
        // Conectar ao dispositivo
        const server = await device.gatt?.connect();
        if (!server) {
          throw new Error('Não foi possível conectar ao servidor GATT');
        }

        // Buscar serviço de comunicação serial
        const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
          .catch(() => server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb'))
          .catch(() => server.getPrimaryService('49535343-fe7d-4ae5-8fa9-9fafd205e455'));

        if (!service) {
          throw new Error('Serviço de impressão não encontrado');
        }

        // Buscar característica de escrita
        const characteristic = await service.getCharacteristic('000018f1-0000-1000-8000-00805f9b34fb')
          .catch(() => service.getCharacteristic('00002a00-0000-1000-8000-00805f9b34fb'))
          .catch(() => service.getCharacteristic('49535343-1e4d-4bd9-ba61-23c647249616'));

        if (!characteristic) {
          throw new Error('Característica de escrita não encontrada');
        }

        // Formatar dados para ESC/POS
        const escPosData = formatReceiptForPrinter(receiptText);
        
        // Enviar dados em chunks para evitar problemas de tamanho
        const chunkSize = 20; // Tamanho do chunk para envio
        for (let i = 0; i < escPosData.length; i += chunkSize) {
          const chunk = escPosData.slice(i, i + chunkSize);
          await characteristic.writeValue(chunk);
          // Pequeno delay entre chunks
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log('Dados ESC/POS enviados:', escPosData);
        
        toast({
          title: "Impresso com sucesso!",
          description: `Comprovante enviado para ${device.name}`,
        });

        // Desconectar após impressão
        setTimeout(() => {
          server.disconnect();
        }, 1000);

      } catch (bluetoothError: any) {
        console.log('Erro Bluetooth específico:', bluetoothError);
        
        if (bluetoothError.name === 'NotFoundError') {
          toast({
            title: "Impressora não encontrada",
            description: "Certifique-se de que a impressora ESC/POS está ligada e em modo de pareamento.",
            variant: "destructive",
          });
        } else if (bluetoothError.name === 'SecurityError') {
          toast({
            title: "Permissão negada",
            description: "Permita o acesso ao Bluetooth nas configurações do navegador.",
            variant: "destructive",
          });
        } else if (bluetoothError.name === 'NotSupportedError') {
          toast({
            title: "Bluetooth não suportado",
            description: "Este dispositivo não suporta Web Bluetooth API.",
            variant: "destructive",
          });
        } else {
          throw new Error(`Erro Bluetooth: ${bluetoothError.message}`);
        }
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast({
        title: "Erro na impressão",
        description: "Não foi possível conectar à impressora Bluetooth ESC/POS",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return { handleBluetoothPrint, isConnecting };
};