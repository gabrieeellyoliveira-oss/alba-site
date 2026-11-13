import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, Orbe } from "@/components/orbe/Logo";
import { mensagemDeErro, useSessao } from "@/lib/conta";
import { LIMITE_GRATUITO, SLOGAN, type Plano } from "@/lib/orbe";

type Modo = "login" | "cadastro" | "esqueci";
type Busca = { modo?: Modo; plano?: Plano };

export const Route = createFileRoute("/entrar")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Busca => {
    const b: Busca = {};
    const modo = s["modo"];
    const plano = s["plano"];
    if (modo === "login" || modo === "cadastro" || modo === "esqueci") b.modo = modo;
    if (plano === "pro" || plano === "gratuito") b.plano = plano;
    return b;
  },
  head: () => ({
    meta: [
      { title: "Entrar | ORBE" },
      { name: "description", content: `Entre ou crie sua conta grátis na ORBE. ${SLOGAN}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Entrar,
});

const TEXTOS: Record<Modo, { tag: string; titulo: string; sub: string; botao: string }> = {
  login: { tag: "Área do cliente", titulo: "Bom te ver de novo.", sub: "Entre para ver como está a sua rede de parceiros hoje.", botao: "Entrar" },
  cadastro: { tag: "Comece grátis", titulo: "Crie sua conta.", sub: `Cadastre até ${LIMITE_GRATUITO} parceiros de graça e faça upgrade quando quiser.`, botao: "Criar minha conta" },
  esqueci: { tag: "Área do cliente", titulo: "Esqueceu a senha?", sub: "Informe seu e-mail e enviamos um link para você criar uma senha nova.", botao: "Enviar link" },
};

function Entrar() {
  const busca = Route.useSearch();
  const navigate = useNavigate();
  const sessao = useSessao();
  const [modo, setModo] = useState<Modo>(busca.modo ?? (busca.plano ? "cadastro" : "login"));
  const [plano, setPlano] = useState<Plano>(busca.plano ?? "gratuito");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const irParaApp = () => navigate({ to: "/app", search: plano === "pro" && modo === "cadastro" ? { pro: true } : {} });

  useEffect(() => {
    if (sessao) irParaApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao]);

  const trocar = (m: Modo) => { setModo(m); setErro(null); setAviso(null); };

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    const em = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(em)) return setErro("Informe um e-mail válido.");
    if (modo !== "esqueci" && senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setEnviando(true);
    try {
      if (modo === "esqueci") {
        const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: `${window.location.origin}/nova-senha` });
        if (error) throw error;
        setAviso(`Se existir uma conta com ${em}, você vai receber um link para criar uma senha nova.`);
        return;
      }
      if (modo === "cadastro") {
        const { data, error } = await supabase.auth.signUp({ email: em, password: senha, options: { emailRedirectTo: `${window.location.origin}/app` } });
        if (error) throw error;
        if (data.user && data.user.identities?.length === 0) throw new Error("User already registered");
        if (!data.session) {
          setAviso(`Enviamos um link de confirmação para ${em}. Abra o e-mail e clique no link para entrar.`);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: em, password: senha });
        if (error) throw error;
      }
      irParaApp();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const t = TEXTOS[modo];
  const campo = "h-[52px] w-full rounded-full border-[1.5px] border-[#E6E2EA] bg-background px-5 text-base outline-none focus:border-pink";

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background px-4 pb-8 pt-6 sm:px-8 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Logo />
        {modo === "cadastro" ? (
          <BotaoTopo onClick={() => trocar("login")}>Já tenho conta</BotaoTopo>
        ) : (
          <BotaoTopo onClick={() => trocar("cadastro")}>Criar conta grátis <ArrowRight className="h-4 w-4" aria-hidden="true" /></BotaoTopo>
        )}
      </header>

      <main className="flex flex-1 flex-wrap items-stretch gap-6">
        <section className="flex min-w-0 flex-[1_1_380px] flex-col justify-center gap-6 rounded-[32px] bg-surface p-7 sm:p-12 lg:p-14">
          <span className="self-start rounded-full bg-[#F6D3E2] px-3.5 py-1.5 text-[13px] font-medium">{t.tag}</span>
          <div className="space-y-2">
            <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">{t.titulo}</h1>
            <p className="text-[17px] leading-relaxed text-[#4A4650]">{t.sub}</p>
          </div>

          <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <input id="email" type="email" autoComplete="email" required placeholder="voce@empresa.com.br" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
            </div>

            {modo !== "esqueci" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="senha" className="text-sm font-medium">{modo === "cadastro" ? "Crie uma senha" : "Senha"}</label>
                  {modo === "login" && <button type="button" onClick={() => trocar("esqueci")} className="text-sm text-[#4A4650] underline underline-offset-2 hover:text-pink">Esqueci minha senha</button>}
                </div>
                <div className="relative">
                  <input id="senha" type={ver ? "text" : "password"} autoComplete={modo === "cadastro" ? "new-password" : "current-password"} required minLength={6} placeholder={modo === "cadastro" ? "Mínimo de 6 caracteres" : "••••••••"} value={senha} onChange={(e) => setSenha(e.target.value)} className={`${campo} pr-14`} />
                  <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-[#4A4650] hover:bg-lilac">
                    {ver ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>
            )}

            {modo === "cadastro" && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1.5 text-sm font-medium">Plano</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <OpcaoPlano valor="gratuito" atual={plano} onEscolher={setPlano} nome="Gratuito" desc={`Até ${LIMITE_GRATUITO} parceiros, Ranking e Visão Geral`} />
                  <OpcaoPlano valor="pro" atual={plano} onEscolher={setPlano} nome="Pro" desc="Parceiros ilimitados, metas, treinamentos e alertas" />
                </div>
                {plano === "pro" && <p className="text-sm text-[#4A4650]">Você cria a conta e em seguida assina o Pro pelo WhatsApp.</p>}
              </fieldset>
            )}

            {erro && <p role="alert" className="rounded-2xl bg-pink-soft px-4 py-3 text-sm font-medium">{erro}</p>}
            {aviso && <p role="status" className="rounded-2xl bg-lilac px-4 py-3 text-sm font-medium">{aviso}</p>}

            <button type="submit" disabled={enviando} className="mt-2 flex h-14 items-center justify-center gap-2 rounded-full bg-[#141414] text-[17px] font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-70">
              {enviando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
              {t.botao} {!enviando && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
            </button>
          </form>

          <p className="text-sm text-[#4A4650]">
            {modo === "login" && <>Ainda não tem conta? <button type="button" onClick={() => trocar("cadastro")} className="font-semibold text-foreground underline underline-offset-2 hover:text-pink">Crie grátis</button></>}
            {modo === "cadastro" && <>Já tem uma conta? <button type="button" onClick={() => trocar("login")} className="font-semibold text-foreground underline underline-offset-2 hover:text-pink">Entrar</button></>}
            {modo === "esqueci" && <>Lembrou? <button type="button" onClick={() => trocar("login")} className="font-semibold text-foreground underline underline-offset-2 hover:text-pink">Voltar para o login</button></>}
            <span className="mx-2" aria-hidden="true">·</span>
            <Link to="/" className="underline underline-offset-2 hover:text-pink">Voltar para o site</Link>
          </p>
        </section>

        <section className="flex min-h-[420px] min-w-0 flex-[999_1_460px] flex-col items-center justify-center gap-7 rounded-[32px] bg-[#141414] p-10 text-center text-white">
          <Orbe size={340} rotulo="Orbe de energia animado da ORBE" />
          <div className="flex flex-col items-center gap-3">
            <p className="text-[32px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-4xl">Ecossistemas que<br />crescem juntos.</p>
            <p className="max-w-[420px] text-base leading-relaxed text-[#C9C4CF]">Parceiros, metas e treinamentos em um só painel.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function BotaoTopo({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 items-center gap-2 rounded-full bg-[#141414] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
      {children}
    </button>
  );
}

function OpcaoPlano({ valor, atual, onEscolher, nome, desc }: { valor: Plano; atual: Plano; onEscolher: (p: Plano) => void; nome: string; desc: string }) {
  const ativo = valor === atual;
  return (
    <label className={`flex cursor-pointer gap-3 rounded-2xl border-[1.5px] p-3.5 transition ${ativo ? "border-pink bg-pink-soft/40" : "border-[#E6E2EA] hover:bg-lilac/60"}`}>
      <input type="radio" name="plano" value={valor} checked={ativo} onChange={() => onEscolher(valor)} className="mt-1 h-4 w-4 accent-[#F0559A]" />
      <span>
        <span className="block font-semibold">{nome}</span>
        <span className="block text-sm text-[#4A4650]">{desc}</span>
      </span>
    </label>
  );
}
