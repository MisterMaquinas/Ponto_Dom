
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
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-80 object-cover"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Overlay de enquadramento */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-72 border-2 border-white/70 rounded-2xl relative">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
          </div>
        </div>

        {/* Contador */}
        {countdown && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{countdown}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
          Posicione seu rosto no centro
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onCapture} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          <Camera className="w-5 h-5 mr-2" />
          Capturar (3s)
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1 h-12">
          <X className="w-5 h-5 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
