import React from 'react';
import SimplifiedProductivityReport from './SimplifiedProductivityReport';

interface ProductivityReportProps {
  onBack: () => void;
}

const ProductivityReport = ({ onBack }: ProductivityReportProps) => {
  return (
    <SimplifiedProductivityReport onBack={onBack} />
  );
};

export default ProductivityReport;