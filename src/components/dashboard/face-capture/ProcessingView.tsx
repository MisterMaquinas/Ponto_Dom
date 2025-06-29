
import React from 'react';

interface ProcessingViewProps {
  mode: 'register' | 'verify';
}

const ProcessingView = ({ mode }: ProcessingViewProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">
          {mode === 'register' ? 'Registrando biometria...' : 'Verificando identidade...'}
        </h3>
        <p className="text-gray-600 text-sm">Aguarde o processamento</p>
      </div>
    </div>
  );
};

export default ProcessingView;
