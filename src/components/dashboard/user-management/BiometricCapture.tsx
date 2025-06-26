
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Check, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface BiometricCaptureProps {
  formData: { face_data?: string };
  setFormData: (data: any) => void;
}

const BiometricCapture = ({ formData, setFormData }: BiometricCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasFaceData, setHasFaceData] = useState(!!formData.face_data);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startFaceCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = 160;
        canvas.height = 120;
        context.drawImage(video, 0, 0, 160, 120);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, face_data: imageData });
        setHasFaceData(true);
        
        // Parar stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
        
        toast({
          title: "Sucesso",
          description: "Biometria facial capturada com sucesso",
        });
      }
    }
  };

  const cancelCapture = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const recapture = () => {
    setHasFaceData(false);
    setFormData({ ...formData, face_data: undefined });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Biometria Facial</h3>
      <div className="flex flex-col items-center space-y-4">
        {!isCapturing && !hasFaceData && (
          <Button
            type="button"
            onClick={startFaceCapture}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capturar Biometria Facial
          </Button>
        )}

        {isCapturing && (
          <div className="text-center space-y-4">
            <video
              ref={videoRef}
              className="w-80 h-60 border-2 border-gray-300 rounded-lg"
              autoPlay
              muted
            />
            <div className="flex gap-4 justify-center">
              <Button
                type="button"
                onClick={captureFace}
                className="bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Capturar
              </Button>
              <Button
                type="button"
                onClick={cancelCapture}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {hasFaceData && (
          <div className="text-center space-y-2">
            <Check className="w-8 h-8 text-green-500 mx-auto" />
            <p className="text-green-600 font-medium">Biometria facial capturada!</p>
            <Button
              type="button"
              onClick={recapture}
              variant="outline"
              size="sm"
            >
              Recapturar
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default BiometricCapture;
