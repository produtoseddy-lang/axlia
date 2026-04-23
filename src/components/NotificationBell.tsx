import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificacoes } from "@/hooks/useNotificacoes";

export const NotificationBell = () => {
  const { items, naoLidas, marcarLida, marcarTodasLidas } = useNotificacoes();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative rounded-full">
          <Bell className="w-5 h-5" />
          {naoLidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[420px] overflow-y-auto p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="text-sm font-semibold">Notificações</div>
          {naoLidas > 0 && (
            <button
              onClick={marcarTodasLidas}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Marcar todas
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Sem notificações por agora.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.lida && marcarLida(n.id)}
                className={`w-full text-left p-3 hover:bg-muted/50 transition ${
                  !n.lida ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.lida && <span className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{n.titulo}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {n.mensagem}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.criado_em).toLocaleString("pt-PT", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
