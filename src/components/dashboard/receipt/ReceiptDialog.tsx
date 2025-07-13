import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, Share, Bluetooth, MessageCircle } from 'lucide-react';
import ReceiptPreview from './ReceiptPreview';
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter';
import { useReceiptSharing } from '@/hooks/useReceiptSharing';

interface ReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receiptText: string;
}

const ReceiptDialog = ({ isOpen, onClose, receiptText }: ReceiptDialogProps) => {
  const { handleBluetoothPrint, isConnecting } = useBluetoothPrinter();
  const { handleWhatsAppShare, handleCopyReceipt } = useReceiptSharing();

  const handlePrint = async () => {
    await handleBluetoothPrint(receiptText);
    onClose();
  };

  const handleShare = () => {
    handleWhatsAppShare(receiptText);
    onClose();
  };

  const handleCopy = () => {
    handleCopyReceipt(receiptText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Opções do Comprovante
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <ReceiptPreview receiptText={receiptText} />
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handlePrint}
              disabled={isConnecting}
              className="flex items-center justify-center gap-2 h-12"
              variant="outline"
            >
              <Bluetooth className="w-5 h-5" />
              {isConnecting ? 'Conectando...' : 'Imprimir via Bluetooth'}
            </Button>
            
            <Button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 h-12 bg-green-500 hover:bg-green-600 text-white"
            >
              <MessageCircle className="w-5 h-5" />
              Compartilhar no WhatsApp
            </Button>
            
            <Button
              onClick={handleCopy}
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

export default ReceiptDialog;