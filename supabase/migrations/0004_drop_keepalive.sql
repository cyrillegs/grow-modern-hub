-- 0004_drop_keepalive.sql
-- Drop the public.keepalive table introduced by 0002_keepalive.sql.
--
-- The dummy-table keepalive cron is replaced by .github/workflows/daily-smoke.yml,
-- which signs into /admin and clicks the Quotes tab — that fires a real SELECT
-- against public.quotes, which keeps the Supabase free-tier project warm
-- via genuine app activity (and doubles as a deployment smoke test).
--
-- DROP TABLE cascades to the row-level-security policy on the table, so no
-- separate drop policy statement is needed.

drop table if exists public.keepalive;
