
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, Settings } from 'lucide-react';

interface CompanyStats {
  totalCompanies: number;
  totalAdmins: number;
  totalEmployees: number;
  activeCompanies: number;
}

interface StatsOverviewProps {
  stats: CompanyStats;
}

const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const statsData = [
    { title: 'Total de Empresas', value: stats.totalCompanies.toString(), icon: Building, color: 'from-purple-500 to-purple-600' },
    { title: 'Administradores', value: stats.totalAdmins.toString(), icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Funcionários Totais', value: stats.totalEmployees.toString(), icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Empresas Ativas', value: stats.activeCompanies.toString(), icon: Settings, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
