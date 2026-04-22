import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Upload, Brain, FileCheck, Check, X, ArrowRight, Zap, BookOpen, Calculator } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* HERO */}
      <section className="relative pt-16 pb-24 px-4">
        <div className="container max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Feito para alunos moçambicanos 🇲🇿</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up">
            A IA que estuda no <br />
            <span className="text-gradient">estilo do teu professor</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up">
            Carrega a ficha + TPC. A IA resolve como o teu professor ensina.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 animate-fade-up">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-glow text-base px-8 h-12 glow-cyan">
                Começar Grátis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 border-primary/30 hover:bg-primary/10">
                Ver como funciona
              </Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            ⚡ 3 exercícios/dia grátis · 💳 Sem cartão · 🤖 IA de última geração
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4 bg-secondary/20 border-y border-border/50">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Como funciona</h2>
          <p className="text-muted-foreground text-center mb-12">3 passos simples para teres o teu TPC resolvido</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: "1. Carrega a ficha", desc: "Tira foto ou faz upload da ficha do professor (opcional) e do exercício de TPC." },
              { icon: Brain, title: "2. A IA analisa", desc: "A IA estuda o método do teu professor e adapta a resolução ao teu nível." },
              { icon: FileCheck, title: "3. Recebe a solução", desc: "Solução passo a passo, no estilo do professor, em português de Moçambique." },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 card-glow hover:border-primary/40 transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FERRAMENTAS */}
      <section className="py-20 px-4">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Tudo o que precisas para estudar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Resolver TPC", desc: "Carrega o exercício e recebe a solução completa." },
              { icon: BookOpen, title: "Preparação para Teste", desc: "Resumos, simulações e respostas modelo." },
              { icon: Calculator, title: "Matemática Passo a Passo", desc: "Explicações detalhadas com fórmulas." },
            ].map((t, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition card-glow">
                <t.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20 px-4 bg-secondary/20 border-y border-border/50">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Planos simples e justos</h2>
          <p className="text-muted-foreground text-center mb-12">Começa grátis. Faz upgrade quando precisares.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-1">Free</h3>
              <p className="text-muted-foreground text-sm mb-4">Para experimentares</p>
              <p className="text-4xl font-bold mb-1">0 <span className="text-base text-muted-foreground">MT</span></p>
              <p className="text-xs text-muted-foreground mb-6">para sempre</p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> 3 exercícios de TPC por dia</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> IA personalizada</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-muted-foreground" /> Preparação para teste</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-muted-foreground" /> Matemática passo a passo</li>
              </ul>
              <Link to="/auth"><Button variant="outline" className="w-full">Começar Grátis</Button></Link>
            </div>
            <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary rounded-2xl p-8 relative card-glow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">RECOMENDADO</div>
              <h3 className="text-xl font-semibold mb-1 text-primary">Premium</h3>
              <p className="text-muted-foreground text-sm mb-4">Para quem quer subir de nota</p>
              <p className="text-4xl font-bold mb-1">150 <span className="text-base text-muted-foreground">MT/mês</span></p>
              <p className="text-xs text-muted-foreground mb-6">≈ 5 MT por dia</p>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> TPCs <strong>ilimitados</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Preparação para testes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Matemática passo a passo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Suporte prioritário</li>
              </ul>
              <Link to="/auth"><Button className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">Quero Premium</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "É realmente grátis?", a: "Sim. Tens 3 exercícios de TPC por dia, sem cartão de crédito." },
              { q: "A IA funciona com fotos da ficha?", a: "Sim. Tira uma foto clara e a IA lê o conteúdo." },
              { q: "Como pago o Premium?", a: "Por M-Pesa ou e-Mola. Carregas o comprovativo e nós validamos automaticamente." },
              { q: "A IA fala português de Moçambique?", a: "Sim, está adaptada para o currículo e linguagem moçambicana." },
              { q: "Posso cancelar quando quiser?", a: "Sim, o Premium é mensal e renova só quando quiseres." },
            ].map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`} className="bg-card border border-border rounded-xl px-4">
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 border-t border-border bg-secondary/20 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>EstudaMZ © {new Date().getFullYear()} — Feito com ❤️ em Moçambique</span>
          </div>
          <div className="flex gap-4">
            <Link to="/auth" className="hover:text-primary">Entrar</Link>
            <a href="#planos" className="hover:text-primary">Planos</a>
            <a href="#faq" className="hover:text-primary">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
