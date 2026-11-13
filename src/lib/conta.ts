import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Plano } from "@/lib/orbe";

/** Sessão do Supabase no navegador. `undefined` enquanto carrega. */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    let vivo = true;
    supabase.auth.getSession().then(({ data }) => vivo && setSessao(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s));
    return () => {
      vivo = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return sessao;
}

export type Perfil = { id: string; nome: string | null; empresa: string | null; plano: Plano; templates: string[] };

export function usePerfil(userId: string | undefined) {
  return useQuery({
    queryKey: ["perfil", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Perfil> => {
      const { data, error } = await supabase.from("profiles").select("id, nome, empresa, plano, templates").eq("id", userId!).single();
      if (error) throw error;
      return data as Perfil;
    },
  });
}

export function useAtualizarPerfil() {
  const qc = useQueryClient();
  return async (userId: string, campos: Partial<Pick<Perfil, "nome" | "empresa" | "templates">>) => {
    const { error } = await supabase.from("profiles").update(campos).eq("id", userId);
    if (error) throw error;
    await qc.invalidateQueries({ queryKey: ["perfil", userId] });
  };
}

export type Parceiro = { id: string; nome: string; tipo: string | null; cidade: string | null; status: "onboarding" | "ativo" | "parado"; entrou_em: string };
export type Venda = { id: string; parceiro_id: string; mes: string; clientes: number; valor: number };

export function useParceiros(userId: string | undefined) {
  return useQuery({
    queryKey: ["parceiros", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Parceiro[]> => {
      const { data, error } = await supabase.from("parceiros").select("id, nome, tipo, cidade, status, entrou_em").order("nome");
      if (error) throw error;
      return (data ?? []) as Parceiro[];
    },
  });
}

/** Resultados de um intervalo de meses (inclusive), no formato AAAA-MM-01. */
export function useVendas(userId: string | undefined, de: string, ate: string) {
  return useQuery({
    queryKey: ["vendas", userId, de, ate],
    enabled: !!userId,
    queryFn: async (): Promise<Venda[]> => {
      const { data, error } = await supabase.from("vendas").select("id, parceiro_id, mes, clientes, valor").gte("mes", de).lte("mes", ate);
      if (error) throw error;
      return (data ?? []).map((v) => ({ ...v, valor: Number(v.valor) })) as Venda[];
    },
  });
}

/** Traduz erros do Supabase Auth/Postgres para mensagens em português. */
export function mensagemDeErro(e: unknown): string {
  const m = (e as { message?: string })?.message ?? String(e);
  if (m.includes("LIMITE_GRATUITO")) return "O plano gratuito permite até 10 parceiros. Assine o Pro para cadastrar mais.";
  if (/Invalid login credentials/i.test(m)) return "E-mail ou senha incorretos.";
  if (/User already registered/i.test(m)) return "Já existe uma conta com esse e-mail. Faça login.";
  if (/Email not confirmed/i.test(m)) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (/Password should be at least/i.test(m)) return "A senha precisa ter pelo menos 6 caracteres.";
  if (/rate limit/i.test(m)) return "Muitas tentativas seguidas. Espere um pouco e tente de novo.";
  if (/valid email|invalid format/i.test(m)) return "Informe um e-mail válido.";
  return "Algo deu errado. Tente de novo em instantes.";
}
