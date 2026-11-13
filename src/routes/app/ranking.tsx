import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy } from "lucide-react";
import { useConta } from "@/routes/app";
import { Cabecalho, Carregando, SeletorMes, Vazio } from "@/components/orbe/Comum";
import { useParceiros, useVendas } from "@/lib/conta";
import { brl, inicioDoMes, nomeDoMes } from "@/lib/orbe";

export const Route = createFileRoute("/app/ranking")({
  head: () => ({ meta: [{ title: "Ranking | ORBE" }] }),
  component: Ranking,
});

function Ranking() {
  const { sessao } = useConta();
  const uid = sessao.user.id;
  const [mes, setMes] = useState(inicioDoMes());
  const [por, setPor] = useState<"clientes" | "valor">("clientes");
  const parceiros = useParceiros(uid);
  const vendas = useVendas(uid, mes, mes);

  const linhas = (parceiros.data ?? [])
    .map((p) => {
      const v = vendas.data?.find((x) => x.parceiro_id === p.id);
      return { p, clientes: v?.clientes ?? 0, valor: v?.valor ?? 0 };
    })
    .sort((a, b) => b[por] - a[por] || (por === "clientes" ? b.valor - a.valor : b.clientes - a.clientes) || a.p.nome.localeCompare(b.p.nome));
  const comResultado = linhas.filter((l) => l.clientes > 0 || l.valor > 0);
  const podio = comResultado.slice(0, 3);
  const fmt = (n: number) => (por === "valor" ? brl(n) : `${n} ${n === 1 ? "cliente" : "clientes"}`);

  return (
    <div className="mx-auto max-w-5xl">
      <Cabecalho titulo="Ranking" descricao={`Quem mais trouxe resultado em ${nomeDoMes(mes).toLowerCase()}.`}>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-full border border-border bg-surface p-1" role="group" aria-label="Ordenar por">
            {(["clientes", "valor"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={por === k} onClick={() => setPor(k)} className={`min-h-10 rounded-full px-4 text-sm font-semibold ${por === k ? "bg-pink-soft" : ""}`}>{k === "clientes" ? "Clientes" : "Receita"}</button>
            ))}
          </div>
          <SeletorMes mes={mes} onMudar={setMes} />
        </div>
      </Cabecalho>

      <div className="mt-8">
        {parceiros.isLoading || vendas.isLoading ? <Carregando /> : comResultado.length === 0 ? (
          <Vazio titulo="Ainda sem resultados neste mês" texto="Lance os clientes e a receita de cada parceiro em Meus Parceiros para o ranking aparecer.">
            <Link to="/app/parceiros" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-semibold text-plum-foreground">Ir para Meus Parceiros</Link>
          </Vazio>
        ) : (
          <>
            <ol className="grid items-end gap-4 sm:grid-cols-3" aria-label="Pódio">
              {[1, 0, 2].map((i) => podio[i] && (
                <li key={podio[i].p.id} className={`rounded-[1.75rem] p-6 text-center ${i === 0 ? "bg-ink text-ink-foreground sm:pb-12 sm:pt-10" : "bg-pink-soft/70"} ${i === 0 ? "sm:order-2" : i === 1 ? "sm:order-1" : "sm:order-3"}`}>
                  <span className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${i === 0 ? "bg-pink text-white" : "bg-surface"}`}>{i === 0 ? <Trophy className="h-6 w-6" aria-hidden="true" /> : <span className="text-lg font-bold">{i + 1}º</span>}</span>
                  <p className="mt-3 text-sm font-medium opacity-80">{i + 1}º lugar</p>
                  <p className="mt-1 text-xl font-bold">{podio[i].p.nome}</p>
                  <p className="mt-1 font-semibold">{fmt(podio[i][por])}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-surface">
              <table className="w-full text-left">
                <caption className="sr-only">Ranking completo</caption>
                <thead className="border-b border-border text-sm text-muted-foreground">
                  <tr><th scope="col" className="w-16 px-5 py-3 font-medium">#</th><th scope="col" className="px-3 py-3 font-medium">Parceiro</th><th scope="col" className="px-3 py-3 text-right font-medium">Clientes</th><th scope="col" className="px-5 py-3 text-right font-medium">Receita</th></tr>
                </thead>
                <tbody>
                  {linhas.map((l, i) => (
                    <tr key={l.p.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-semibold">{l.clientes > 0 || l.valor > 0 ? `${i + 1}º` : "—"}</td>
                      <th scope="row" className="px-3 py-3 font-medium">{l.p.nome}</th>
                      <td className="px-3 py-3 text-right">{l.clientes}</td>
                      <td className="px-5 py-3 text-right">{brl(l.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
