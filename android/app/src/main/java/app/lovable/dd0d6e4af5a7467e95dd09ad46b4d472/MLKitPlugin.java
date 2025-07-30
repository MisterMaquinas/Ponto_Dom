package app.lovable.dd0d6e4af5a7467e95dd09ad46b4d472;

import android.Manifest;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.media.ExifInterface;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceDetection;
import com.google.mlkit.vision.face.FaceDetector;
import com.google.mlkit.vision.face.FaceDetectorOptions;
import com.google.mlkit.vision.face.FaceLandmark;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutionException;

@CapacitorPlugin(
    name = "MLKitPlugin",
    permissions = {
        @Permission(strings = {Manifest.permission.CAMERA}, alias = "camera")
    }
)
public class MLKitPlugin extends Plugin {
    
    private static final String TAG = "MLKitPlugin";
    private FaceDetector detector;
    private ProcessCameraProvider cameraProvider;
    private ImageCapture imageCapture;
    
    @Override
    public void load() {
        // Configurar o detector de faces com alta precisão
        FaceDetectorOptions options = new FaceDetectorOptions.Builder()
                .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
                .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
                .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
                .setMinFaceSize(0.15f)
                .enableTracking()
                .build();
        
        detector = FaceDetection.getClient(options);
    }
    
