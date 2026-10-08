-- Activation now runs on the server (register number + department + name must all match), so the
-- browser must not be able to look up a volunteer's name from a register number on its own.
revoke execute on function public.lookup_volunteer(text) from public, anon, authenticated;
grant execute on function public.lookup_volunteer(text) to service_role;
