
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from 'lucide-react';

interface CapturedViewProps {
  capturedImage: string;
  mode: 'register' | 'verify';
  isVerifying: boolean;
  onConfirm: () => void;
  onRetake: () => void;
}

const CapturedView = ({ capturedImage, mode, isVerifying, onConfirm, onRetake }: CapturedViewProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <img
          src={capturedImage}
          alt="Foto capturada"
          className="w-full h-64 object-cover rounded border"
        />
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
          <Check className="w-3 h-3" />
          Capturado
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onConfirm} 
          className="flex-1 h-12 bg-green-600 hover:bg-green-700"
          disabled={isVerifying}
        >
          <Check className="w-4 h-4 mr-2" />
          {mode === 'register' ? 'Registrar' : 'Verificar'}
        </Button>
        <Button onClick={onRetake} variant="outline" className="flex-1 h-12" disabled={isVerifying}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refazer
        </Button>
      </div>
    </div>
  );
};

export default CapturedView;
