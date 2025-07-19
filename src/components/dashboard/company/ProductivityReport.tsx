import React from 'react';
import SimplifiedProductivityReport from '../reports/SimplifiedProductivityReport';

interface ProductivityReportProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const ProductivityReport = ({ onBack, onLogout, userData }: ProductivityReportProps) => {
  return (
    <SimplifiedProductivityReport 
      onBack={onBack} 
      onLogout={onLogout} 
      userData={userData} 
    />
  );
};

export default ProductivityReport;