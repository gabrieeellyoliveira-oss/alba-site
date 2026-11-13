import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Perfil } from "@/lib/conta";

/**
 * Conta logada, compartilhada pela área do cliente.
 * Fica num módulo próprio (e não em src/routes/app.tsx) porque o code-splitting do
 * TanStack Router copia o componente da rota para outro chunk: um contexto criado
 * no arquivo da rota viraria duas instâncias e os templates não achariam a conta.
 */
export type ContaCtxValor = { sessao: Session; perfil: Perfil; abrirPro: () => void };

export const ContaCtx = createContext<ContaCtxValor | null>(null);

export function useConta() {
  const c = useContext(ContaCtx);
  if (!c) throw new Error("useConta fora da área do cliente");
  return c;
}
