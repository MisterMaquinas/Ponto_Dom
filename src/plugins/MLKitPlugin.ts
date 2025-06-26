
import { registerPlugin } from '@capacitor/core';

export interface MLKitPluginInterface {
  detectFaces(options: { imageBase64: string }): Promise<{ faces: FaceDetection[] }>;
  captureWithFaceDetection(): Promise<{ imageBase64: string; faces: FaceDetection[] }>;
}

export interface FaceDetection {
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  landmarks?: {
    leftEye?: { x: number; y: number };
    rightEye?: { x: number; y: number };
    nose?: { x: number; y: number };
    mouth?: { x: number; y: number };
  };
  confidence: number;
}

const MLKitPlugin = registerPlugin<MLKitPluginInterface>('MLKitPlugin', {
  web: () => import('./MLKitPluginWeb').then(m => new m.MLKitPluginWeb()),
});

export default MLKitPlugin;
