
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface PunchRecord {
  id: string;
  user_id: string;
  name: string;
  date: string;
  entry_time: string;
  exit_time?: string;
  status: 'complete' | 'incomplete' | 'late';
  confidence_score?: number;
}

interface ReportsStatsProps {
  punchRecords: PunchRecord[];
}

const ReportsStats = ({ punchRecords }: ReportsStatsProps) => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {punchRecords.length > 0 ? '100%' : '0%'}
          </div>
          <div className="text-sm text-gray-600">Taxa de Reconhecimento</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {punchRecords.length}
          </div>
          <div className="text-sm text-gray-600">Registros Hoje</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {punchRecords.filter(r => r.confidence_score && r.confidence_score >= 0.9).length}
          </div>
          <div className="text-sm text-gray-600">Alta Confiança ({'>'}90%)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsStats;
