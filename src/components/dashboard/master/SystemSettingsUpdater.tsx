
import { useState } from 'react';
import SystemSettings from './SystemSettings';
import BranchManagement from './BranchManagement';
import SystemLogs from './SystemLogs';
import SystemSettingsManager from './SystemSettingsManager';
import DatabaseSettings from './DatabaseSettings';
import SecuritySettings from './SecuritySettings';

interface SystemSettingsUpdaterProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const SystemSettingsUpdater = ({ onBack, onLogout, userData }: SystemSettingsUpdaterProps) => {
  const [currentView, setCurrentView] = useState('main');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    if (currentView === 'main') {
      onBack();
    } else {
      setCurrentView('main');
    }
  };

  switch (currentView) {
    case 'branches':
      return (
        <BranchManagement
          onBack={handleBack}
          onLogout={onLogout}
          userData={userData}
        />
      );
    case 'logs':
      return (
        <SystemLogs
          onBack={handleBack}
          onLogout={onLogout}
          userData={userData}
        />
      );
    case 'settings':
      return (
        <SystemSettingsManager
          onBack={handleBack}
          onLogout={onLogout}
          userData={userData}
        />
      );
    case 'database':
      return (
        <DatabaseSettings
          onBack={handleBack}
          onLogout={onLogout}
          userData={userData}
        />
      );
    case 'security':
      return (
        <SecuritySettings
          onBack={handleBack}
          onLogout={onLogout}
          userData={userData}
        />
      );
    case 'user-limits':
      return (
        <CompanyLimitsManager
          onBack={handleBack}
          onLogout={onLogout}
          userData={userData}
        />
      );
    default:
      return (
        <SystemSettingsWithNavigation
          onBack={onBack}
          onLogout={onLogout}
          userData={userData}
          onNavigate={handleNavigate}
        />
      );
  }
};

// Componente atualizado do SystemSettings original
const SystemSettingsWithNavigation = ({ onBack, onLogout, userData, onNavigate }: any) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                ← Voltar
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administrar Sistema</h1>
                <p className="text-gray-600">Configurações gerais do sistema</p>
              </div>
            </div>
            <button onClick={onLogout} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card para Gerenciar Filiais */}
          <div className="bg-white border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-blue-600">🏢</div>
              <h3 className="text-lg font-semibold">Gerenciar Filiais</h3>
            </div>
            <p className="text-gray-600 mb-4">Cadastre e gerencie filiais das empresas</p>
            <button
              onClick={() => onNavigate('branches')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Gerenciar Filiais
            </button>
          </div>

          {/* Card para Logs do Sistema */}
          <div className="bg-white border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-purple-600">📋</div>
              <h3 className="text-lg font-semibold">Logs do Sistema</h3>
            </div>
            <p className="text-gray-600 mb-4">Visualize o histórico de ações do sistema</p>
            <button
              onClick={() => onNavigate('logs')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
            >
              Ver Logs
            </button>
          </div>

          {/* Card para Configurações Globais */}
          <div className="bg-white border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-green-600">⚙️</div>
              <h3 className="text-lg font-semibold">Configurações Globais</h3>
            </div>
            <p className="text-gray-600 mb-4">Gerencie configurações do sistema</p>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Configurar Sistema
            </button>
          </div>

          {/* Card para Configurações do Banco - HABILITADO */}
          <div className="bg-white border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-blue-600">💾</div>
              <h3 className="text-lg font-semibold">Configurações do Banco</h3>
            </div>
            <p className="text-gray-600 mb-4">Gerenciar configurações do banco de dados</p>
            <button 
              onClick={() => onNavigate('database')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Configurar Banco
            </button>
          </div>

          {/* Card para Segurança - HABILITADO */}
          <div className="bg-white border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-red-600">🛡️</div>
              <h3 className="text-lg font-semibold">Segurança</h3>
            </div>
            <p className="text-gray-600 mb-4">Configurações de segurança do sistema</p>
            <button 
              onClick={() => onNavigate('security')}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Configurar Segurança
            </button>
          </div>

          {/* Card para Limites de Usuários - HABILITADO */}
          <div className="bg-white border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-green-600">👥</div>
              <h3 className="text-lg font-semibold">Limites de Usuários</h3>
            </div>
            <p className="text-gray-600 mb-4">Definir limites padrão por empresa</p>
            <button 
              onClick={() => onNavigate('user-limits')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Configurar Limites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente temporário para Limites de Usuários
const CompanyLimitsManager = ({ onBack, onLogout, userData }: any) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                ← Voltar
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Limites de Usuários</h1>
                <p className="text-gray-600">Configure limites padrão para empresas</p>
              </div>
            </div>
            <button onClick={onLogout} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Limites Padrão por Tipo de Usuário</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Administradores
                </label>
                <input 
                  type="number" 
                  defaultValue="1" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Gerentes
                </label>
                <input 
                  type="number" 
                  defaultValue="5" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Supervisores
                </label>
                <input 
                  type="number" 
                  defaultValue="10" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Funcionários
                </label>
                <input 
                  type="number" 
                  defaultValue="50" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded">
              Salvar Configurações
            </button>
            <button 
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsUpdater;
