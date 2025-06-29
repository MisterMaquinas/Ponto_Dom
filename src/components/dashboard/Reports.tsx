
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
  onLogout: () => void;
  userType: string;
  userData: any;
}

const Reports = ({ onBack, onLogout, userType, userData }: ReportsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ReportsHeader 
        onBack={onBack}
        onLogout={onLogout}
        userData={userData}
      />

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
            <ReportsStats companyId={userData?.companyId} />
            <div className="mt-8">
              <PunchRecordsTable companyId={userData?.companyId} />
            </div>
          </>
        )}

        {activeTab === 'punch-records' && (
          <PunchRecordsTable companyId={userData?.companyId} />
        )}

        {activeTab === 'biometric' && (
          <BiometricVerificationTable companyId={userData?.companyId} />
        )}
      </div>
    </div>
  );
};

export default Reports;
