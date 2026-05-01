import { Link } from "react-router-dom";
import logo from "@/assets/axl-logo.png";

export const Logo = ({ to = "/" }: { to?: string }) => (
  <Link to={to} className="flex items-center gap-2 group">
    <img
      src={logo}
      alt="AXL IA"
      className="w-9 h-9 rounded-xl object-cover group-hover:scale-105 transition"
    />
    <span className="text-xl font-bold tracking-tight">
      AXL <span className="text-primary">IA</span>
    </span>
  </Link>
);
