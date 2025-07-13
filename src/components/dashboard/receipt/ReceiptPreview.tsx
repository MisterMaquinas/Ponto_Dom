import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ReceiptPreviewProps {
  receiptText: string;
}

const ReceiptPreview = ({ receiptText }: ReceiptPreviewProps) => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="text-sm text-gray-700 whitespace-pre-line font-mono">
          {receiptText}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptPreview;