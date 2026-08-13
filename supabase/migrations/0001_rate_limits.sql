-- Lot 5.1 — Rate limiting partagé (nécessaire car le déploiement Vercel est
-- serverless/multi-instance : un compteur en mémoire applicative ne serait
-- pas fiable). Aucune IP brute n'est stockée : `key` est un HMAC-SHA256
-- opaque de (type de limite + IP), calculé côté application avec un secret
-- serveur (voir lib/rate-limit.ts).
--
-- À EXÉCUTER MANUELLEMENT dans Supabase (SQL Editor du dashboard), une seule
-- fois. Ce fichier n'est PAS exécuté automatiquement par l'application.

create table if not exists rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

-- RLS activée sans aucune policy : refuse tout accès à `anon`/`authenticated`.
-- Seul le client service_role (qui contourne RLS par nature) peut lire/écrire
-- cette table — exactement ce que fait lib/rate-limit.ts.
alter table rate_limits enable row level security;

-- Fonction atomique : incrémente le compteur pour `p_key` en une seule
-- opération SQL (INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING).
-- PostgreSQL verrouille la ligne concernée pendant cette opération, donc deux
-- requêtes concurrentes sur la même clé ne peuvent pas toutes les deux lire
-- l'ancien compteur puis écrire "+1" en se marchant dessus : l'atomicité est
-- garantie par le moteur, pas par un verrou applicatif.
--
-- Comportement :
--   - Si la fenêtre précédente est expirée (window_start trop ancien),
--     le compteur repart à 1 avec une nouvelle fenêtre.
--   - Sinon, le compteur est incrémenté dans la fenêtre en cours.
--   - `allowed = false` dès que le compteur dépasse p_max_count ; dans ce
--     cas, `retry_after_seconds` indique le temps restant avant la fin de
--     la fenêtre en cours.
create or replace function check_rate_limit(
  p_key text,
  p_max_count integer,
  p_window_seconds integer
) returns table(allowed boolean, retry_after_seconds integer) as $$
declare
  v_now timestamptz := now();
  v_count integer;
  v_window_start timestamptz;
begin
  insert into rate_limits (key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set count = case
          when rate_limits.window_start <= v_now - make_interval(secs => p_window_seconds)
            then 1
          else rate_limits.count + 1
        end,
        window_start = case
          when rate_limits.window_start <= v_now - make_interval(secs => p_window_seconds)
            then v_now
          else rate_limits.window_start
        end
  returning rate_limits.count, rate_limits.window_start into v_count, v_window_start;

  if v_count > p_max_count then
    return query select
      false,
      greatest(0, p_window_seconds - extract(epoch from (v_now - v_window_start))::integer);
  else
    return query select true, 0;
  end if;
end;
$$ language plpgsql;

-- Nettoyage optionnel (facultatif, à exécuter ponctuellement si la table
-- grossit avec le temps — pas nécessaire pour le volume de ce site) :
-- delete from rate_limits where window_start < now() - interval '1 day';
