import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Smartphone } from "lucide-react";

const DISMISS_KEY = "axl_pwa_banner_dismissed";

export const PWAInstallBanner = () => {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!isMobile) return;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Fallback: show banner anyway after 2s on mobile (iOS doesn't fire event)
    const t = setTimeout(() => setShow(true), 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(t);
    };
  }, []);

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setShow(false);
    } else {
      alert("Para instalar: abre o menu do browser → 'Adicionar ao ecrã principal'");
    }
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-primary/30 p-4 shadow-2xl">
      <div className="container max-w-3xl flex items-center gap-3">
        <Smartphone className="w-6 h-6 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">📱 Instala o AXL IA</p>
          <p className="text-xs text-muted-foreground">Acede mais rápido no teu telemóvel</p>
        </div>
        <Button size="sm" onClick={install} className="bg-primary text-primary-foreground">Instalar</Button>
        <Button size="icon" variant="ghost" onClick={dismiss} className="shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
