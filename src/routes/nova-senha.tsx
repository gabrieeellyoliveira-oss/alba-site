import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/orbe/Logo";
import { mensagemDeErro, useSessao } from "@/lib/conta";

export const Route = createFileRoute("/nova-senha")({
  ssr: false,
  head: () => ({ meta: [{ title: "Nova senha | ORBE" }, { name: "robots", content: "noindex" }] }),
  component: NovaSenha,
});

/** Página aberta pelo link de "Esqueci minha senha": o link já entra na conta, aqui só se define a senha nova. */
function NovaSenha() {
  const sessao = useSessao();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) return setErro(mensagemDeErro(error));
    navigate({ to: "/app" });
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-8 pt-6 sm:px-8">
      <Logo />
      <main className="mx-auto mt-12 max-w-md rounded-[32px] bg-surface p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight">Crie uma senha nova</h1>
        {sessao === undefined ? (
          <p className="mt-4 flex items-center gap-2 text-muted-foreground" role="status"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Conferindo o link…</p>
        ) : sessao === null ? (
          <p className="mt-4 text-muted-foreground">Esse link expirou ou já foi usado. <Link to="/entrar" search={{ modo: "esqueci" }} className="font-semibold text-foreground underline">Peça um novo</Link>.</p>
        ) : (
          <form onSubmit={salvar} className="mt-6 flex flex-col gap-4">
            <label htmlFor="nova" className="text-sm font-medium">Senha nova</label>
            <input id="nova" type="password" autoComplete="new-password" minLength={6} required value={senha} onChange={(e) => setSenha(e.target.value)} className="-mt-2 h-[52px] rounded-full border-[1.5px] border-[#E6E2EA] bg-background px-5 outline-none focus:border-pink" />
            {erro && <p role="alert" className="rounded-2xl bg-pink-soft px-4 py-3 text-sm font-medium">{erro}</p>}
            <button type="submit" disabled={enviando} className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#141414] font-semibold text-white disabled:opacity-70">
              {enviando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />} Salvar e entrar {!enviando && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
