import React from 'react';
import SimpleProductivityReport from './SimpleProductivityReport';

interface ProductivityReportProps {
  onBack: () => void;
}

const ProductivityReport = ({ onBack }: ProductivityReportProps) => {
  return (
    <SimpleProductivityReport />
  );
};

export default ProductivityReport;