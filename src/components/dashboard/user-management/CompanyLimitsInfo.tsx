
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';

interface CompanyLimitsInfoProps {
  availableRoles: { value: string; label: string }[];
  canCreateUser: (role: string) => boolean;
  getLimitMessage: (role: string) => string;
  limitsLoading: boolean;
}

const CompanyLimitsInfo = ({ 
  availableRoles, 
  canCreateUser, 
  getLimitMessage, 
  limitsLoading 
}: CompanyLimitsInfoProps) => {
  if (limitsLoading) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Limites da Empresa
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        {availableRoles.map(role => (
          <div key={role.value} className="flex items-center justify-between">
            <span className="text-blue-700">{role.label}:</span>
            <Badge 
              variant={canCreateUser(role.value) ? "default" : "destructive"}
              className="text-xs"
            >
              {getLimitMessage(role.value)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyLimitsInfo;
