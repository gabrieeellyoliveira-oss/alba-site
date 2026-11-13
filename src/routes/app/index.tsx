import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Calendar, Crown, Sparkles } from "lucide-react";
import { useConta } from "@/routes/app";
import { CartaoTemplate } from "@/components/orbe/Templates";
import { TEMPLATES } from "@/lib/orbe";

export const Route = createFileRoute("/app/")({
  component: Inicio,
});

function Inicio() {
  const { perfil, abrirPro } = useConta();
  const [aba, setAba] = useState<"gratuito" | "pro">("gratuito");
  const gratis = TEMPLATES.filter((t) => t.plano === "gratuito");
  const pro = TEMPLATES.filter((t) => t.plano === "pro");
  const ePro = perfil.plano === "pro";

  const irPara = (a: "gratuito" | "pro") => {
    setAba(a);
    document.getElementById(a === "pro" ? "templates-pro" : "templates-gratuitos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <span className="inline-flex items-center gap-2 rounded-full bg-pink-soft px-4 py-1.5 text-sm font-semibold">
        Boas-vindas à ORBE!<Sparkles className="h-4 w-4 text-pink" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Escolha seus templates</h1>
      <p className="mt-2 text-lg text-muted-foreground">Comece com um modelo pronto e acompanhe sua rede do seu jeito.</p>

      <div className="mt-8 flex flex-wrap gap-3" role="tablist" aria-label="Tipo de template">
        <button type="button" role="tab" aria-selected={aba === "gratuito"} onClick={() => irPara("gratuito")} className={`flex min-h-12 items-center gap-2 rounded-full px-5 font-semibold transition ${aba === "gratuito" ? "bg-pink-soft" : "border border-border bg-surface"}`}>
          <Calendar className="h-5 w-5 text-pink" aria-hidden="true" /> Templates Gratuitos <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs">Sempre disponíveis</span>
        </button>
        <button type="button" role="tab" aria-selected={aba === "pro"} onClick={() => irPara("pro")} className={`flex min-h-12 items-center gap-2 rounded-full px-5 font-semibold transition ${aba === "pro" ? "bg-pink-soft" : "border border-border bg-surface"}`}>
          <Crown className="h-5 w-5" aria-hidden="true" /> Templates Pro <span className="rounded-full bg-pink-soft px-2.5 py-0.5 text-xs text-pink">{ePro ? "Liberados" : "Desbloqueie mais"}</span>
        </button>
      </div>

      <section id="templates-gratuitos" aria-label="Templates gratuitos" className="mt-6 grid scroll-mt-6 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {gratis.map((t) => <CartaoTemplate key={t.id} t={t} />)}
        {!ePro && (
          <aside className="relative flex flex-col overflow-hidden rounded-[1.5rem] bg-pink-soft/60 p-6">
            <Sparkles className="h-7 w-7 text-pink" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold">Templates Pro</h2>
            <p className="mt-2 flex-1 text-muted-foreground">Desbloqueie metas do canal, onboarding com treinamentos, alertas e parceiros ilimitados.</p>
            <button type="button" onClick={abrirPro} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 font-semibold text-ink-foreground">Conhecer o plano Pro <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </aside>
        )}
      </section>

      <section id="templates-pro" aria-labelledby="titulo-pro" className="mt-12 scroll-mt-6">
        <h2 id="titulo-pro" className="flex items-center gap-2 text-2xl font-bold"><Crown className="h-6 w-6 text-pink" aria-hidden="true" /> Templates Pro</h2>
        <p className="mt-1 text-muted-foreground">Tudo do plano gratuito, e muito mais.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {pro.map((t) => <CartaoTemplate key={t.id} t={t} />)}
          {!ePro && (
            <aside className="flex flex-col items-center justify-center rounded-[1.5rem] border border-border bg-surface p-6 text-center">
              <Crown className="h-9 w-9" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">Qual plano combina com você?</h3>
              <p className="mt-2 text-sm text-muted-foreground">Comece grátis e faça upgrade quando quiser.</p>
              <button type="button" onClick={abrirPro} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-ink-foreground">Ver planos <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}
