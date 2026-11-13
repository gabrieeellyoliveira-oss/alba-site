CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  empresa text NOT NULL CHECK (char_length(empresa) BETWEEN 1 AND 160),
  whatsapp text NOT NULL CHECK (char_length(whatsapp) BETWEEN 10 AND 20),
  faixa_parceiros text NOT NULL CHECK (faixa_parceiros IN ('Até 10','11 a 30','31 a 100','Mais de 100')),
  plano_interesse text NOT NULL CHECK (plano_interesse IN ('Ainda não sei','Essencial','Pro','Completo')),
  como_acompanham text CHECK (como_acompanham IS NULL OR char_length(como_acompanham) <= 1000),
  origem text CHECK (origem IS NULL OR char_length(origem) <= 500),
  utm_source text CHECK (utm_source IS NULL OR char_length(utm_source) <= 200),
  utm_medium text CHECK (utm_medium IS NULL OR char_length(utm_medium) <= 200),
  utm_campaign text CHECK (utm_campaign IS NULL OR char_length(utm_campaign) <= 200)
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitantes podem enviar leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);