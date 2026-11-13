import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useConta } from "@/routes/app";
import { Cabecalho, Vazio } from "@/components/orbe/Comum";
import { useAtualizarPerfil } from "@/lib/conta";
import { TEMPLATES } from "@/lib/orbe";

export const Route = createFileRoute("/app/dashboards")({
  head: () => ({ meta: [{ title: "Meus Dashboards | Orbe" }] }),
  component: MeusDashboards,
});

function MeusDashboards() {
  const { sessao, perfil } = useConta();
  const atualizar = useAtualizarPerfil();
  const meus = TEMPLATES.filter((t) => t.rota && perfil.templates.includes(t.id));

  return (
    <div className="mx-auto max-w-5xl">
      <Cabecalho titulo="Meus Dashboards" descricao="Os templates que você escolheu, prontos para abrir." />
      <div className="mt-8">
        {meus.length === 0 ? (
          <Vazio titulo="Você ainda não escolheu nenhum template" texto="Escolha um template na página inicial e ele aparece aqui.">
            <Link to="/app" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-plum px-5 font-semibold text-plum-foreground">Escolher templates</Link>
          </Vazio>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meus.map((t) => {
              const Icone = t.icone;
              return (
                <li key={t.id} className="flex flex-col rounded-[1.5rem] border border-border bg-surface p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pink-soft text-pink"><Icone className="h-5 w-5" aria-hidden="true" /></span>
                  <h2 className="mt-4 text-lg font-semibold">{t.nome}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.descricao}</p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Link to={t.rota!} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-plum px-5 text-sm font-semibold text-plum-foreground">Abrir <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    <button type="button" onClick={() => atualizar(sessao.user.id, { templates: perfil.templates.filter((x) => x !== t.id) })} className="min-h-11 rounded-full px-3 text-sm text-muted-foreground hover:bg-lilac hover:text-foreground">Remover da lista</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
