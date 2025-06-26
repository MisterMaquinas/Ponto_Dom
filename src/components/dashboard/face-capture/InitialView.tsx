
import React from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from 'lucide-react';

interface InitialViewProps {
  onStart: () => void;
}

const InitialView = ({ onStart }: InitialViewProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Camera className="w-10 h-10 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Captura Facial
        </h3>
        <p className="text-gray-600 text-sm">
          Clique no botão abaixo para iniciar a captura
        </p>
      </div>
      <Button onClick={onStart} className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
        <Camera className="w-5 h-5 mr-2" />
        Iniciar Câmera
      </Button>
    </div>
  );
};

export default InitialView;
