import React from 'react';
import SimpleProductivityReport from '../reports/SimpleProductivityReport';

interface ProductivityReportProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

const ProductivityReport = ({ onBack, onLogout, userData }: ProductivityReportProps) => {
  return (
    <SimpleProductivityReport 
      companyId={userData?.companyId}
    />
  );
};

export default ProductivityReport;