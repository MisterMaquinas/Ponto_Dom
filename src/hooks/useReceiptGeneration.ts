interface PunchData {
  name: string;
  timestamp: string;
  hash: string;
  position?: string;
  branch?: string;
  confidence?: number;
}

export const useReceiptGeneration = () => {
  const generateReceiptText = (punchData: PunchData) => {
    const date = new Date(punchData.timestamp);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR');
    
    return `
COMPROVANTE DE PONTO
════════════════════
Funcionário: ${punchData.name}${punchData.position ? `\nCargo: ${punchData.position}` : ''}${punchData.branch ? `\nFilial: ${punchData.branch}` : ''}
Data: ${formattedDate}
Horário: ${formattedTime}${punchData.confidence ? `\nConfiança: ${punchData.confidence}%` : ''}
Hash: ${punchData.hash}
════════════════════
Este comprovante é válido para
fins de controle de ponto.
Guarde-o para eventuais
consultas ou esclarecimentos.
    `.trim();
  };

  return { generateReceiptText };
};