import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { FAIXAS, PLANOS, leadSchema, maskWhatsapp } from "@/lib/lead-schema";
import { submitLead } from "@/lib/leads.functions";

type Errors = Partial<Record<string, string>>;
const field = "mt-1.5 block w-full min-h-12 rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/30 aria-[invalid=true]:border-destructive";
const label = "block text-sm font-medium text-foreground";

export function LeadForm({ plano, setPlano }: { plano: string; setPlano: (p: string) => void }) {
  const send = useServerFn(submitLead);
  const [whats, setWhats] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "fail">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const payload = {
      nome: String(fd.get("nome") ?? ""),
      email: String(fd.get("email") ?? ""),
      empresa: String(fd.get("empresa") ?? ""),
      whatsapp: whats,
      faixa_parceiros: String(fd.get("faixa_parceiros") ?? ""),
      plano_interesse: plano,
      como_acompanham: String(fd.get("como_acompanham") ?? ""),
      origem: (window.location.pathname + window.location.search).slice(0, 500),
      utm_source: params.get("utm_source")?.slice(0, 200) ?? "",
      utm_medium: params.get("utm_medium")?.slice(0, 200) ?? "",
      utm_campaign: params.get("utm_campaign")?.slice(0, 200) ?? "",
    };
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      await send({ data: payload });
      setStatus("done");
    } catch {
      setStatus("fail");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-[2rem] bg-surface p-8 text-foreground sm:p-10" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-pink-soft"><Check className="h-7 w-7" aria-hidden="true" /></span>
        <p className="mt-6 text-2xl font-semibold leading-snug">Recebemos seu pedido! Vamos te chamar no WhatsApp em até 1 dia útil para marcar a demonstração.</p>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? <p id={`e-${k}`} className="mt-1.5 text-sm font-medium text-destructive">{errors[k]}</p> : null;
  const aria = (k: string) => ({ id: `f-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[2rem] bg-surface p-6 text-foreground sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="f-nome" className={label}>Nome *</label><input name="nome" autoComplete="name" maxLength={120} required className={field} {...aria("nome")} />{err("nome")}</div>
        <div><label htmlFor="f-email" className={label}>E-mail de trabalho *</label><input name="email" type="email" autoComplete="email" maxLength={255} required className={field} {...aria("email")} />{err("email")}</div>
        <div><label htmlFor="f-empresa" className={label}>Empresa *</label><input name="empresa" autoComplete="organization" maxLength={160} required className={field} {...aria("empresa")} />{err("empresa")}</div>
        <div><label htmlFor="f-whatsapp" className={label}>WhatsApp *</label><input name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(00) 00000-0000" value={whats} onChange={(e) => setWhats(maskWhatsapp(e.target.value))} required className={field} {...aria("whatsapp")} />{err("whatsapp")}</div>
        <div><label htmlFor="f-faixa_parceiros" className={label}>Quantos parceiros vocês têm hoje? *</label>
          <select name="faixa_parceiros" defaultValue="" className={field} {...aria("faixa_parceiros")}>
            <option value="" disabled>Selecione</option>{FAIXAS.map((f) => <option key={f}>{f}</option>)}
          </select>{err("faixa_parceiros")}</div>
        <div><label htmlFor="f-plano_interesse" className={label}>Plano de interesse</label>
          <select name="plano_interesse" value={plano} onChange={(e) => setPlano(e.target.value)} className={field} {...aria("plano_interesse")}>
            {PLANOS.map((p) => <option key={p}>{p}</option>)}
          </select></div>
        <div className="sm:col-span-2"><label htmlFor="f-como_acompanham" className={label}>Como vocês acompanham os parceiros hoje? <span className="font-normal text-muted-foreground">(opcional)</span></label>
          <textarea name="como_acompanham" rows={3} maxLength={1000} className={field} {...aria("como_acompanham")} />{err("como_acompanham")}</div>
      </div>
      {Object.keys(errors).length > 0 && <p className="mt-5 rounded-2xl bg-pink-soft px-4 py-3 text-sm font-medium" role="alert">Confira os campos destacados antes de enviar.</p>}
      {status === "fail" && <p className="mt-5 rounded-2xl bg-pink-soft px-4 py-3 text-sm font-medium" role="alert">Não conseguimos enviar seu pedido agora. Verifique sua conexão e tente de novo.</p>}
      <button type="submit" disabled={status === "sending"} className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-pink px-7 py-4 text-base font-semibold text-pink-foreground transition hover:brightness-95 disabled:opacity-70 sm:w-auto">
        {status === "sending" && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
        {status === "sending" ? "Enviando..." : "Agendar demonstração"}
      </button>
    </form>
  );
}