    @PluginMethod
    public void detectFaces(PluginCall call) {
        String imageBase64 = call.getString("imageBase64");
        
        if (imageBase64 == null) {
            call.reject("Imagem base64 é obrigatória");
            return;
        }
        
        try {
            // Decodificar base64 para bitmap
            byte[] decodedString = Base64.decode(imageBase64, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            
            if (bitmap == null) {
                call.reject("Falha ao decodificar imagem");
                return;
            }
            
            // Criar InputImage do ML Kit
            InputImage image = InputImage.fromBitmap(bitmap, 0);
            
            // Detectar faces
            detector.process(image)
                    .addOnSuccessListener(new OnSuccessListener<List<Face>>() {
                        @Override
                        public void onSuccess(List<Face> faces) {
                            JSObject result = new JSObject();
                            JSArray facesArray = new JSArray();
                            
                            for (Face face : faces) {
                                JSObject faceObj = createFaceObject(face);
                                facesArray.put(faceObj);
                            }
                            
                            result.put("faces", facesArray);
                            call.resolve(result);
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.e(TAG, "Erro na detecção de faces", e);
                            call.reject("Erro na detecção de faces: " + e.getMessage());
                        }
                    });
                    
        } catch (Exception e) {
            Log.e(TAG, "Erro ao processar imagem", e);
            call.reject("Erro ao processar imagem: " + e.getMessage());
        }
    }
    
    @PluginMethod
    public void captureWithFaceDetection(PluginCall call) {
        if (!hasRequiredPermissions()) {
            requestAllPermissions(call, "CAMERA_PERMISSION_CALLBACK");
            return;
        }
        
        try {
            // Inicializar câmera
            ListenableFuture<ProcessCameraProvider> cameraProviderFuture = 
                ProcessCameraProvider.getInstance(getContext());
            
            cameraProviderFuture.addListener(() -> {
                try {
                    cameraProvider = cameraProviderFuture.get();
                    startCamera(call);
                } catch (ExecutionException | InterruptedException e) {
                    Log.e(TAG, "Erro ao inicializar câmera", e);
                    call.reject("Erro ao inicializar câmera: " + e.getMessage());
                }
            }, ContextCompat.getMainExecutor(getContext()));
            
        } catch (Exception e) {
            Log.e(TAG, "Erro ao capturar com detecção facial", e);
            call.reject("Erro ao capturar: " + e.getMessage());
        }
    }
    
    private void startCamera(PluginCall call) {
        // Configurar preview
        Preview preview = new Preview.Builder().build();
        
        // Configurar captura de imagem
        imageCapture = new ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build();
        
        // Selecionar câmera frontal
        CameraSelector cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA;
        
        try {
            // Desvincular casos de uso antes de religar
            cameraProvider.unbindAll();
            
            // Vincular casos de uso à câmera
            Camera camera = cameraProvider.bindToLifecycle(
                    (LifecycleOwner) getActivity(),
                    cameraSelector,
                    preview,
                    imageCapture
            );
            
            // Capturar imagem
            captureImage(call);
            
        } catch (Exception e) {
            Log.e(TAG, "Erro ao iniciar câmera", e);
            call.reject("Erro ao iniciar câmera: " + e.getMessage());
        }
    }
    
    private void captureImage(PluginCall call) {
        if (imageCapture == null) {
            call.reject("Captura de imagem não inicializada");
            return;
        }
        
        // Criar arquivo temporário
        File outputFileOptions = new File(
                getContext().getExternalFilesDir(null),
                "temp_face_capture_" + System.currentTimeMillis() + ".jpg"
        );
        
        ImageCapture.OutputFileOptions outputOptions = new ImageCapture.OutputFileOptions.Builder(outputFileOptions).build();
        
        imageCapture.takePicture(
                outputOptions,
                ContextCompat.getMainExecutor(getContext()),
                new ImageCapture.OnImageSavedCallback() {
                    @Override
                    public void onImageSaved(@NonNull ImageCapture.OutputFileResults output) {
                        try {
                            // Converter para base64
                            Bitmap bitmap = BitmapFactory.decodeFile(outputFileOptions.getAbsolutePath());
                            String base64Image = bitmapToBase64(bitmap);
                            
                            // Detectar faces na imagem capturada
                            InputImage image = InputImage.fromBitmap(bitmap, 0);
                            detector.process(image)
                                    .addOnSuccessListener(faces -> {
                                        JSObject result = new JSObject();
                                        result.put("imageBase64", base64Image);
                                        
                                        JSArray facesArray = new JSArray();
                                        for (Face face : faces) {
                                            JSObject faceObj = createFaceObject(face);
                                            facesArray.put(faceObj);
                                        }
                                        result.put("faces", facesArray);
                                        
                                        // Limpar arquivo temporário
                                        outputFileOptions.delete();
                                        
                                        call.resolve(result);
                                    })
                                    .addOnFailureListener(e -> {
                                        Log.e(TAG, "Erro na detecção após captura", e);
                                        outputFileOptions.delete();
                                        call.reject("Erro na detecção: " + e.getMessage());
                                    });
                                    
                        } catch (Exception e) {
                            Log.e(TAG, "Erro ao processar imagem capturada", e);
                            outputFileOptions.delete();
                            call.reject("Erro ao processar: " + e.getMessage());
                        }
                    }
                    
                    @Override
                    public void onError(@NonNull ImageCaptureException exception) {
                        Log.e(TAG, "Erro na captura", exception);
                        call.reject("Erro na captura: " + exception.getMessage());
                    }
                }
        );
    }
    
    private JSObject createFaceObject(Face face) {
        JSObject faceObj = new JSObject();
        
        // Bounds da face
        Rect bounds = face.getBoundingBox();
        JSObject boundsObj = new JSObject();
        boundsObj.put("left", bounds.left);
        boundsObj.put("top", bounds.top);
        boundsObj.put("right", bounds.right);
        boundsObj.put("bottom", bounds.bottom);
        faceObj.put("bounds", boundsObj);
        
        // Landmarks
        JSObject landmarksObj = new JSObject();
        
        FaceLandmark leftEye = face.getLandmark(FaceLandmark.LEFT_EYE);
        if (leftEye != null) {
            JSObject leftEyeObj = new JSObject();
            leftEyeObj.put("x", leftEye.getPosition().x);
            leftEyeObj.put("y", leftEye.getPosition().y);
            landmarksObj.put("leftEye", leftEyeObj);
        }
        
        FaceLandmark rightEye = face.getLandmark(FaceLandmark.RIGHT_EYE);
        if (rightEye != null) {
            JSObject rightEyeObj = new JSObject();
            rightEyeObj.put("x", rightEye.getPosition().x);
            rightEyeObj.put("y", rightEye.getPosition().y);
            landmarksObj.put("rightEye", rightEyeObj);
        }
        
        FaceLandmark nose = face.getLandmark(FaceLandmark.NOSE_BASE);
        if (nose != null) {
            JSObject noseObj = new JSObject();
            noseObj.put("x", nose.getPosition().x);
            noseObj.put("y", nose.getPosition().y);
            landmarksObj.put("nose", noseObj);
        }
        
        FaceLandmark mouth = face.getLandmark(FaceLandmark.MOUTH_BOTTOM);
        if (mouth != null) {
            JSObject mouthObj = new JSObject();
            mouthObj.put("x", mouth.getPosition().x);
            mouthObj.put("y", mouth.getPosition().y);
            landmarksObj.put("mouth", mouthObj);
        }
        
        faceObj.put("landmarks", landmarksObj);
        
        // Confiança (tracking ID como proxy)
        faceObj.put("confidence", face.getTrackingId() != null ? 0.9f : 0.7f);
        
        return faceObj;
    }
    
    private String bitmapToBase64(Bitmap bitmap) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }
    
    private boolean hasRequiredPermissions() {
        return getPermissionState("camera") == com.getcapacitor.PermissionState.GRANTED;
    }
}