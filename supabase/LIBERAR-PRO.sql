-- Liberar o plano Pro para um cliente (rodar no SQL Editor da Supabase)
update public.profiles set plano = 'pro'
where id = (select id from auth.users where email = 'EMAIL_DO_CLIENTE@exemplo.com');

-- Voltar para o gratuito:
-- update public.profiles set plano = 'gratuito'
-- where id = (select id from auth.users where email = 'EMAIL_DO_CLIENTE@exemplo.com');
