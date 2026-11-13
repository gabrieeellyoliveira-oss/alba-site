import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Check, Gem, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConta } from "@/routes/app";
import { Cabecalho } from "@/components/orbe/Comum";
import { mensagemDeErro, useAtualizarPerfil } from "@/lib/conta";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações | ORBE" }] }),
  component: Configuracoes,
});

function Configuracoes() {
  const { sessao, perfil, abrirPro } = useConta();
  const atualizar = useAtualizarPerfil();
  const navigate = useNavigate();
  const [nome, setNome] = useState(perfil.nome ?? "");
  const [empresa, setEmpresa] = useState(perfil.empresa ?? "");
  const [estado, setEstado] = useState<"parado" | "salvando" | "salvo">("parado");
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEstado("salvando");
    try {
      await atualizar(sessao.user.id, { nome: nome.trim().slice(0, 80) || null, empresa: empresa.trim().slice(0, 120) || null });
      setEstado("salvo");
      setTimeout(() => setEstado("parado"), 1800);
    } catch (err) {
      setErro(mensagemDeErro(err));
      setEstado("parado");
    }
  }

  const campo = "min-h-12 rounded-2xl border border-input bg-surface px-4 outline-none focus:border-pink";
  return (
    <div className="mx-auto max-w-3xl">
      <Cabecalho titulo="Configurações" descricao="Seus dados e seu plano." />

      <form onSubmit={salvar} className="mt-8 grid gap-4 rounded-[1.5rem] border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">Seus dados</h2>
        <label className="grid gap-1 text-sm font-medium">E-mail<input className={`${campo} bg-lilac/50`} value={sessao.user.email ?? ""} readOnly /></label>
        <label className="grid gap-1 text-sm font-medium">Seu nome<input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} autoComplete="name" /></label>
        <label className="grid gap-1 text-sm font-medium">Empresa<input className={campo} value={empresa} onChange={(e) => setEmpresa(e.target.value)} maxLength={120} autoComplete="organization" /></label>
        {erro && <p role="alert" className="rounded-2xl bg-pink-soft px-4 py-3 text-sm font-medium">{erro}</p>}
        <button type="submit" disabled={estado === "salvando"} className="flex min-h-12 items-center justify-center gap-2 justify-self-start rounded-full bg-plum px-6 font-semibold text-plum-foreground disabled:opacity-60">
          {estado === "salvando" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : estado === "salvo" ? <Check className="h-5 w-5" aria-hidden="true" /> : null}
          {estado === "salvo" ? "Salvo" : "Salvar"}
        </button>
      </form>

      <section className="mt-6 rounded-[1.5rem] border border-border bg-surface p-6" aria-labelledby="plano-titulo">
        <h2 id="plano-titulo" className="text-lg font-semibold">Seu plano</h2>
        <p className="mt-2 flex items-center gap-2 text-2xl font-bold"><Gem className="h-6 w-6 text-pink" aria-hidden="true" />{perfil.plano === "pro" ? "Pro" : "Gratuito"}</p>
        {perfil.plano !== "pro" && <button type="button" onClick={abrirPro} className="mt-4 min-h-11 rounded-full bg-ink px-5 font-semibold text-ink-foreground">Conhecer o plano Pro</button>}
      </section>

      <button type="button" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="mt-6 flex min-h-11 items-center gap-2 rounded-full px-4 font-medium text-muted-foreground hover:bg-lilac hover:text-foreground">
        <LogOut className="h-5 w-5" aria-hidden="true" /> Sair da conta
      </button>
    </div>
  );
}
