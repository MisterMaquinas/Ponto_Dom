
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import PunchRecordsTable from './reports/PunchRecordsTable';
import BiometricVerificationTable from './reports/BiometricVerificationTable';
import ReportsStats from './reports/ReportsStats';
import ReportsHeader from './reports/ReportsHeader';

interface ReportsProps {
  onBack: () => void;
  onLogout?: () => void;
  userType?: string;
  userData?: any;
  companyId?: string;
}

const Reports = ({ onBack, onLogout, userType, userData, companyId }: ReportsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {onLogout && userData ? (
        <ReportsHeader 
          onBack={onBack}
          onLogout={onLogout}
          userData={userData}
        />
      ) : (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios</h1>
                <p className="text-gray-600">Visualize relatórios de ponto e frequência</p>
              </div>
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              onClick={() => setActiveTab('overview')}
              variant={activeTab === 'overview' ? 'default' : 'outline'}
            >
              Visão Geral
            </Button>
            <Button
              onClick={() => setActiveTab('punch-records')}
              variant={activeTab === 'punch-records' ? 'default' : 'outline'}
            >
              Registros de Ponto
            </Button>
            <Button
              onClick={() => setActiveTab('biometric')}
              variant={activeTab === 'biometric' ? 'default' : 'outline'}
            >
              Verificações Biométricas
            </Button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <ReportsStats companyId={companyId || userData?.companyId} />
            <div className="mt-8">
              <PunchRecordsTable companyId={companyId || userData?.companyId} />
            </div>
          </>
        )}

        {activeTab === 'punch-records' && (
          <PunchRecordsTable companyId={companyId || userData?.companyId} />
        )}

        {activeTab === 'biometric' && (
          <BiometricVerificationTable companyId={companyId || userData?.companyId} />
        )}
      </div>
    </div>
  );
};

export default Reports;
