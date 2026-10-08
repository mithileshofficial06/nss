"use server";

import { getSettings } from "@/lib/data";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEPARTMENTS, namesMatch } from "@/lib/utils";

export type SignUpResult = { ok: true } | { ok: false; message: string };

type Activate = { register_no: string; department: string; full_name: string; email: string; password: string };
type Register = Activate & { batch_id: string; phone: string };

const fail = (message: string): SignUpResult => ({ ok: false, message });
const clean = (s: unknown) => (typeof s === "string" ? s.trim() : "");

/** Checks shared by both tabs; returns an error message or null. */
async function precheck(email: string, password: string) {
  if (!isSupabaseConfigured || !isAdminConfigured) return "Sign-up isn't connected yet. Please tell the NSS team.";
  if (!(await getSettings()).registration_open) return "Registrations are closed right now.";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email";
  if (password.length < 8) return "Password needs at least 8 characters";
  return null;
}

/** The volunteer still waiting to activate under this register number, or null. */
async function unclaimed(registerNo: string) {
  const { data } = await createAdminClient().rpc("lookup_volunteer", { p_register_no: registerNo });
  return ((data as { full_name: string; department: string | null }[] | null) ?? [])[0] ?? null;
}

/**
 * Creates a confirmed account straight away: no confirmation email. The handle_new_user trigger
 * attaches it to the roster record with the same register number, or creates a new profile.
 */
async function createAccount(email: string, password: string, metadata: Record<string, string>): Promise<SignUpResult> {
  const { error } = await createAdminClient().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: metadata });
  if (!error) return { ok: true };
  if (/already|exists/i.test(error.message)) return fail("That email already has an account. Log in instead.");
  // The trigger's insert fails when the register number already belongs to an account
  if (/database error/i.test(error.message)) return fail("That register number is already registered. Log in instead.");
  return fail(error.message);
}

/**
 * "Already a volunteer": register number, department and name must all match a record the NSS
 * team imported that has no account yet. Then the record gets this email and password.
 */
export async function activateVolunteer(input: Activate): Promise<SignUpResult> {
  const reg = clean(input.register_no).toUpperCase();
  const department = clean(input.department);
  const name = clean(input.full_name);
  const email = clean(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";

  const problem = await precheck(email, password);
  if (problem) return fail(problem);
  if (!reg || !department || !name) return fail("Fill in your register number, department and name");

  const record = await unclaimed(reg);
  if (!record || record.department !== department || !namesMatch(name, record.full_name)) {
    return fail("These details don't match any volunteer waiting to activate. Check your register number, department and name as in college records. Already activated? Log in instead.");
  }
  return createAccount(email, password, { register_no: reg });
}

/** "New volunteer": anyone not on the imported list. */
export async function registerVolunteer(input: Register): Promise<SignUpResult> {
  const reg = clean(input.register_no).toUpperCase();
  const department = clean(input.department);
  const email = clean(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";

  const problem = await precheck(email, password);
  if (problem) return fail(problem);
  if (clean(input.full_name).length < 2 || !reg || !clean(input.batch_id)) return fail("Fill in all the required details");
  if (!(DEPARTMENTS as readonly string[]).includes(department)) return fail("Pick your department");

  // Otherwise signing up here would claim an imported record without the name check
  if (await unclaimed(reg)) return fail("You're already on the NSS volunteer list. Use the \"Already a volunteer\" tab to activate your account.");

  return createAccount(email, password, {
    full_name: clean(input.full_name),
    register_no: reg,
    department,
    batch_id: clean(input.batch_id),
    phone: clean(input.phone),
  });
}
