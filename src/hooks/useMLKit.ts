
import { useState } from 'react';
import { useCapacitor } from './useCapacitor';
import MLKitPlugin, { type FaceDetection } from '../plugins/MLKitPlugin';
import { toast } from './use-toast';

export const useMLKit = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const { isNative } = useCapacitor();

  const captureWithFaceDetection = async (): Promise<{ imageBase64: string; faces: FaceDetection[] } | null> => {
    setIsProcessing(true);
    
    try {
      const result = await MLKitPlugin.captureWithFaceDetection();
      
      if (result.faces.length === 0) {
        toast({
          title: "Nenhum rosto detectado",
          description: "Tente novamente posicionando seu rosto na câmera",
          variant: "destructive",
        });
        return null;
      }

      if (result.faces.length > 1) {
        toast({
          title: "Múltiplos rostos detectados",
          description: "Certifique-se de que apenas uma pessoa esteja na frente da câmera",
          variant: "destructive",
        });
        return null;
      }

      const face = result.faces[0];
      if (face.confidence < 0.7) {
        toast({
          title: "Qualidade da detecção baixa",
          description: "Melhore a iluminação e tente novamente",
          variant: "destructive",
        });
        return null;
      }

      setFaces(result.faces);
      
      toast({
        title: "Rosto detectado com sucesso!",
        description: `Confiança: ${Math.round(face.confidence * 100)}%`,
      });

      return result;
    } catch (error) {
      console.error('Erro ML Kit:', error);
      toast({
        title: "Erro na detecção facial",
        description: isNative ? "Erro no ML Kit nativo" : "Erro na detecção web",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const detectFacesInImage = async (imageBase64: string): Promise<FaceDetection[]> => {
    setIsProcessing(true);
    
    try {
      const result = await MLKitPlugin.detectFaces({ imageBase64 });
      setFaces(result.faces);
      return result.faces;
    } catch (error) {
      console.error('Erro detecção facial:', error);
      toast({
        title: "Erro na análise",
        description: "Falha ao analisar a imagem",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    faces,
    captureWithFaceDetection,
    detectFacesInImage,
    isNativeMLKit: isNative
  };
};
