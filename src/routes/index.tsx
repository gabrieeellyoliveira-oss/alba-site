import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, Menu, X, Users, Target, GraduationCap, Minus, Plus } from "lucide-react";
import { Logo, Blob } from "@/components/orbe/Logo";
import { ITENS_GRATUITO, ITENS_PRO } from "@/components/orbe/ProModal";
import { SLOGAN } from "@/lib/orbe";

const TITLE = "Orbe | Ecossistemas que crescem juntos";
const DESC = "Painel pronto para quem vende com parceiros: performance e ranking da rede, metas do time de canal e kits de treinamento. Crie sua conta grátis e comece hoje.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const Tag = ({ children, tone = "pink" }: { children: ReactNode; tone?: "pink" | "light" | "dark" }) => (
  <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${tone === "pink" ? "bg-pink-soft text-foreground" : tone === "dark" ? "bg-ink-card text-ink-foreground" : "bg-surface text-foreground"}`}>{children}</span>
);

const CtaButton = ({ className = "" }: { className?: string }) => (
  <Link to="/entrar" search={{ modo: "cadastro" }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-ink-foreground transition hover:-translate-y-0.5 ${className}`}>
    Criar conta grátis <ArrowRight className="h-5 w-5" aria-hidden="true" />
  </Link>
);

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [["Como funciona", "#como-funciona"], ["Planos", "#planos"], ["Dúvidas", "#perguntas"]];
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Logo />
        <nav aria-label="Principal" className="hidden rounded-full bg-surface p-1.5 shadow-soft md:block">
          <ul className="flex">{links.map(([l, h]) => <li key={h}><a href={h} className="inline-flex min-h-11 items-center rounded-full px-5 font-medium text-muted-foreground transition hover:bg-lilac hover:text-foreground">{l}</a></li>)}</ul>
        </nav>
        <div className="hidden items-center gap-2 md:flex"><Link to="/entrar" search={{ modo: "login" }} className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold hover:bg-lilac">Entrar</Link><CtaButton /></div>
        <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-surface shadow-soft md:hidden" aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav id="menu-mobile" aria-label="Menu" className="mx-5 mb-4 rounded-[1.75rem] bg-surface p-3 shadow-soft md:hidden">
          <ul>{links.map(([l, h]) => <li key={h}><a href={h} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-full px-4 text-lg font-medium">{l}</a></li>)}</ul>
          <Link to="/entrar" search={{ modo: "login" }} onClick={() => setOpen(false)} className="mt-2 flex min-h-12 items-center justify-center rounded-full font-semibold">Entrar</Link>
          <Link to="/entrar" search={{ modo: "cadastro" }} onClick={() => setOpen(false)} className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink font-semibold text-ink-foreground">Criar conta grátis <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
        </nav>
      )}
    </header>
  );
}

