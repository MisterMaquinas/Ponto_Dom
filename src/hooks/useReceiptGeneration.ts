interface PunchData {
  name: string;
  timestamp: string;
  hash: string;
  position?: string;
  branch?: string;
  confidence?: number;
  type?: string;
}

export const useReceiptGeneration = () => {
  const generateReceiptText = (punchData: PunchData) => {
    const date = new Date(punchData.timestamp);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR');
    
    const getActionType = (type?: string) => {
      switch (type) {
        case 'entrada': return 'ENTRADA';
        case 'saida': return 'SAÍDA';
        case 'intervalo_inicio': return 'SAÍDA (INTERVALO)';
        case 'intervalo_fim': return 'VOLTA (INTERVALO)';
        default: return type ? type.toUpperCase() : 'ENTRADA';
      }
    };
    
    return `
COMPROVANTE DE PONTO
════════════════════
Funcionário: ${punchData.name}${punchData.position ? `\nCargo: ${punchData.position}` : ''}${punchData.branch ? `\nFilial: ${punchData.branch}` : ''}
Ação: ${getActionType(punchData.type)}
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