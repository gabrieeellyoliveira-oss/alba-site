import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Bell, Calendar, Check, Eye, EyeOff, Gem, Loader2, Lock, Mail, Star, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, OrbeIcon } from "@/components/orbe/Logo";
import { ITENS_GRATUITO, ITENS_PRO } from "@/components/orbe/ProModal";
import { mensagemDeErro, useSessao } from "@/lib/conta";
import { SLOGAN, type Plano } from "@/lib/orbe";

type Busca = { modo?: "login" | "cadastro"; plano?: Plano };

export const Route = createFileRoute("/entrar")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Busca => ({
    modo: s.modo === "login" ? "login" : s.modo === "cadastro" ? "cadastro" : undefined,
    plano: s.plano === "pro" ? "pro" : s.plano === "gratuito" ? "gratuito" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar | Orbe" },
      { name: "description", content: `Crie sua conta grátis na Orbe. ${SLOGAN}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const busca = Route.useSearch();
  const navigate = useNavigate();
  const sessao = useSessao();
  const [modo, setModo] = useState<"login" | "cadastro">(busca.modo ?? "cadastro");
  const [plano, setPlano] = useState<Plano>(busca.plano ?? "gratuito");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const destino = () => navigate({ to: "/app", search: plano === "pro" ? { pro: true } : {} });

  // Já logado: vai direto para a área do cliente
  useEffect(() => {
    if (sessao) destino();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErro("Informe um e-mail válido.");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setEnviando(true);
    try {
      if (modo === "cadastro") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        if (data.user && data.user.identities?.length === 0) throw new Error("User already registered");
        if (!data.session) {
          setAviso(`Enviamos um link de confirmação para ${email.trim()}. Abra o e-mail e clique no link para entrar.`);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) throw error;
      }
      destino();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const escolher = (p: Plano) => {
    setPlano(p);
    document.getElementById("email")?.focus();
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-5">
      <div className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[2.5rem] bg-surface/60 lg:grid-cols-[0.95fr_1.05fr] sm:min-h-[calc(100vh-2.5rem)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 hidden h-[44rem] w-[44rem] rounded-full bg-pink-soft/70 lg:block" />

        {/* Formulário */}
        <main className="relative flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
          <Logo />
          <h1 className="mt-10 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Sua rede de parceiros, <span className="text-pink">em um só lugar.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Acompanhe parceiros, ranking e resultados com um painel criado pra você. {SLOGAN}
          </p>

          <form onSubmit={enviar} noValidate className="mt-9 max-w-md space-y-4" aria-describedby={erro ? "erro-form" : undefined}>
            <h2 className="sr-only">{modo === "cadastro" ? "Criar conta" : "Entrar"}</h2>
            <label className="flex min-h-14 items-center gap-3 rounded-full border border-input bg-surface px-5 focus-within:border-pink">
              <Mail className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">E-mail</span>
              <input id="email" type="email" autoComplete="email" required placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground" />
            </label>
            <label className="flex min-h-14 items-center gap-3 rounded-full border border-input bg-surface pl-5 pr-2 focus-within:border-pink">
              <Lock className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Senha</span>
              <input type={ver ? "text" : "password"} autoComplete={modo === "cadastro" ? "new-password" : "current-password"} required minLength={6} placeholder={modo === "cadastro" ? "Crie uma senha" : "Sua senha"} value={senha} onChange={(e) => setSenha(e.target.value)} className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground" />
              <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-lilac">
                {ver ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            </label>

            {modo === "cadastro" && (
              <p className="px-2 text-sm text-muted-foreground">
                Plano escolhido: <strong className="text-foreground">{plano === "pro" ? "Pro" : "Gratuito"}</strong>
                {plano === "pro" && " (você cria a conta e assina o Pro em seguida)"}
              </p>
            )}

            {erro && <p id="erro-form" role="alert" className="rounded-2xl bg-pink-soft px-4 py-3 text-sm font-medium">{erro}</p>}
            {aviso && <p role="status" className="rounded-2xl bg-lilac px-4 py-3 text-sm font-medium">{aviso}</p>}

            <button type="submit" disabled={enviando} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-plum px-6 text-lg font-semibold text-plum-foreground transition hover:-translate-y-0.5 disabled:opacity-70">
              {enviando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
              {modo === "cadastro" ? "Criar minha conta" : "Entrar"}
              {!enviando && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
            </button>
          </form>

          <p className="mt-8 max-w-md text-center text-muted-foreground">
            {modo === "cadastro" ? "Já tem uma conta? " : "Ainda não tem conta? "}
            <button type="button" onClick={() => { setModo(modo === "cadastro" ? "login" : "cadastro"); setErro(null); setAviso(null); }} className="font-medium text-pink underline-offset-4 hover:underline">
              {modo === "cadastro" ? "Fazer login" : "Criar conta grátis"}
            </button>
          </p>
          <p className="mt-3 max-w-md text-center text-sm"><Link to="/" className="text-muted-foreground underline-offset-4 hover:underline">Voltar para o site</Link></p>
        </main>

        {/* Prévia + planos */}
        <aside className="relative flex flex-col justify-center gap-6 px-4 pb-10 sm:px-10 lg:py-12" aria-label="Planos">
          <PreviaPainel />
          <section className="relative z-10 -mt-2 rounded-[2rem] bg-surface p-6 shadow-soft sm:p-8 lg:-mt-16">
            <h2 className="text-center text-2xl font-bold">Escolha seu plano</h2>
            <p className="mt-1 text-center text-muted-foreground">Comece grátis e evolua quando quiser.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <CartaoPlano ativo={plano === "gratuito"} icone={<Star className="h-5 w-5" aria-hidden="true" />} nome="Plano Gratuito" desc="O essencial para organizar sua rede." itens={ITENS_GRATUITO} botao="Continuar grátis" onEscolher={() => escolher("gratuito")} />
              <CartaoPlano destaque ativo={plano === "pro"} icone={<Gem className="h-5 w-5" aria-hidden="true" />} nome="Plano Pro" desc="Tudo o que você precisa para ir mais longe." itens={ITENS_PRO} botao="Assinar agora" onEscolher={() => escolher("pro")} />
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" aria-hidden="true" /> Seus dados estão seguros conosco.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function CartaoPlano(p: { destaque?: boolean; ativo: boolean; icone: React.ReactNode; nome: string; desc: string; itens: string[]; botao: string; onEscolher: () => void }) {
  return (
    <article className={`relative flex flex-col rounded-[1.75rem] border p-5 ${p.destaque ? "border-pink/50 bg-pink-soft/40" : "border-border bg-surface"} ${p.ativo ? "ring-2 ring-pink" : ""}`}>
      {p.destaque && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pink px-3 py-1 text-xs font-semibold text-white">Mais completo</span>}
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-pink-soft text-pink">{p.icone}</span>
        <h3 className="text-lg font-bold">{p.nome}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {p.itens.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-pink" aria-hidden="true" />{i}</li>)}
      </ul>
      <button type="button" aria-pressed={p.ativo} onClick={p.onEscolher} className={`mt-5 min-h-11 rounded-full px-4 text-sm font-semibold transition hover:-translate-y-0.5 ${p.destaque ? "bg-plum text-plum-foreground" : "border border-plum/40 text-plum"}`}>
        {p.botao}
      </button>
    </article>
  );
}

function PreviaPainel() {
  return (
    <div aria-hidden="true" className="relative mx-auto hidden w-full max-w-xl rotate-[-2deg] rounded-[2rem] bg-surface p-5 shadow-soft sm:block">
      <div className="flex gap-4">
        <div className="hidden w-28 shrink-0 space-y-2 border-r border-border pr-3 md:block">
          <div className="flex items-center gap-1.5 font-bold"><span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-pink-soft"><OrbeIcon className="h-4 w-4" /></span>Orbe</div>
          {["Início", "Parceiros", "Ranking", "Visão geral"].map((t, i) => <div key={t} className={`rounded-lg px-2 py-1 text-xs ${i === 0 ? "bg-pink-soft font-medium text-pink" : "text-muted-foreground"}`}>{t}</div>)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div><p className="text-lg font-semibold">Olá, Gabrielly!</p><p className="text-xs text-muted-foreground">Sua rede em um relance</p></div>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Mini rotulo="Parceiros ativos" valor="23" icone={<Users className="h-4 w-4" />} />
            <Mini rotulo="Meta do mês" valor="68%" icone={<TrendingUp className="h-4 w-4" />} />
            <Mini rotulo="Clientes no mês" valor="41" icone={<Calendar className="h-4 w-4" />} />
          </div>
          <div className="mt-3 rounded-xl border border-border p-3">
            <p className="text-xs font-semibold">Destaque do mês</p>
            <p className="mt-1 text-xs text-muted-foreground">Vale Soluções · 12 clientes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ rotulo, valor, icone }: { rotulo: string; valor: string; icone: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-2.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">{rotulo}<span className="text-pink">{icone}</span></div>
      <p className="mt-1 text-xl font-bold">{valor}</p>
    </div>
  );
}
