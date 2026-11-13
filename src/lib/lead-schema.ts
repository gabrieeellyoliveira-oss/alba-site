import { z } from "zod";

export const FAIXAS = ["Até 10", "11 a 30", "31 a 100", "Mais de 100"] as const;
export const PLANOS = ["Ainda não sei", "Gratuito", "Pro"] as const;

const opt = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

export const leadSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(255),
  empresa: z.string().trim().min(1, "Informe a empresa.").max(160),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Informe o WhatsApp no formato (00) 00000-0000."),
  faixa_parceiros: z.enum(FAIXAS, { errorMap: () => ({ message: "Escolha quantos parceiros vocês têm." }) }),
  plano_interesse: z.enum(PLANOS),
  como_acompanham: opt(1000),
  origem: opt(500),
  utm_source: opt(200),
  utm_medium: opt(200),
  utm_campaign: opt(200),
});

export type LeadInput = z.input<typeof leadSchema>;

export function maskWhatsapp(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
