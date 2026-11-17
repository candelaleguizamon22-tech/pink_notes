-- Configuración de seguridad para la tabla "tareas" en Supabase.
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query > Run.
-- Es seguro volver a ejecutarlo: solo crea las políticas si faltan.

alter table public.tareas enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'tareas' and policyname = 'tareas_select_own'
    ) then
        create policy tareas_select_own on public.tareas
            for select to authenticated
            using (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'tareas' and policyname = 'tareas_insert_own'
    ) then
        create policy tareas_insert_own on public.tareas
            for insert to authenticated
            with check (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'tareas' and policyname = 'tareas_update_own'
    ) then
        create policy tareas_update_own on public.tareas
            for update to authenticated
            using (auth.uid() = user_id)
            with check (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'tareas' and policyname = 'tareas_delete_own'
    ) then
        create policy tareas_delete_own on public.tareas
            for delete to authenticated
            using (auth.uid() = user_id);
    end if;
end $$;
