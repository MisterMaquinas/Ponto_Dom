
import React, { useState } from 'react';
import { DialogTrigger } from "@/components/ui/dialog";
import { Printer } from 'lucide-react';
import ReceiptDialog from './receipt/ReceiptDialog';
import { useReceiptGeneration } from '@/hooks/useReceiptGeneration';

interface ReceiptActionsProps {
  punchData: {
    name: string;
    timestamp: string;
    hash: string;
    position?: string;
    branch?: string;
    confidence?: number;
    type?: string;
  };
}

const ReceiptActions = ({ punchData }: ReceiptActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { generateReceiptText } = useReceiptGeneration();

  const receiptText = generateReceiptText(punchData);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center text-green-600 hover:text-green-700 transition-colors cursor-pointer"
      >
        <Printer className="w-4 h-4 mr-1" />
        <span className="text-xs underline">Comprovante impresso</span>
      </button>
      
      <ReceiptDialog 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        receiptText={receiptText}
      />
    </>
  );
};

export default ReceiptActions;
