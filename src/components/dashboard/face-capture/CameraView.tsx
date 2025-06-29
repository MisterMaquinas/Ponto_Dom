
import React from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  countdown: number | null;
  onCapture: () => void;
  onCancel: () => void;
}

const CameraView = ({ videoRef, countdown, onCapture, onCancel }: CameraViewProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <video 
          ref={videoRef}
          className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 transform scale-x-[-1]"
          autoPlay
          playsInline
          muted
        />
        
        {countdown && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="text-white text-6xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}
        
        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
          Câmera Ativa
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button 
          onClick={onCapture}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Camera className="w-4 h-4 mr-2" />
          Capturar Foto
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
