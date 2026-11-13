import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useConta } from "@/routes/app";
import { Cabecalho, Carregando, SeletorMes, Vazio } from "@/components/orbe/Comum";
import { mensagemDeErro, useParceiros, useVendas, type Parceiro, type Venda } from "@/lib/conta";
import { inicioDoMes, LIMITE_GRATUITO, STATUS } from "@/lib/orbe";

export const Route = createFileRoute("/app/parceiros")({
  head: () => ({ meta: [{ title: "Meus Parceiros | Orbe" }] }),
  component: MeusParceiros,
});

function MeusParceiros() {
  const { sessao, perfil, abrirPro } = useConta();
  const uid = sessao.user.id;
  const qc = useQueryClient();
  const [mes, setMes] = useState(inicioDoMes());
  const parceiros = useParceiros(uid);
  const vendas = useVendas(uid, mes, mes);
  const [erro, setErro] = useState<string | null>(null);

  const total = parceiros.data?.length ?? 0;
  const noLimite = perfil.plano !== "pro" && total >= LIMITE_GRATUITO;
  const recarregar = () => Promise.all([qc.invalidateQueries({ queryKey: ["parceiros", uid] }), qc.invalidateQueries({ queryKey: ["vendas", uid] })]);

  return (
    <div className="mx-auto max-w-6xl">
      <Cabecalho titulo="Meus Parceiros" descricao="Cadastre sua rede e lance os resultados de cada mês.">
        <SeletorMes mes={mes} onMudar={setMes} />
      </Cabecalho>

      <NovoParceiro uid={uid} bloqueado={noLimite} onCriado={recarregar} onErro={setErro} />
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        {perfil.plano === "pro" ? `${total} parceiros cadastrados` : `${total} de ${LIMITE_GRATUITO} parceiros do plano gratuito`}
        {noLimite && (<> · <button type="button" onClick={abrirPro} className="font-semibold text-pink underline-offset-4 hover:underline">Assine o Pro para cadastrar mais</button></>)}
      </p>
      {erro && <p role="alert" className="mt-3 rounded-2xl bg-pink-soft px-4 py-3 text-sm font-medium">{erro}</p>}

      <div className="mt-6">
        {parceiros.isLoading || vendas.isLoading ? <Carregando /> : total === 0 ? (
          <Vazio titulo="Nenhum parceiro ainda" texto="Cadastre o primeiro parceiro no formulário acima. Depois é só lançar os clientes e a receita de cada mês." />
        ) : (
          <div className="overflow-x-auto rounded-[1.5rem] border border-border bg-surface">
            <table className="w-full min-w-[46rem] text-left">
              <caption className="sr-only">Parceiros e resultados do mês</caption>
              <thead className="border-b border-border text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Parceiro</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                  <th scope="col" className="px-3 py-3 font-medium">Clientes no mês</th>
                  <th scope="col" className="px-3 py-3 font-medium">Receita no mês (R$)</th>
                  <th scope="col" className="px-3 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {parceiros.data!.map((p) => (
                  <Linha key={`${p.id}-${mes}`} p={p} mes={mes} venda={vendas.data?.find((v) => v.parceiro_id === p.id)} onMudou={recarregar} onErro={setErro} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function NovoParceiro({ uid, bloqueado, onCriado, onErro }: { uid: string; bloqueado: boolean; onCriado: () => Promise<unknown>; onErro: (e: string | null) => void }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState<Parceiro["status"]>("onboarding");
  const [salvando, setSalvando] = useState(false);

  async function criar(e: FormEvent) {
    e.preventDefault();
    onErro(null);
    if (!nome.trim()) return onErro("Informe o nome do parceiro.");
    setSalvando(true);
    const { error } = await supabase.from("parceiros").insert({ user_id: uid, nome: nome.trim(), tipo: tipo.trim() || null, cidade: cidade.trim() || null, status });
    setSalvando(false);
    if (error) return onErro(mensagemDeErro(error));
    setNome(""); setTipo(""); setCidade(""); setStatus("onboarding");
    await onCriado();
  }

  const campo = "min-h-12 rounded-2xl border border-input bg-surface px-4 outline-none focus:border-pink";
  return (
    <form onSubmit={criar} className="mt-8 grid gap-3 rounded-[1.5rem] bg-lilac/60 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_auto]" aria-label="Novo parceiro">
      <label className="grid gap-1 text-sm font-medium">Nome do parceiro<input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} required disabled={bloqueado} /></label>
      <label className="grid gap-1 text-sm font-medium">Tipo (opcional)<input className={campo} value={tipo} onChange={(e) => setTipo(e.target.value)} maxLength={60} placeholder="Revenda, agência…" disabled={bloqueado} /></label>
      <label className="grid gap-1 text-sm font-medium">Cidade (opcional)<input className={campo} value={cidade} onChange={(e) => setCidade(e.target.value)} maxLength={80} disabled={bloqueado} /></label>
      <label className="grid gap-1 text-sm font-medium">Status
        <select className={campo} value={status} onChange={(e) => setStatus(e.target.value as Parceiro["status"])} disabled={bloqueado}>
          {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.rotulo}</option>)}
        </select>
      </label>
      <button type="submit" disabled={salvando || bloqueado} className="flex min-h-12 items-center justify-center gap-2 self-end rounded-full bg-plum px-5 font-semibold text-plum-foreground disabled:opacity-60">
        {salvando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />} Adicionar
      </button>
    </form>
  );
}

function Linha({ p, mes, venda, onMudou, onErro }: { p: Parceiro; mes: string; venda?: Venda; onMudou: () => Promise<unknown>; onErro: (e: string | null) => void }) {
  const [clientes, setClientes] = useState(String(venda?.clientes ?? ""));
  const [valor, setValor] = useState(venda ? String(venda.valor) : "");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  useEffect(() => { setClientes(String(venda?.clientes ?? "")); setValor(venda ? String(venda.valor) : ""); }, [venda]);

  const mudou = (clientes || "0") !== String(venda?.clientes ?? 0) || Number(valor || 0) !== Number(venda?.valor ?? 0);

  async function salvarResultado() {
    onErro(null);
    const c = Math.max(0, Math.floor(Number(clientes || 0)));
    const v = Math.max(0, Number(String(valor || 0).replace(",", ".")));
    if (!Number.isFinite(c) || !Number.isFinite(v)) return onErro("Use só números nos resultados.");
    setSalvando(true);
    const { error } = await supabase.from("vendas").upsert({ parceiro_id: p.id, mes, clientes: c, valor: v }, { onConflict: "parceiro_id,mes" });
    setSalvando(false);
    if (error) return onErro(mensagemDeErro(error));
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1800);
    await onMudou();
  }

  async function mudarStatus(status: string) {
    onErro(null);
    const { error } = await supabase.from("parceiros").update({ status }).eq("id", p.id);
    if (error) return onErro(mensagemDeErro(error));
    await onMudou();
  }

  async function apagar() {
    if (!window.confirm(`Apagar ${p.nome} e todos os resultados lançados? Não dá para desfazer.`)) return;
    const { error } = await supabase.from("parceiros").delete().eq("id", p.id);
    if (error) return onErro(mensagemDeErro(error));
    await onMudou();
  }

  const num = "h-11 w-28 rounded-xl border border-input bg-surface px-3 outline-none focus:border-pink";
  return (
    <tr className="border-b border-border last:border-0">
      <th scope="row" className="px-5 py-3 font-semibold">
        {p.nome}
        <span className="block text-sm font-normal text-muted-foreground">{[p.tipo, p.cidade].filter(Boolean).join(" · ") || "—"}</span>
      </th>
      <td className="px-3 py-3">
        <select aria-label={`Status de ${p.nome}`} value={p.status} onChange={(e) => mudarStatus(e.target.value)} className={`h-10 rounded-full border-0 px-3 text-sm font-semibold ${STATUS[p.status].classe}`}>
          {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.rotulo}</option>)}
        </select>
      </td>
      <td className="px-3 py-3"><input aria-label={`Clientes de ${p.nome} no mês`} inputMode="numeric" className={num} value={clientes} onChange={(e) => setClientes(e.target.value.replace(/\D/g, ""))} placeholder="0" /></td>
      <td className="px-3 py-3"><input aria-label={`Receita de ${p.nome} no mês`} inputMode="decimal" className={num} value={valor} onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="0" /></td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={salvarResultado} disabled={!mudou || salvando} className="flex min-h-10 items-center gap-1.5 rounded-full bg-plum px-4 text-sm font-semibold text-plum-foreground disabled:bg-lilac disabled:text-muted-foreground">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : salvo ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
            {salvo ? "Salvo" : "Salvar"}
          </button>
          <button type="button" onClick={apagar} aria-label={`Apagar ${p.nome}`} className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-lilac hover:text-foreground"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </td>
    </tr>
  );
}
