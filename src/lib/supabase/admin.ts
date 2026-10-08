import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isAdminConfigured = SERVICE_ROLE_KEY.length > 20;

/**
 * Service-role client for creating accounts on the server. Accounts made this way skip the
 * confirmation email and the per-IP sign-up limit, so a whole class can sign up on one Wi-Fi.
 * Bypasses row-level security: never import it from client code.
 */
export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}
