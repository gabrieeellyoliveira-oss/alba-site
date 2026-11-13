import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { inicioDoMes, nomeDoMes, somarMeses } from "@/lib/orbe";

export function Cabecalho({ titulo, descricao, children }: { titulo: string; descricao: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{titulo}</h1>
        <p className="mt-1 text-muted-foreground">{descricao}</p>
      </div>
      {children}
    </div>
  );
}

export function SeletorMes({ mes, onMudar }: { mes: string; onMudar: (m: string) => void }) {
  const atual = inicioDoMes();
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1" role="group" aria-label="Mês">
      <button type="button" onClick={() => onMudar(somarMeses(mes, -1))} aria-label="Mês anterior" className="grid h-10 w-10 place-items-center rounded-full hover:bg-lilac"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
      <span className="min-w-36 text-center font-semibold" aria-live="polite">{nomeDoMes(mes)}</span>
      <button type="button" onClick={() => onMudar(somarMeses(mes, 1))} disabled={mes >= atual} aria-label="Próximo mês" className="grid h-10 w-10 place-items-center rounded-full hover:bg-lilac disabled:opacity-30"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  );
}

export function Carregando() {
  return <div className="grid place-items-center py-20" role="status"><Loader2 className="h-7 w-7 animate-spin text-pink" aria-label="Carregando" /></div>;
}

export function Vazio({ titulo, texto, children }: { titulo: string; texto: string; children?: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-surface px-6 py-14 text-center">
      <p className="text-lg font-semibold">{titulo}</p>
      <p className="mx-auto mt-1 max-w-md text-muted-foreground">{texto}</p>
      {children}
    </div>
  );
}

export function Kpi({ rotulo, valor, detalhe, icone }: { rotulo: string; valor: string; detalhe?: string; icone: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-surface p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">{rotulo}<span className="grid h-9 w-9 place-items-center rounded-full bg-pink-soft text-pink">{icone}</span></div>
      <p className="mt-2 text-3xl font-bold">{valor}</p>
      {detalhe && <p className="mt-1 text-sm text-muted-foreground">{detalhe}</p>}
    </div>
  );
}
