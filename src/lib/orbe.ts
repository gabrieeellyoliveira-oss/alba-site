import { BarChart3, GraduationCap, Target, TriangleAlert, Trophy, Users, type LucideIcon } from "lucide-react";

export const MARCA = "Orbe";
export const SLOGAN = "Ecossistemas que crescem juntos.";
export const LIMITE_GRATUITO = 10;

/** Número do WhatsApp para assinar o Pro (DDI + DDD + número, só dígitos). Configure VITE_WHATSAPP na Vercel. */
export const WHATSAPP = (import.meta.env["VITE_WHATSAPP"] as string | undefined)?.replace(/\D/g, "") ?? "";

export function linkWhatsapp(email?: string | null, motivo: "pro" | "ajuda" = "pro") {
  if (!WHATSAPP) return null;
  const inicio = motivo === "pro" ? `Olá! Quero assinar o ${MARCA} Pro.` : `Olá! Preciso de ajuda com a ${MARCA}.`;
  const msg = `${inicio}${email ? ` Minha conta: ${email}` : ""}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export type Plano = "gratuito" | "pro";

export type Template = {
  id: string;
  nome: string;
  descricao: string;
  icone: LucideIcon;
  plano: Plano;
  rota?: "/app/parceiros" | "/app/ranking" | "/app/visao-geral";
};

export const TEMPLATES: Template[] = [
  { id: "parceiros", nome: "Meus Parceiros", descricao: "Cadastre sua rede, acompanhe o status de cada parceiro e lance os resultados do mês.", icone: Users, plano: "gratuito", rota: "/app/parceiros" },
  { id: "ranking", nome: "Ranking", descricao: "Veja quem mais trouxe clientes e receita no mês e quem está puxando o resultado.", icone: Trophy, plano: "gratuito", rota: "/app/ranking" },
  { id: "visao-geral", nome: "Visão Geral", descricao: "Os números da rede num relance: parceiros ativos, clientes, receita e evolução.", icone: BarChart3, plano: "gratuito", rota: "/app/visao-geral" },
  { id: "metas", nome: "Metas do Canal", descricao: "Defina metas do time e de cada pessoa e acompanhe o ritmo para bater o mês.", icone: Target, plano: "pro" },
  { id: "onboarding", nome: "Onboarding e Treinamentos", descricao: "Trilhas para o parceiro novo começar a vender mais rápido, com o progresso de cada um.", icone: GraduationCap, plano: "pro" },
  { id: "alertas", nome: "Alertas de Parceiros Parados", descricao: "Saiba na hora quem parou de vender ou está há dias sem o primeiro cliente.", icone: TriangleAlert, plano: "pro" },
];

export const STATUS: Record<string, { rotulo: string; classe: string }> = {
  onboarding: { rotulo: "Onboarding", classe: "bg-lilac text-foreground" },
  ativo: { rotulo: "Ativo", classe: "bg-pink-soft text-foreground" },
  parado: { rotulo: "Parado", classe: "bg-ink text-ink-foreground" },
};

/** Primeiro dia do mês em AAAA-MM-01. */
export function inicioDoMes(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function anoMes(mes: string): [number, number] {
  const [a = 1970, m = 1] = mes.split("-").map(Number);
  return [a, m];
}

export function somarMeses(mes: string, n: number) {
  const [a, m] = anoMes(mes);
  return inicioDoMes(new Date(a, m - 1 + n, 1));
}

export function nomeDoMes(mes: string, curto = false) {
  const [a, m] = anoMes(mes);
  const s = new Date(a, m - 1, 1).toLocaleDateString("pt-BR", curto ? { month: "short" } : { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1).replace(".", "");
}

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
