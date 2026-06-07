import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Smartphone, Share, Plus, MoreVertical } from "lucide-react";

const DISMISS_KEY = "axl_pwa_banner_dismissed";

type Platform = "android" | "ios" | "other";

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
};

export const PWAInstallBanner = () => {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!isMobile) return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;
    if (isStandalone) return;

    const p = detectPlatform();
    setPlatform(p);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS / outros browsers nunca disparam o evento — mostrar banner manualmente
    const t = setTimeout(() => setShow(true), 1500);

    const installed = () => {
      sessionStorage.setItem(DISMISS_KEY, "1");
      setShow(false);
    };
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
      clearTimeout(t);
    };
  }, []);

  const install = async () => {
    if (deferred) {
      try {
        deferred.prompt();
        const choice = await deferred.userChoice;
        setDeferred(null);
        if (choice?.outcome === "accepted") {
          sessionStorage.setItem(DISMISS_KEY, "1");
        }
        setShow(false);
      } catch {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <>
      {show && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-primary/30 p-4 shadow-2xl">
          <div className="container max-w-3xl flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">📱 Instala o AXL IA</p>
              <p className="text-xs text-muted-foreground">
                Acede mais rápido no teu telemóvel
              </p>
            </div>
            <Button
              size="sm"
              onClick={install}
              className="bg-primary text-primary-foreground hover:bg-primary-glow"
            >
              Instalar
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={dismiss}
              className="shrink-0"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-2">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>Instalar AXL IA no teu ecrã inicial</DialogTitle>
            <DialogDescription>
              {platform === "ios"
                ? "Em poucos segundos no Safari:"
                : platform === "android"
                ? "Em poucos segundos no Chrome:"
                : "Em poucos segundos no teu browser:"}
            </DialogDescription>
          </DialogHeader>

          {platform === "ios" ? (
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="flex-1">
                  Toca no botão <Share className="inline w-4 h-4 -mt-0.5" />{" "}
                  <strong>Partilhar</strong> na barra inferior do Safari.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="flex-1">
                  Escolhe <Plus className="inline w-4 h-4 -mt-0.5" />{" "}
                  <strong>Adicionar ao Ecrã Principal</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="flex-1">
                  Confirma em <strong>Adicionar</strong> no canto superior direito.
                </span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="flex-1">
                  Abre o menu <MoreVertical className="inline w-4 h-4 -mt-0.5" />{" "}
                  do browser (canto superior direito).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="flex-1">
                  Toca em <strong>Instalar app</strong> ou{" "}
                  <strong>Adicionar ao ecrã principal</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="flex-1">Confirma a instalação.</span>
              </li>
            </ol>
          )}

          <Button
            onClick={() => setShowInstructions(false)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary-glow"
          >
            Percebi
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
