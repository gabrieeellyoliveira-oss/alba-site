import { useEffect, useRef } from "react";
import { Check, Gem, MessageCircle, X } from "lucide-react";
import { LIMITE_GRATUITO, linkWhatsapp } from "@/lib/orbe";

export const ITENS_GRATUITO = [`Até ${LIMITE_GRATUITO} parceiros`, "Meus Parceiros, Ranking e Visão Geral", "Acesso pelo navegador"];
export const ITENS_PRO = ["Tudo do plano gratuito", "Parceiros ilimitados", "Metas do Canal, Onboarding e Treinamentos", "Alertas de parceiros parados", "Suporte prioritário"];

/** Modal do plano Pro: a assinatura é combinada pelo WhatsApp e o Pro é liberado à mão. */
export function ProModal({ aberto, onFechar, email }: { aberto: boolean; onFechar: () => void; email?: string | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  const link = linkWhatsapp(email);

  return (
    <dialog
      ref={ref}
      onClose={onFechar}
      onClick={(e) => e.target === ref.current && onFechar()}
      aria-labelledby="pro-titulo"
      className="m-auto w-[min(92vw,30rem)] rounded-[2rem] bg-surface p-0 text-foreground shadow-soft backdrop:bg-ink/40"
    >
      <div className="relative p-7 sm:p-8">
        <button type="button" onClick={onFechar} aria-label="Fechar" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full hover:bg-lilac">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pink-soft text-pink"><Gem className="h-6 w-6" aria-hidden="true" /></span>
        <h2 id="pro-titulo" className="mt-5 text-2xl font-bold">Plano Pro</h2>
        <p className="mt-1 text-muted-foreground">Tudo o que você precisa para levar sua rede mais longe.</p>
        <ul className="mt-5 space-y-2.5">
          {ITENS_PRO.map((i) => (
            <li key={i} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-pink" aria-hidden="true" />{i}</li>
          ))}
        </ul>
        {link ? (
          <>
            <a href={link} target="_blank" rel="noopener noreferrer" className="mt-7 flex min-h-12 items-center justify-center gap-2 rounded-full bg-plum px-6 font-semibold text-plum-foreground transition hover:-translate-y-0.5">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Assinar pelo WhatsApp
            </a>
            <p className="mt-3 text-center text-sm text-muted-foreground">A gente combina o pagamento por lá e libera o Pro na sua conta.</p>
          </>
        ) : (
          <p className="mt-7 rounded-2xl bg-lilac p-4 text-center text-sm">A assinatura do Pro abre em breve. Enquanto isso, aproveite o plano gratuito.</p>
        )}
      </div>
    </dialog>
  );
}
