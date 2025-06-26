
import React, { useState } from 'react';
import AdminManagement from './AdminManagement';
import MasterReports from './MasterReports';
import MasterSettings from './MasterSettings';
import MasterHeader from './master/MasterHeader';
import StatsOverview from './master/StatsOverview';
import CompaniesList from './master/CompaniesList';
import MasterActions from './master/MasterActions';
import { useMasterData } from './master/useMasterData';

interface MasterDashboardProps {
  userData: any;
  onLogout: () => void;
}

const MasterDashboard = ({ userData, onLogout }: MasterDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, companies, loading } = useMasterData();

  if (activeTab === 'admins') {
    return <AdminManagement onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'reports') {
    return <MasterReports onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  if (activeTab === 'settings') {
    return <MasterSettings onBack={() => setActiveTab('overview')} onLogout={onLogout} userData={userData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <MasterHeader userData={userData} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        ) : (
          <>
            <StatsOverview stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CompaniesList 
                companies={companies} 
                onAddCompany={() => setActiveTab('admins')} 
              />
              
              <MasterActions
                onAddCompany={() => setActiveTab('admins')}
                onViewReports={() => setActiveTab('reports')}
                onOpenSettings={() => setActiveTab('settings')}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MasterDashboard;
