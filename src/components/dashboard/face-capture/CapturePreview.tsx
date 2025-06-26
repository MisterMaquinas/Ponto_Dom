
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from 'lucide-react';

interface CapturePreviewProps {
  capturedImage: string;
  onConfirm: () => void;
  onRetake: () => void;
}

const CapturePreview = ({ capturedImage, onConfirm, onRetake }: CapturePreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <img
          src={capturedImage}
          alt="Foto capturada"
          className="w-full h-80 object-cover rounded-lg border-2 border-gray-200"
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Foto capturada com sucesso!</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onConfirm} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          <Check className="w-5 h-5 mr-2" />
          Confirmar
        </Button>
        <Button onClick={onRetake} variant="outline" className="flex-1 h-12">
          <RotateCcw className="w-5 h-5 mr-2" />
          Refazer
        </Button>
      </div>
    </div>
  );
};

export default CapturePreview;
