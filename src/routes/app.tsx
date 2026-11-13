import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import { ArrowRight, Bell, CircleHelp, Home, LayoutGrid, Loader2, LogOut, Menu, Settings, Sparkles } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/orbe/Logo";
import { ProModal } from "@/components/orbe/ProModal";
import { usePerfil, useSessao, type Perfil } from "@/lib/conta";
import { linkWhatsapp } from "@/lib/orbe";

type Busca = { pro?: boolean };

export const Route = createFileRoute("/app")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Busca => (s["pro"] === true || s["pro"] === "true" ? { pro: true } : {}),
  head: () => ({ meta: [{ title: "Orbe" }, { name: "robots", content: "noindex" }] }),
  component: AreaDoCliente,
});

type Ctx = { sessao: Session; perfil: Perfil; abrirPro: () => void };
const ContaCtx = createContext<Ctx | null>(null);
export function useConta() {
  const c = useContext(ContaCtx);
  if (!c) throw new Error("useConta fora da área do cliente");
  return c;
}

const MENU = [
  { to: "/app", rotulo: "Início", icone: Home, exato: true },
  { to: "/app/dashboards", rotulo: "Meus Dashboards", icone: LayoutGrid, exato: false },
  { to: "/app/configuracoes", rotulo: "Configurações", icone: Settings, exato: false },
] as const;

function AreaDoCliente() {
  const sessao = useSessao();
  const navigate = useNavigate();
  const busca = Route.useSearch();
  const perfil = usePerfil(sessao?.user.id);
  const [proAberto, setProAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);

  useEffect(() => {
    if (sessao === null) navigate({ to: "/entrar", search: { modo: "login" } });
  }, [sessao, navigate]);

  useEffect(() => {
    if (busca.pro && perfil.data && perfil.data.plano !== "pro") {
      setProAberto(true);
      navigate({ to: ".", search: {}, replace: true });
    }
  }, [busca.pro, perfil.data, navigate]);

  if (!sessao || perfil.isLoading) {
    return <div className="grid min-h-screen place-items-center" role="status"><Loader2 className="h-8 w-8 animate-spin text-pink" aria-label="Carregando" /></div>;
  }
  if (perfil.isError || !perfil.data) {
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <p className="text-lg font-semibold">Não conseguimos carregar sua conta.</p>
          <button type="button" onClick={() => perfil.refetch()} className="mt-4 min-h-11 rounded-full bg-plum px-6 font-semibold text-plum-foreground">Tentar de novo</button>
        </div>
      </div>
    );
  }

  const p = perfil.data;
  const email = sessao.user.email ?? "";
  const iniciais = (p.nome || email).slice(0, 2).toUpperCase();
  const sair = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };
  const ajuda = linkWhatsapp(email, "ajuda");

  const Lateral = (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6"><Logo to="/app" /></div>
      <nav aria-label="Área do cliente" className="mt-8 px-3">
        <ul className="space-y-1">
          {MENU.map(({ to, rotulo, icone: Icone, exato }) => (
            <li key={to}>
              <Link to={to} activeOptions={{ exact: exato }} onClick={() => setMenuAberto(false)} className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-medium text-muted-foreground transition hover:bg-lilac data-[status=active]:bg-pink-soft data-[status=active]:text-foreground">
                <Icone className="h-5 w-5" aria-hidden="true" /> {rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto space-y-4 p-4">
        {p.plano !== "pro" && (
          <div className="rounded-[1.5rem] bg-pink-soft/60 p-4">
            <Sparkles className="h-5 w-5 text-pink" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold">Faça upgrade para acessar ainda mais recursos!</p>
            <button type="button" onClick={() => setProAberto(true)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-ink-foreground">Ver planos <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        )}
        {ajuda && <a href={ajuda} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-2 px-2 text-sm text-muted-foreground hover:text-foreground"><CircleHelp className="h-4 w-4" aria-hidden="true" /> Ajuda</a>}
      </div>
    </div>
  );

  return (
    <ContaCtx.Provider value={{ sessao, perfil: p, abrirPro: () => setProAberto(true) }}>
      <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface/50 lg:block">{Lateral}</aside>
        {menuAberto && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-ink/30" onClick={() => setMenuAberto(false)} />
            <aside className="relative h-full w-72 max-w-[85vw] bg-surface shadow-soft">{Lateral}</aside>
          </div>
        )}
        <div className="min-w-0">
          <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
            <button type="button" onClick={() => setMenuAberto(true)} aria-label="Abrir menu" className="grid h-11 w-11 place-items-center rounded-full bg-surface shadow-soft lg:hidden"><Menu className="h-5 w-5" aria-hidden="true" /></button>
            <span className="lg:hidden"><Logo to="/app" size="sm" /></span>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full bg-lilac px-3 py-1 text-xs font-semibold sm:inline">{p.plano === "pro" ? "Plano Pro" : "Plano Gratuito"}</span>
              <span className="grid h-11 w-11 place-items-center text-muted-foreground" aria-hidden="true"><Bell className="h-5 w-5" /></span>
              <div className="relative">
                <button type="button" onClick={() => setContaAberta(!contaAberta)} aria-expanded={contaAberta} aria-haspopup="menu" aria-label="Minha conta" className="grid h-11 w-11 place-items-center rounded-full bg-plum text-sm font-semibold text-plum-foreground">{iniciais}</button>
                {contaAberta && (
                  <div role="menu" className="absolute right-0 z-40 mt-2 w-60 rounded-2xl bg-surface p-2 shadow-soft">
                    <p className="truncate px-3 py-2 text-sm text-muted-foreground">{email}</p>
                    <Link to="/app/configuracoes" role="menuitem" onClick={() => setContaAberta(false)} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm hover:bg-lilac"><Settings className="h-4 w-4" aria-hidden="true" /> Configurações</Link>
                    <button type="button" role="menuitem" onClick={sair} className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-sm hover:bg-lilac"><LogOut className="h-4 w-4" aria-hidden="true" /> Sair</button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="px-4 pb-16 sm:px-8"><Outlet /></main>
        </div>
      </div>
      <ProModal aberto={proAberto} onFechar={() => setProAberto(false)} email={email} />
    </ContaCtx.Provider>
  );
}
