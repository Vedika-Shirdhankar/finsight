revoke all on function public.has_role(uuid, public.app_role) from public;
revoke all on function public.has_role(uuid, public.app_role) from anon;
revoke all on function public.has_role(uuid, public.app_role) from authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to service_role;

revoke all on function public.update_updated_at_column() from public;
revoke all on function public.update_updated_at_column() from anon;
revoke all on function public.update_updated_at_column() from authenticated;
grant execute on function public.update_updated_at_column() to service_role;