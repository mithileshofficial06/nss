import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Target of the email-confirmation link. Exchanges the code, then sends the student to login. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    // Per the brief, registration always ends at the login page
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(`${origin}/login?confirmed=1`);
}
