import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Crown, Activity, DollarSign } from "lucide-react";

const Admin = () => {
  const { isAdmin, loading } = useProfile();
  const [stats, setStats] = useState({ alunos: 0, premium: 0, sessoesHoje: 0, pagamentos: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [pagamentos, setPagamentos] = useState<any[]>([]);

  const load = async () => {
    const [{ data: u }, { data: p }] = await Promise.all([
      supabase.from("profiles").select("*").order("criado_em", { ascending: false }),
      supabase.from("pagamentos").select("*").order("criado_em", { ascending: false }),
    ]);
    setUsers(u ?? []);
    setPagamentos(p ?? []);

    const today = new Date().toISOString().slice(0, 10);
    const { count: sHoje } = await supabase
      .from("sessoes")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", `${today}T00:00:00Z`);

    setStats({
      alunos: u?.length ?? 0,
      premium: u?.filter((x) => x.plano === "premium").length ?? 0,
      sessoesHoje: sHoje ?? 0,
      pagamentos: p?.filter((x) => x.status === "aprovado").length ?? 0,
    });
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const aprovar = async (id: string, user_id: string) => {
    const novoAte = new Date(); novoAte.setDate(novoAte.getDate() + 30);
    await supabase.from("pagamentos").update({ status: "aprovado" }).eq("id", id);
    await supabase.from("profiles").update({ plano: "premium", premium_ate: novoAte.toISOString().slice(0, 10) }).eq("id", user_id);
    await supabase.from("notificacoes").insert({
      user_id,
      titulo: "🎉 Premium activado!",
      mensagem: "Bom estudo! Aproveita todos os recursos sem limites.",
      tipo: "recompensa",
    });
    toast.success("Pagamento aprovado");
    load();
  };

  const rejeitar = async (id: string, user_id: string) => {
    await supabase.from("pagamentos").update({ status: "rejeitado" }).eq("id", id);
    await supabase.from("notificacoes").insert({
      user_id,
      titulo: "❌ Pagamento não confirmado",
      mensagem: "Não conseguimos confirmar o teu pagamento. Contacta o suporte no WhatsApp para resolvermos.",
      tipo: "sistema",
    });
    toast.success("Pagamento rejeitado");
    load();
  };

  const cards = [
    { icon: Users, label: "Total Alunos", value: stats.alunos },
    { icon: Crown, label: "Premium", value: stats.premium },
    { icon: Activity, label: "Sessões Hoje", value: stats.sessoesHoje },
    { icon: DollarSign, label: "Pagamentos OK", value: stats.pagamentos },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="container max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Painel Admin</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="bg-card border border-border rounded-2xl p-5 card-glow">
                <c.icon className="w-5 h-5 text-primary mb-2" />
                <div className="text-2xl font-bold">{c.value}</div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-3">Utilizadores</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Plano</th>
                    <th className="text-left p-3">Créditos</th>
                    <th className="text-left p-3">Premium até</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="p-3">{u.nome}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3"><Badge className={u.plano === "premium" ? "bg-primary text-primary-foreground" : "bg-secondary"}>{u.plano}</Badge></td>
                      <td className="p-3">{u.creditos_hoje}</td>
                      <td className="p-3 text-muted-foreground">{u.premium_ate ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-3">Pagamentos</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Comprovativo</th>
                    <th className="text-left p-3">Acção</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map((p) => {
                    const u = users.find((x) => x.id === p.user_id);
                    return (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3">{u?.email ?? p.user_id}</td>
                        <td className="p-3">
                          <Badge className={
                            p.status === "aprovado" ? "bg-success text-white" :
                            p.status === "rejeitado" ? "bg-destructive text-destructive-foreground" :
                            "bg-warning text-black"
                          }>{p.status}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(p.criado_em).toLocaleString("pt-PT")}</td>
                        <td className="p-3">{p.comprovativo_url && <a href={p.comprovativo_url} target="_blank" rel="noreferrer" className="text-primary underline">Ver</a>}</td>
                        <td className="p-3">
                          {p.status !== "aprovado" && (
                            <Button size="sm" onClick={() => aprovar(p.id, p.user_id)} className="bg-primary text-primary-foreground hover:bg-primary-glow">Aprovar</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
