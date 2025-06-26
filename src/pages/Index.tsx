
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import SupervisorDashboard from '@/components/dashboard/SupervisorDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';
import MasterDashboard from '@/components/dashboard/MasterDashboard';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = (userType: string, userData: any) => {
    setCurrentUser({ type: userType, ...userData });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  switch (currentUser.type) {
    case 'master':
      return <MasterDashboard userData={currentUser} onLogout={handleLogout} />;
    case 'admin':
      return <AdminDashboard userData={currentUser} onLogout={handleLogout} />;
    case 'manager':
      return <ManagerDashboard userData={currentUser} onLogout={handleLogout} />;
    case 'supervisor':
      return <SupervisorDashboard userData={currentUser} onLogout={handleLogout} />;
    case 'user':
      return <UserDashboard userData={currentUser} onLogout={handleLogout} />;
    default:
      return <LoginForm onLogin={handleLogin} />;
  }
};

export default Index;
