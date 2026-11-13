import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Crown, Lock } from "lucide-react";
import { useConta } from "@/lib/conta-contexto";
import { useAtualizarPerfil } from "@/lib/conta";
import type { Template } from "@/lib/orbe";

/** Miniatura ilustrativa de cada template (decorativa). */
export function Miniatura({ t }: { t: Template }) {
  const Icone = t.icone;
  return (
    <div aria-hidden="true" className="relative h-36 overflow-hidden rounded-t-[1.5rem] bg-lilac/70 p-4">
      <div className="h-full rounded-xl bg-surface p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold"><Icone className="h-4 w-4 text-pink" />{t.nome}</div>
        {t.id === "parceiros" && (
          <div className="mt-2 space-y-1.5">
            {[["Vale Soluções", "Ativo"], ["Rede Norte", "Onboarding"], ["Alfa Digital", "Parado"]].map(([n, s]) => (
              <div key={n} className="flex items-center justify-between text-[11px]"><span>{n}</span><span className={`rounded-full px-2 ${s === "Ativo" ? "bg-pink-soft" : s === "Parado" ? "bg-ink text-ink-foreground" : "bg-lilac"}`}>{s}</span></div>
            ))}
          </div>
        )}
        {t.id === "ranking" && (
          <div className="mt-2 flex h-16 items-end justify-center gap-2">
            {[60, 100, 40].map((h, i) => <div key={i} className={`w-10 rounded-t-lg ${i === 1 ? "bg-pink" : "bg-pink-soft"}`} style={{ height: `${h}%` }} />)}
          </div>
        )}
        {t.id === "visao-geral" && (
          <div className="mt-2 flex h-16 items-end gap-1.5">
            {[25, 35, 30, 50, 70, 60, 90].map((h, i) => <div key={i} className="flex-1 rounded-t bg-pink-soft" style={{ height: `${h}%` }} />)}
          </div>
        )}
        {t.plano === "pro" && (
          <div className="mt-2 space-y-1.5">
            {[80, 55, 70].map((w, i) => <div key={i} className="h-2 rounded-full bg-lilac"><div className="h-full rounded-full bg-pink-soft" style={{ width: `${w}%` }} /></div>)}
          </div>
        )}
      </div>
      {t.plano === "pro" && <span className="absolute inset-0 grid place-items-center bg-surface/40"><span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-ink-foreground"><Lock className="h-5 w-5" /></span></span>}
      <span className="absolute right-3 top-3 rounded-full bg-pink-soft px-2.5 py-0.5 text-xs font-semibold">{t.plano === "pro" ? "Pro" : "Gratuito"}</span>
    </div>
  );
}

export function CartaoTemplate({ t }: { t: Template }) {
  const { sessao, perfil, abrirPro } = useConta();
  const atualizar = useAtualizarPerfil();
  const navigate = useNavigate();
  const [ocupado, setOcupado] = useState(false);
  const travado = t.plano === "pro" && perfil.plano !== "pro";
  const jaTem = perfil.templates.includes(t.id);

  async function selecionar() {
    if (travado) return abrirPro();
    if (!t.rota) return;
    setOcupado(true);
    try {
      if (!jaTem) await atualizar(sessao.user.id, { templates: [...perfil.templates, t.id] });
      navigate({ to: t.rota });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <article className="flex flex-col rounded-[1.5rem] border border-border bg-surface">
      <Miniatura t={t} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">{t.nome}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.descricao}</p>
        {travado ? (
          <button type="button" onClick={selecionar} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-pink-soft px-4 text-sm font-semibold">
            <Crown className="h-4 w-4" aria-hidden="true" /> Disponível no plano Pro
          </button>
        ) : t.rota ? (
          <button type="button" onClick={selecionar} disabled={ocupado} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/30 px-4 text-sm font-semibold transition hover:bg-lilac disabled:opacity-60">
            {jaTem ? "Abrir dashboard" : "Selecionar template"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <p className="mt-4 rounded-full bg-lilac px-4 py-2.5 text-center text-sm font-semibold">Chega em breve</p>
        )}
      </div>
    </article>
  );
}
