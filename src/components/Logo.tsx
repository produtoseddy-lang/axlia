import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = ({ to = "/" }: { to?: string }) => (
  <Link to={to} className="flex items-center gap-2 group">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center glow-cyan group-hover:scale-105 transition">
      <Sparkles className="w-5 h-5 text-primary-foreground" />
    </div>
    <span className="text-xl font-bold tracking-tight">
      Estuda<span className="text-primary">MZ</span>
    </span>
  </Link>
);
