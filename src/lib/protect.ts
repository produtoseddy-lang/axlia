// Camada básica de protecção contra cópia/inspecção casual.
// Nota: nenhum script no browser impede um utilizador determinado de ver o código —
// o front-end é sempre público. A segurança real vive no backend (RLS, edge functions, secrets).

export const enableClientProtection = () => {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) return; // não estorvar o desenvolvimento

  // Desactivar menu de contexto (clique direito)
  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  // Bloquear atalhos comuns de DevTools / view-source / save
  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key?.toLowerCase();

    // F12
    if (key === "f12") {
      e.preventDefault();
      return;
    }

    // Ctrl/Cmd + U  (view source)
    // Ctrl/Cmd + S  (save page)
    if ((e.ctrlKey || e.metaKey) && (key === "u" || key === "s")) {
      e.preventDefault();
      return;
    }

    // Ctrl/Cmd + Shift + I / J / C  (DevTools / console / inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) {
      e.preventDefault();
      return;
    }
  };

  // Bloquear arrastar imagens
  const onDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.tagName === "IMG") e.preventDefault();
  };

  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("dragstart", onDragStart);
};