function DashboardPreview() {
  const bars = [["S", 50], ["T", 75], ["Q", 100], ["Q", 25], ["S", 62], ["S", 38], ["D", 14]] as const;
  return (
    <figure className="reveal">
      <div className="-rotate-[1.5deg] rounded-[2.25rem] bg-ink p-4 shadow-soft sm:p-5" aria-label="Prévia ilustrativa do painel Orbe" role="img">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] bg-pink-soft p-4">
            <p className="text-sm font-medium">Meta do mês</p>
            <p className="mt-1 text-4xl font-bold">68%</p>
            <div className="mt-3 h-2.5 rounded-full bg-surface/70"><div className="h-full w-[68%] rounded-full bg-ink" /></div>
          </div>
          <div className="rounded-[1.5rem] bg-lilac p-4">
            <p className="text-sm font-medium">Parceiros ativos</p>
            <p className="mt-1 text-4xl font-bold">23 <span className="text-lg font-medium text-muted-foreground">de 32</span></p>
          </div>
          <div className="col-span-2 rounded-[1.5rem] bg-surface p-4">
            <p className="text-sm font-medium">Clientes via canal na semana</p>
            <div className="mt-3 flex h-28 items-end gap-2.5">
              {bars.map(([d, h], i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <div className={`w-full rounded-xl ${h === 100 ? "bg-pink" : "bg-lilac"}`} style={{ height: `${h}%` }} />
                  <span className="text-xs text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-3 rounded-full bg-pink-soft p-2 pr-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-ink-foreground">VS</span>
            <p className="text-sm font-medium leading-tight">Vale Soluções está há 20 dias sem o primeiro cliente</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-5 text-center text-xs text-muted-foreground">Painel ilustrativo com dados de exemplo</figcaption>
    </figure>
  );
}

const pillars = [
  { icon: Users, t: "Controle de parceiros", d: "Performance, ranking e status de cada parceiro. Você sabe na hora quem está vendendo, quem está em onboarding e quem parou.", tags: ["Ranking", "Funil de onboarding", "Alertas de risco"], dark: false },
  { icon: Target, t: "Metas do time", d: "A empresa define as metas do canal e o painel mostra o progresso de cada pessoa, o ritmo necessário e quais parceiros estão puxando o resultado.", tags: ["Ativação", "Clientes via canal", "Meta por pessoa"], dark: true },
  { icon: GraduationCap, t: "Kits de treinamento", d: "Trilhas prontas para o parceiro novo começar a vender mais rápido, com acompanhamento de quem já concluiu cada etapa.", tags: ["Primeiros passos", "Demo do produto", "Objeções"], dark: false },
];
const steps = [
  ["Conversa inicial", "Entendemos como sua rede funciona hoje e quais metas importam para vocês."],
  ["Conectamos seus dados", "Usamos o que vocês já têm: planilha ou CRM. Não precisa mudar de ferramenta."],
  ["Montamos o painel", "Configuramos parceiros, metas e treinamentos com a cara da sua empresa."],
  ["Acompanhamos com você", "Suporte, atualização dos dados e novos treinamentos todo mês."],
];
const plans = [
  { n: "Gratuito", plano: "gratuito", d: "O essencial para organizar sua rede.", preco: "Grátis", i: ITENS_GRATUITO, botao: "Começar grátis", dark: false },
  { n: "Pro", plano: "pro", d: "Tudo o que você precisa para ir mais longe.", preco: "Fale com a gente", i: ITENS_PRO, botao: "Assinar o Pro", dark: true },
] as const;
const faqs = [
  ["Preciso trocar de CRM para usar?", "Não. Trabalhamos com os dados que vocês já têm, seja planilha ou CRM. Na conversa inicial vemos qual é o melhor caminho para a sua empresa."],
  ["Quanto tempo leva para o painel ficar pronto?", "Depende principalmente de como os dados dos parceiros estão organizados hoje. Na conversa inicial passamos uma estimativa para o seu caso."],
  ["Quem define as metas?", "A sua empresa. Nós configuramos as metas que vocês escolherem, para o time todo ou para cada pessoa, e o painel acompanha sozinho."],
  ["Os treinamentos já vêm prontos?", "Sim, o painel já vem com trilhas base (primeiros passos, demonstração, prospecção e objeções). No plano Completo criamos trilhas com o conteúdo e a marca da sua empresa."],
  ["Posso adicionar outros dashboards depois?", "Pode. Você começa com um plano e libera novos módulos quando fizer sentido, sem precisar refazer nada."],
];

function Index() {
  useReveal();
  const [faq, setFaq] = useState<number | null>(0);

  return (
    <div id="topo" className="min-h-screen overflow-x-hidden">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ink-foreground">Pular para o conteúdo</a>
      <Nav />
      <main id="conteudo">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div className="reveal">
            <Tag>Para empresas que vendem com parceiros</Tag>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Seus parceiros, suas metas e seus treinamentos em um só painel.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Veja quem está vendendo, quem parou e se o time vai bater a meta do mês, sem planilha e sem correr atrás de informação no WhatsApp. A gente monta tudo para você.</p>
            <CtaButton className="mt-8 px-7 py-4 text-lg" />
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {["Implantação feita por nós", "Funciona com a sua planilha ou CRM"].map((s) => (
                <li key={s} className="flex items-center gap-2 font-medium"><span className="grid h-6 w-6 place-items-center rounded-full bg-pink-soft"><Check className="h-4 w-4" aria-hidden="true" /></span>{s}</li>
              ))}
            </ul>
          </div>
          <DashboardPreview />
        </section>

        {/* Problema */}
        <section className="px-3 sm:px-5">
          <div className="reveal mx-auto max-w-6xl rounded-[2.5rem] bg-ink px-6 py-14 text-ink-foreground sm:px-12 sm:py-20">
            <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Sua rede de parceiros cresceu. O controle ficou na planilha.</h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[["Ninguém sabe quem está vendendo", "Os números de cada parceiro ficam espalhados em planilhas, CRM e conversas de WhatsApp."], ["A meta só aparece no fim do mês", "Quando o time percebe que não vai bater, já não dá mais tempo de reagir."], ["Parceiro novo demora a vender", "O treinamento é solto, cada um aprende de um jeito e muitos desistem antes da primeira venda."]].map(([t, d], i) => (
                <div key={t} className="rounded-[1.75rem] bg-ink-card p-7">
                  <p className="text-lg font-semibold text-pink">0{i + 1}</p>
                  <h3 className="mt-5 text-xl font-semibold">{t}</h3>
                  <p className="mt-3 leading-relaxed text-ink-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilares */}
        <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-24">
          <div className="reveal max-w-3xl">
            <Tag>O que tem no painel</Tag>
            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Três coisas que hoje vivem separadas, finalmente juntas.</h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, t, d, tags, dark }) => (
              <article key={t} className={`reveal relative overflow-hidden rounded-[2.25rem] p-8 ${dark ? "bg-ink text-ink-foreground" : "bg-lilac"}`}>
                <Blob className={`-right-16 -top-16 h-48 w-48 ${dark ? "text-pink" : "text-pink-soft"}`} />
                <span className={`relative grid h-14 w-14 place-items-center rounded-2xl ${dark ? "bg-pink-soft text-foreground" : "bg-surface"}`}><Icon className="h-7 w-7" strokeWidth={1.7} aria-hidden="true" /></span>
                <h3 className="relative mt-10 text-2xl font-semibold">{t}</h3>
                <p className={`relative mt-3 leading-relaxed ${dark ? "text-ink-muted" : "text-muted-foreground"}`}>{d}</p>
                <div className="relative mt-7 flex flex-wrap gap-2">{tags.map((g) => <Tag key={g} tone={dark ? "dark" : "light"}>{g}</Tag>)}</div>
              </article>
            ))}
          </div>
        </section>

        {/* Passos */}
        <section className="bg-lilac py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="reveal max-w-3xl">
              <Tag tone="light">Sem dor de cabeça</Tag>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Você não configura nada. A gente entrega pronto.</h2>
            </div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(([t, d], i) => (
                <li key={t} className="reveal rounded-[2rem] bg-surface p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-pink-soft text-lg font-bold">{i + 1}</span>
                  <h3 className="mt-6 text-xl font-semibold">{t}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="mx-auto max-w-6xl px-5 py-24">
          <div className="reveal mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Comece com o essencial. Cresça quando quiser.</h2>
            <p className="mt-4 text-lg text-muted-foreground">Crie sua conta grátis e faça upgrade quando quiser.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-5 md:grid-cols-2">
            {plans.map(({ n, plano, d, preco, i, botao, dark }) => (
              <article key={n} className={`reveal relative flex flex-col overflow-hidden rounded-[2.25rem] p-8 ${dark ? "bg-ink text-ink-foreground shadow-soft lg:-my-4 lg:py-12" : "bg-surface"}`}>
                {dark && <Blob className="-bottom-20 -right-20 h-56 w-56 text-ink-card" />}
                <h3 className="relative text-2xl font-semibold">{n}</h3>
                <p className={`relative mt-2 ${dark ? "text-ink-muted" : "text-muted-foreground"}`}>{d}</p>
                <p className="relative mt-6 text-3xl font-bold">{preco}</p>
                <ul className="relative mt-6 flex-1 space-y-3">
                  {i.map((x) => <li key={x} className="flex gap-3"><span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${dark ? "bg-pink text-foreground" : "bg-pink-soft"}`}><Check className="h-4 w-4" aria-hidden="true" /></span>{x}</li>)}
                </ul>
                <Link to="/entrar" search={{ modo: "cadastro", plano }} className={`relative mt-8 flex min-h-12 items-center justify-center rounded-full px-6 py-3 font-semibold transition hover:-translate-y-0.5 ${dark ? "bg-pink text-pink-foreground" : "bg-ink text-ink-foreground"}`}>{botao}</Link>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="perguntas" className="mx-auto max-w-3xl px-5 pb-24">
          <h2 className="reveal text-center text-3xl font-bold tracking-tight sm:text-5xl">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {faqs.map(([q, a], i) => {
              const open = faq === i;
              return (
                <div key={q} className="reveal rounded-[1.75rem] bg-surface">
                  <h3>
                    <button type="button" id={`q-${i}`} aria-expanded={open} aria-controls={`a-${i}`} onClick={() => setFaq(open ? null : i)} className="flex min-h-16 w-full items-center justify-between gap-4 rounded-[1.75rem] px-6 py-4 text-left text-lg font-semibold">
                      {q}
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-ink-foreground">{open ? <Minus className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}</span>
                    </button>
                  </h3>
                  <div id={`a-${i}`} role="region" aria-labelledby={`q-${i}`} hidden={!open} className="px-6 pb-6 leading-relaxed text-muted-foreground">{a}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Chamada final */}
        <section id="comecar" className="px-3 pb-10 sm:px-5">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-night px-6 py-14 text-center text-ink-foreground sm:px-12 sm:py-20">
            <Blob className="-bottom-28 -right-28 h-80 w-80 text-pink" />
            <h2 className="reveal relative mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Sua rede de parceiros, em um só lugar.</h2>
            <p className="reveal relative mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">Crie sua conta grátis e cadastre até 10 parceiros. Quando quiser mais, é só fazer upgrade.</p>
            <Link to="/entrar" search={{ modo: "cadastro" }} className="reveal relative mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pink px-7 py-4 text-lg font-semibold text-pink-foreground transition hover:-translate-y-0.5">Criar conta grátis <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-5 py-10 text-sm text-muted-foreground sm:flex-row">
        <p>Orbe · {SLOGAN}</p>
        <p>© 2026 Orbe</p>
      </footer>
    </div>
  );
}
