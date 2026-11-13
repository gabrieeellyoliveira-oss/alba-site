import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, PauseCircle, UserPlus, Users } from "lucide-react";
import { useConta } from "@/routes/app";
import { Cabecalho, Carregando, Kpi, SeletorMes, Vazio } from "@/components/orbe/Comum";
import { useParceiros, useVendas } from "@/lib/conta";
import { brl, inicioDoMes, nomeDoMes, somarMeses, STATUS } from "@/lib/orbe";

export const Route = createFileRoute("/app/visao-geral")({
  head: () => ({ meta: [{ title: "Visão Geral | ORBE" }] }),
  component: VisaoGeral,
});

function variacao(atual: number, anterior: number) {
  if (!anterior) return atual ? "Primeiro mês com resultado" : "Sem resultado no mês anterior";
  const p = Math.round(((atual - anterior) / anterior) * 100);
  return `${p >= 0 ? "+" : ""}${p}% em relação ao mês anterior`;
}

function VisaoGeral() {
  const { sessao } = useConta();
  const uid = sessao.user.id;
  const [mes, setMes] = useState(inicioDoMes());
  const de = somarMeses(mes, -5);
  const parceiros = useParceiros(uid);
  const vendas = useVendas(uid, de, mes);

  if (parceiros.isLoading || vendas.isLoading) return <Carregando />;
  const ps = parceiros.data ?? [];
  const vs = vendas.data ?? [];
  const doMes = (m: string) => vs.filter((v) => v.mes === m);
  const soma = (arr: typeof vs, k: "clientes" | "valor") => arr.reduce((s, v) => s + v[k], 0);
  const atual = doMes(mes);
  const anterior = doMes(somarMeses(mes, -1));
  const ativos = ps.filter((p) => p.status === "ativo").length;
  const comResultado = new Set(atual.filter((v) => v.clientes > 0 || v.valor > 0).map((v) => v.parceiro_id));
  const semResultado = ps.filter((p) => p.status !== "parado" && !comResultado.has(p.id));
  const serie = Array.from({ length: 6 }, (_, i) => {
    const m = somarMeses(de, i);
    return { mes: nomeDoMes(m, true), clientes: soma(doMes(m), "clientes"), receita: soma(doMes(m), "valor") };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <Cabecalho titulo="Visão Geral" descricao="Os números da sua rede num relance.">
        <SeletorMes mes={mes} onMudar={setMes} />
      </Cabecalho>

      {ps.length === 0 ? (
        <div className="mt-8">
          <Vazio titulo="Sua rede ainda está vazia" texto="Cadastre seus parceiros e lance os resultados do mês para ver os números aqui.">
            <Link to="/app/parceiros" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-semibold text-plum-foreground">Cadastrar parceiros</Link>
          </Vazio>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi rotulo="Parceiros ativos" valor={`${ativos}`} detalhe={`de ${ps.length} cadastrados`} icone={<Users className="h-4 w-4" aria-hidden="true" />} />
            <Kpi rotulo="Clientes no mês" valor={`${soma(atual, "clientes")}`} detalhe={variacao(soma(atual, "clientes"), soma(anterior, "clientes"))} icone={<UserPlus className="h-4 w-4" aria-hidden="true" />} />
            <Kpi rotulo="Receita no mês" valor={brl(soma(atual, "valor"))} detalhe={variacao(soma(atual, "valor"), soma(anterior, "valor"))} icone={<DollarSign className="h-4 w-4" aria-hidden="true" />} />
            <Kpi rotulo="Sem resultado no mês" valor={`${semResultado.length}`} detalhe="parceiros não parados sem clientes lançados" icone={<PauseCircle className="h-4 w-4" aria-hidden="true" />} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <section className="rounded-[1.5rem] border border-border bg-surface p-5" aria-labelledby="g-titulo">
              <h2 id="g-titulo" className="font-semibold">Clientes trazidos pelos parceiros</h2>
              <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
              <div className="mt-4 h-64" role="img" aria-label={`Clientes por mês: ${serie.map((s) => `${s.mes} ${s.clientes}`).join(", ")}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serie} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip cursor={{ fill: "var(--lilac)" }} formatter={(v: number) => [v, "Clientes"]} contentStyle={{ borderRadius: 16, border: "1px solid var(--border)" }} />
                    <Bar dataKey="clientes" fill="var(--pink)" radius={[10, 10, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-border bg-surface p-5" aria-labelledby="s-titulo">
              <h2 id="s-titulo" className="font-semibold">Status da rede</h2>
              <ul className="mt-4 space-y-3">
                {Object.entries(STATUS).map(([k, s]) => {
                  const n = ps.filter((p) => p.status === k).length;
                  return (
                    <li key={k}>
                      <div className="flex justify-between text-sm"><span>{s.rotulo}</span><span className="font-semibold">{n}</span></div>
                      <div className="mt-1 h-2.5 rounded-full bg-lilac"><div className="h-full rounded-full bg-pink" style={{ width: `${ps.length ? (n / ps.length) * 100 : 0}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
              {semResultado.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-semibold">Sem resultado em {nomeDoMes(mes).toLowerCase()}</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {semResultado.slice(0, 8).map((p) => <li key={p.id} className="rounded-full bg-lilac px-3 py-1 text-sm">{p.nome}</li>)}
                    {semResultado.length > 8 && <li className="px-1 py-1 text-sm text-muted-foreground">+{semResultado.length - 8}</li>}
                  </ul>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
