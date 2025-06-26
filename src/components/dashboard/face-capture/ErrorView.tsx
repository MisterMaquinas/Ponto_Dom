
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
}

const ErrorView = ({ error, onRetry, onCancel }: ErrorViewProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-red-900 mb-2">Erro na Câmera</h3>
        <p className="text-red-600 text-sm mb-4">{error}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRetry} className="flex-1">
          Tentar Novamente
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default ErrorView;
