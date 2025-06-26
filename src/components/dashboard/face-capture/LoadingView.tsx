
import React from 'react';

const LoadingView = () => {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
      <p className="text-gray-600">Inicializando câmera...</p>
    </div>
  );
};

export default LoadingView;
