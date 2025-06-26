
import { WebPlugin } from '@capacitor/core';
import type { MLKitPluginInterface, FaceDetection } from './MLKitPlugin';

export class MLKitPluginWeb extends WebPlugin implements MLKitPluginInterface {
  async detectFaces(options: { imageBase64: string }): Promise<{ faces: FaceDetection[] }> {
    console.log('ML Kit Web fallback - detectFaces called');
    
    // Simular detecção facial para web
    const mockFace: FaceDetection = {
      bounds: { left: 100, top: 100, right: 300, bottom: 300 },
      landmarks: {
        leftEye: { x: 150, y: 150 },
        rightEye: { x: 250, y: 150 },
        nose: { x: 200, y: 200 },
        mouth: { x: 200, y: 250 }
      },
      confidence: 0.95
    };

    return { faces: [mockFace] };
  }

  async captureWithFaceDetection(): Promise<{ imageBase64: string; faces: FaceDetection[] }> {
    console.log('ML Kit Web fallback - captureWithFaceDetection called');
    
    // Usar câmera web e simular detecção
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.srcObject = stream;
        video.play();
        
        video.onloadedmetadata = () => {
          setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0);
            
            const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            stream.getTracks().forEach(track => track.stop());
            
            const mockFace: FaceDetection = {
              bounds: { 
                left: video.videoWidth * 0.25, 
                top: video.videoHeight * 0.2, 
                right: video.videoWidth * 0.75, 
                bottom: video.videoHeight * 0.8 
              },
              confidence: 0.9
            };
            
            resolve({ imageBase64, faces: [mockFace] });
          }, 1000);
        };
      });
    } catch (error) {
      throw new Error('Falha ao acessar câmera: ' + error);
    }
  }
}
