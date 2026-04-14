/**
 * Handlers padrão para botões recorrentes na plataforma
 * Reutilizável em múltiplos componentes para evitar duplicação
 */

export const handleCopyToClipboard = async (text: string, label: string = "Link") => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, message: `✅ ${label} copiado para a área de transferência!` };
  } catch (error) {
    return { success: false, message: `❌ Erro ao copiar ${label}` };
  }
};

export const handleDownload = (content: string, filename: string, type: string = "text/plain") => {
  try {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return { success: true, message: `✅ Download iniciado: ${filename}` };
  } catch (error) {
    return { success: false, message: `❌ Erro ao fazer download` };
  }
};

export const handleOpenmailto = (email: string, subject: string = "") => {
  const mailtoLink = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  window.location.href = mailtoLink;
  return { success: true, message: `📧 Cliente de email aberto` };
};

export const handleOpenWhatsapp = (text: string) => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, "_blank");
  return { success: true, message: `💬 WhatsApp Web aberto` };
};

export const handlePrint = () => {
  window.print();
  return { success: true, message: `🖨️ Abrindo impressora...` };
};

export const handleShareLink = async (url: string, title: string) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return { success: true, message: `✅ Compartilhado!` };
    } catch (error) {
      return { success: false, message: `❌ Erro ao compartilhar` };
    }
  } else {
    // Fallback para copiar link
    return handleCopyToClipboard(url, title);
  }
};

export const getActionConfirmation = (action: string): string => {
  const confirmations: Record<string, string> = {
    delete: "Tem certeza que deseja excluir?",
    archive: "Tem certeza que deseja arquivar?",
    publish: "Deseja publicar agora?",
    send: "Deseja enviar?",
  };
  return confirmations[action] || "Confirma esta ação?";
};
