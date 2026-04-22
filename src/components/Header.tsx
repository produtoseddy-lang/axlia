import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, LayoutDashboard, Crown, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isPremium } = useProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Logo to={user ? "/dashboard" : "/"} />

        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition">Dashboard</Link>
              <Link to="/resolver" className="text-sm text-muted-foreground hover:text-primary transition">Resolver TPC</Link>
              {!isPremium && (
                <Link to="/premium" className="text-sm text-primary hover:text-primary-glow transition flex items-center gap-1">
                  <Crown className="w-4 h-4" /> Premium
                </Link>
              )}
            </>
          ) : (
            <>
              <a href="/#como-funciona" className="text-sm text-muted-foreground hover:text-primary transition">Como funciona</a>
              <a href="/#planos" className="text-sm text-muted-foreground hover:text-primary transition">Planos</a>
              <a href="/#faq" className="text-sm text-muted-foreground hover:text-primary transition">FAQ</a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xs font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <ShieldCheck className="w-4 h-4 mr-2" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/premium")}>
                  <Crown className="w-4 h-4 mr-2" /> Premium
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Entrar</Button>
              <Button variant="default" size="sm" onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary-glow">
                Começar Grátis
              </Button>
            </>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-3 flex flex-col gap-3">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm py-1">Dashboard</Link>
                <Link to="/resolver" onClick={() => setOpen(false)} className="text-sm py-1">Resolver TPC</Link>
                <Link to="/premium" onClick={() => setOpen(false)} className="text-sm py-1 text-primary">Premium</Link>
              </>
            ) : (
              <>
                <a href="/#como-funciona" onClick={() => setOpen(false)} className="text-sm py-1">Como funciona</a>
                <a href="/#planos" onClick={() => setOpen(false)} className="text-sm py-1">Planos</a>
                <a href="/#faq" onClick={() => setOpen(false)} className="text-sm py-1">FAQ</a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
