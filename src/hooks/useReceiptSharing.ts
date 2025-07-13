import { toast } from "@/hooks/use-toast";

export const useReceiptSharing = () => {
  const handleWhatsAppShare = (receiptText: string) => {
    const encodedText = encodeURIComponent(receiptText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp aberto",
      description: "Comprovante pronto para compartilhar",
    });
  };

  const fallbackCopy = (text: string) => {
    // Fallback para dispositivos que não suportam clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast({
        title: "Copiado!",
        description: "Comprovante copiado para a área de transferência",
      });
    } catch (err) {
      toast({
        title: "Comprovante gerado",
        description: "Visualize o comprovante acima",
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleCopyReceipt = (receiptText: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(receiptText).then(() => {
          toast({
            title: "Copiado!",
            description: "Comprovante copiado para a área de transferência",
          });
        }).catch((error) => {
          console.error('Erro ao copiar:', error);
          fallbackCopy(receiptText);
        });
      } else {
        fallbackCopy(receiptText);
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
      fallbackCopy(receiptText);
    }
  };

  return { handleWhatsAppShare, handleCopyReceipt };
};